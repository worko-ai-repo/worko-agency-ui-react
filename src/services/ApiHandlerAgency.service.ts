// @Services/ApiHandlerAgency.service.ts
import { HttpMethodResponseDto } from '@Interfaces/HttpOption.dto';
import { getHttpOptionsAgency } from '@Utils/HttpOptionsAgency.utils';


export class HttpServiceAgency {
  // same property name/style as your HttpService
  private API_URI: string;

  constructor() {
    // prefer dedicated agency base, fall back to corporate base if not set
    this.API_URI = import.meta.env.APP_PROXY_AGENCY_BASE}

  private buildUrl(path: string, params: any, fullUri: boolean) {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    return fullUri ? fullPath : `${this.API_URI}${fullPath}`;
  }

  async post<ResponseDataDto>(
    path: string,
    data: object,
    authorization: boolean = true,
    params = {},
    fullUri: boolean = false
  ): Promise<HttpMethodResponseDto<ResponseDataDto>> {
    try {
      const url = this.buildUrl(path, params, fullUri);
      const options = {
        method: 'POST',
        ...getHttpOptionsAgency(authorization, params),
        body: JSON.stringify(data),
      };
      const response = await fetch(url, options);

      if (!response.ok) {
        let responseData: any;
        try { responseData = await response.json(); } catch {}
        const errorMessage = responseData?.errorMsg || 'Something went wrong';
        console.error(`HTTP error on POST ${path}:`, errorMessage);
        return { response: null, error: new Error(errorMessage), status: response.status };
      }

      const jsonResponse = (await response.json()) as ResponseDataDto;
      return { response: jsonResponse, error: null, status: response.status };
    } catch (error) {
      console.error(`Error in POST request to ${path}:`, error);
      return { response: null, error: error as Error };
    }
  }

  async get<ResponseDataDto>(
    path: string,
    authorization: boolean = true,
    params = {},
    fullUri: boolean = false
  ): Promise<HttpMethodResponseDto<ResponseDataDto>> {
    try {
      const url = this.buildUrl(path, params, fullUri);
      const options = {
        method: 'GET',
        ...getHttpOptionsAgency(authorization, params),
      };
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}, message: ${response.statusText}`;
        console.error(`HTTP error on GET ${path}:`, errorMessage);
        return { response: null, error: new Error(errorMessage), status: response.status };
      }

      const jsonResponse = (await response.json()) as ResponseDataDto;
      return { response: jsonResponse, error: null, status: response.status };
    } catch (error) {
      console.error(`Error in GET request to ${path}:`, error);
      return { response: null, error: error as Error };
    }
  }

  async put<ResponseDataDto>(
    path: string,
    data: object,
    authorization: boolean = true,
    params = {},
    fullUri: boolean = false
  ): Promise<HttpMethodResponseDto<ResponseDataDto>> {
    try {
      const url = this.buildUrl(path, params, fullUri);
      const options = {
        method: 'PUT',
        ...getHttpOptionsAgency(authorization, params),
        body: data instanceof File ? (data as any) : JSON.stringify(data),
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}, message: ${response.statusText}`;
        console.error(`HTTP error on PUT ${path}:`, errorMessage);
        return { response: null, error: new Error(errorMessage) };
      }

      let jsonResponse: ResponseDataDto | null = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        jsonResponse = (await response.json()) as ResponseDataDto;
      }

      return { response: jsonResponse, error: null };
    } catch (error) {
      console.error(`Error in PUT request to ${path}:`, error);
      return { response: null, error: error as Error };
    }
  }

  async patch<ResponseDataDto>(
    path: string,
    data: object,
    authorization: boolean = true,
    params = {},
    fullUri: boolean = false
  ): Promise<HttpMethodResponseDto<ResponseDataDto>> {
    try {
      const url = this.buildUrl(path, params, fullUri);
      const options = {
        method: 'PATCH',
        ...getHttpOptionsAgency(authorization, params),
        body: JSON.stringify(data),
      };

      const response = await fetch(url, options);

      if (response.status === 204) {
        return { response: null, error: null, status: 204 };
      }

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText || 'No response body'}`;
        console.error(`HTTP error on PATCH ${path}:`, errorMessage);
        return { response: null, error: new Error(errorMessage), status: response.status };
      }

      const contentType = response.headers.get('content-type');
      let jsonResponse: ResponseDataDto | null = null;
      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text();
        jsonResponse = responseText ? (JSON.parse(responseText) as ResponseDataDto) : null;
      }

      return { response: jsonResponse, error: null, status: response.status };
    } catch (error) {
      console.error(`Error in PATCH request to ${path}:`, error);
      return { response: null, error: error as Error, status: 500 };
    }
  }

  // keep same signature as your original delete()
  delete = async (path: string, authorization: boolean = true, params = {}) => {
    try {
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      const fullPath = queryString ? `${path}?${queryString}` : path;
      const url = `${this.API_URI}${fullPath}`;

      const options = {
        method: 'DELETE',
        ...getHttpOptionsAgency(authorization, params),
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}, message: ${response.statusText}`;
        console.error(`HTTP error on DELETE ${path}:`, errorMessage);
        return { response: null, error: new Error(errorMessage) };
      }

      return { response: null, error: null };
    } catch (error) {
      console.error(`Error in DELETE request to ${path}:`, error);
      return { response: null, error };
    }
  };
}

// Instance for agency
export const httpServiceAgencyObj = new HttpServiceAgency();
export default httpServiceAgencyObj;
