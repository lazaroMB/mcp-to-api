export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  name: string;
  value: string;
}

export interface API {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  method: HTTPMethod;
  url: string;
  headers: KeyValuePair[];
  cookies: KeyValuePair[];
  url_params: KeyValuePair[];
  payload_schema: Record<string, any> | null;
}

export interface APIFormData {
  name: string;
  description: string;
  method: HTTPMethod;
  url: string;
  headers: KeyValuePair[];
  cookies: KeyValuePair[];
  url_params: KeyValuePair[];
  payload_schema: Record<string, any> | null;
}
