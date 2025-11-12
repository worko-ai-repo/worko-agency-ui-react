// @Context/AgencyApp.context.tsx — EXACT same public API as corporate AppProvider

import { JwtPayload } from "jwt-decode";
import { fetchAuthSession } from "@aws-amplify/auth";
import CognitoAgencyServiceObj from "@Utils/CognitoAgency.utils";
import secureStorage from "@Utils/SecureStorage.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo } from "react";

export interface AgencyUserDetail {
  id: string;
  companyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  cognitoUserId?: string;
  PK?: string;
  SK?: string;
  GSI1PK?: string;
  GSI1SK?: string;
}

export interface AgencyCognitoMeta extends JwtPayload {
  "cognito:groups"?: string[];
  email?: string;
  sub?: string;
}

type AppContextType_Agency = {
  // === EXACT same names as corporate ===
  isLoggedIn: boolean;
  tokenData: any | null;
  setAuthState: (data: any, loggedIn: boolean) => void;
  setUpdateCheck: React.Dispatch<React.SetStateAction<boolean>>;
  userDetails: AgencyUserDetail | null;
  PendingApply: any | null;
  setPendingApply: React.Dispatch<React.SetStateAction<any | null>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingUserDetails: boolean;
  setUserDetails: React.Dispatch<React.SetStateAction<AgencyUserDetail | null>>;
  fetchCorporateCompanyDetails: () => Promise<any | null>; // name kept IDENTICAL on purpose
};

export const AppContext_Agency = createContext<AppContextType_Agency | undefined>(undefined);

export const AppProvider_Agency = ({ children }: { children: React.ReactNode }) => {
  // === same state names ===
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [tokenData, setTokenData] = useState<any | null>(null);
  const [userDetails, setUserDetails] = useState<AgencyUserDetail | null>(null);
  const [updateCheck, setUpdateCheck] = useState<boolean>(false);
  const [PendingApply, setPendingApply] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState<boolean>(false);

  // --- agency-specific user fetch, but same call pattern as corporate ---
  const fetchUserDetails = async (
    _userType: string[] | undefined, // kept param shape for parity
    userId: string | undefined,
    userEmail: string | undefined
  ) => {
    try {
      setIsLoadingUserDetails(true);

      // try by sub → fall back to email (adjust endpoints to your agency API)
      let responseUser: Partial<AgencyUserDetail> | undefined;

      if (userId) {
        const { response, error } = await httpServiceObj.get<[AgencyUserDetail]>(
          `/agency-user/${userId}/cognito`,
          true,
          {}
        );
        if (error) throw new Error(error.message);
        responseUser = response?.[0];
      }

      if (!responseUser && userEmail) {
        const { response, error } = await httpServiceObj.get<[Partial<AgencyUserDetail>]>(
          `/agency-user/${userEmail}/details`,
          true,
          {}
        );
        if (error) throw new Error(error.message);
        responseUser = response?.[0];
      }

      const normalized: AgencyUserDetail | null = responseUser
        ? {
            id: String(responseUser.id ?? responseUser.cognitoUserId ?? ""),
            companyId: responseUser.companyId,
            firstName: responseUser.firstName,
            lastName: responseUser.lastName,
            email: responseUser.email,
            createdAt: responseUser.createdAt,
            updatedAt: responseUser.updatedAt,
            isDeleted: Boolean(responseUser.isDeleted),
            cognitoUserId: responseUser.cognitoUserId,
            PK: responseUser.PK,
            SK: responseUser.SK,
            GSI1PK: (responseUser as any)?.GSI1PK,
            GSI1SK: (responseUser as any)?.GSI1SK,
          }
        : null;

      setUserDetails(normalized);
      // persist agency snapshot if you want (agency-scoped key only)
      if (normalized) {
        secureStorage.setItem(SecureStorageKeyEnum.AGENCY_USERDETAILS, normalized as any);
      }
    } catch (err) {
      // if fetch fails but session exists, sign out agency only (mirrors corporate pattern)
      await CognitoAgencyServiceObj.handleSignOut();
      setIsLoggedIn(false);
      setUserDetails(null);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  // kept name EXACTLY the same as corporate; internally calls agency API if you have it
  const fetchCorporateCompanyDetails = async (): Promise<any | null> => {
    try {
      if (!userDetails?.companyId) return null;
      // mirror corporate: fetch company by companyId, but agency endpoint
      // change this path to your actual agency company/org endpoint
      const { response, error } = await httpServiceObj.get<any>(
        `/agency-company/${userDetails.companyId}`,
        true,
        {}
      );
      if (error) return null;
      return response?.[0] ?? null;
    } catch {
      return null;
    }
  };

  useLayoutEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const isUserLoggedIn = await CognitoAgencyServiceObj.isLoggedIn();
        if (!isUserLoggedIn) {
          setIsLoggedIn(false);
          setUserDetails(null);
          setTokenData(null);
          return;
        }

        const { tokens } = await fetchAuthSession();
        const idp = tokens?.idToken?.payload as AgencyCognitoMeta | undefined;
        const userType = idp?.["cognito:groups"]; // kept for parity, not used directly
        const userEmail = idp?.email;
        const userId = idp?.sub;

        const token = CognitoAgencyServiceObj.getAccessToken();
        setTokenData(token);

        const storedAgencyDetails =
          secureStorage.getItem<AgencyUserDetail>(SecureStorageKeyEnum.AGENCY_USERDETAILS);

        if (storedAgencyDetails && Object.keys(storedAgencyDetails).length > 0) {
          setUserDetails(storedAgencyDetails);
        } else {
          await fetchUserDetails(userType, userId, userEmail);
        }

        setIsLoggedIn(true);
      } catch (error) {
        await CognitoAgencyServiceObj.handleSignOut();
        setIsLoggedIn(false);
        setUserDetails(null);
        setTokenData(null);
      }
    };

    checkUserLoggedIn();
    const interval = setInterval(checkUserLoggedIn, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateCheck]);

  const setAuthState = useCallback((data: any, loggedIn: boolean) => {
    setTokenData(data);
    setIsLoggedIn(loggedIn);
    if (!loggedIn) setUserDetails(null);
  }, []);

  // === EXACT SAME memoized value keys ===
  const memoizedValue = useMemo(
    () => ({
      isLoggedIn,
      tokenData,
      setAuthState,
      setUpdateCheck,
      userDetails,
      PendingApply,
      setPendingApply,
      isModalOpen,
      setIsModalOpen,
      isLoadingUserDetails,
      setUserDetails,
      fetchCorporateCompanyDetails, // name preserved intentionally
    }),
    [
      isLoggedIn,
      tokenData,
      setAuthState,
      setUpdateCheck,
      userDetails,
      PendingApply,
      setPendingApply,
      isModalOpen,
      setIsModalOpen,
      isLoadingUserDetails,
      setUserDetails,
      fetchCorporateCompanyDetails,
    ]
  );

  return <AppContext_Agency.Provider value={memoizedValue}>{children}</AppContext_Agency.Provider>;
};

export const useAppContext_Agency = () => {
  const context = useContext(AppContext_Agency);
  if (!context) {
    throw new Error("useAppContext_Agency must be used within an AppProvider_Agency");
  }
  return context;
};
