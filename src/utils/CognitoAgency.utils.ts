// CognitoAgency.utils.ts (drop-in, no Amplify)
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import secureStorage from './SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import { BehaviorSubject } from 'rxjs';

interface IUser { email: string; password: string; }
interface AuthResponse<T = any> { response?: T; error?: any; }

const AGENCY_USER_POOL_ID = import.meta.env.APP_AGENCY_COGNITO_USER_POOL_ID as string;
const AGENCY_CLIENT_ID   = import.meta.env.APP_AGENCY_COGNITO_CLIENT_ID as string;

// namespaced storage keys so agency never collides with Amplify’s keys
const ACCESS_KEY   = SecureStorageKeyEnum.AGENCY_ACCESSTOKEN;     // or 'agency:accessToken'
const USERID_KEY   = SecureStorageKeyEnum.AGENCY_COGNITOUSERID;   // or 'agency:userId'
const GROUPS_KEY   = SecureStorageKeyEnum.AGENCY_USERGROUPS;      // or 'agency:groups'

const userPool = new CognitoUserPool({
  UserPoolId: AGENCY_USER_POOL_ID,
  ClientId: AGENCY_CLIENT_ID,
  // Optional: provide a custom Storage impl if you want to fully isolate keys further
});

class CognitoAgencyService {
  private auth$ = new BehaviorSubject<boolean>(false);

  // SIGN IN (agency pool only; no Amplify)
  public async handleSignIn(user: IUser): Promise<AuthResponse<CognitoUserSession>> {
    const username = (user.email || '').trim().toLowerCase();
    const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
    const auth = new AuthenticationDetails({ Username: username, Password: user.password });

    return new Promise((resolve) => {
      cognitoUser.authenticateUser(auth, {
        onSuccess: (session) => {
          // persist agency-scoped data
          const access = session.getAccessToken().getJwtToken();
          const idPayload = session.getIdToken().decodePayload() || {};
          secureStorage.setItem(ACCESS_KEY, access);
          if (idPayload?.sub) secureStorage.setItem(USERID_KEY, idPayload.sub);
          if (Array.isArray(idPayload['cognito:groups'])) {
            secureStorage.setItem(GROUPS_KEY, idPayload['cognito:groups']);
          }
          this.auth$.next(true);
          resolve({ response: session });
        },
        onFailure: (error) => resolve({ error }),
        newPasswordRequired: () => resolve({ error: { name: 'NEW_PASSWORD_REQUIRED' } }),
        mfaRequired: () => resolve({ error: { name: 'MFA_REQUIRED' } }),
      });
    });
  }

  // CHECK (agency session only)
  public async isSignedIn(): Promise<boolean> {
    const user = userPool.getCurrentUser();
    if (!user) return false;
    return new Promise((res) => {
      user.getSession((err:any, session:any) => res(!err && !!session && session.isValid()));
    });
  }

  // IMPORTANT: sync getter so your HTTP header builder can use it directly
  public getAccessToken(): string {
    // Prefer our secureStorage copy
    const token = secureStorage.getItem<string>(ACCESS_KEY);
    if (token) return token;

    // Fallback: read from Cognito JS storage format (scoped to this clientId)
    const prefix = `CognitoIdentityServiceProvider.${AGENCY_CLIENT_ID}.`;
    const lastUser = localStorage.getItem(`${prefix}LastAuthUser`);
    if (!lastUser) return '';
    return localStorage.getItem(`${prefix}${lastUser}.accessToken`) || '';
  }

  // SIGN OUT (agency only; does NOT touch Amplify)
  public async handleSignOut(): Promise<void> {
    const user = userPool.getCurrentUser();
    user?.signOut();
    secureStorage.remove(ACCESS_KEY);
    secureStorage.remove(USERID_KEY);
    secureStorage.remove(GROUPS_KEY);
    this.auth$.next(false);
  }
}

const CognitoAgencyServiceObj = new CognitoAgencyService();
export default CognitoAgencyServiceObj;
