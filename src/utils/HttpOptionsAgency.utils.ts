import { HttpHeaderOptionDto, HttpParamsOptions } from '@Interfaces/HttpOption.dto';
import CognitoAgencyServiceObj from './CognitoAgency.utils';

export const getHttpOptionsAgency = (authorization = true, params: HttpParamsOptions = {}) => {
	console.debug('[HttpOptions] AGENCY helper called', { authorization, params });
  let headers: HttpHeaderOptionDto = { 'Content-Type': params.fileType ?? 'application/json' as any };
  if (authorization) {
    const token = CognitoAgencyServiceObj.getAccessToken();
    headers['Authorization'] = `Bearer ${token || 'Passing DummyToken'}`;
  }
  if (params?.xTenantId) headers['X-TenantID'] = `${params.xTenantId}`;
  if (params?.stateId) headers['stateId'] = `${params.stateId}`;
  if (params?.schoolId) headers['schoolId'] = `${params.schoolId}`;
  if (params?.awsS3Tag && params.fileType) {
    headers = { 'Content-Type': params.fileType };
    headers['x-amz-tagging'] = `${params.awsS3Tag}`;
  }
  return { headers };
};
