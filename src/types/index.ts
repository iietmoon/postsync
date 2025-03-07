/**
 * Core types for PostSync
 */

// Response type for API calls
export interface ApiResponse<T = any> {
    status: number;
    ok: boolean;
    headers: Record<string, string>;
    data: T;
  }
  
  // Configuration for API client
  export interface ApiClientConfig {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
      retryableStatusCodes: number[];
    };
  }
  
  // Options for individual requests
  export interface RequestOptions {
    pathParams?: Record<string, string | number>;
    queryParams?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    body?: any;
    abortSignal?: AbortSignal;
    fetchOptions?: Partial<RequestInit>;
  }
  
  // The base endpoint structure from your Postman collection
  export interface ApiResponse {
    code: number;
    body: string;
  }
  
  export interface ApiEndpoint {
    name: string;
    path: string;
    description: string;
    fullPath: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    responses: ApiResponse[];
  }
  
  export interface ApiMethodEndpoints {
    [endpointName: string]: ApiEndpoint;
  }
  
  export interface ApiGroupEndpoints {
    get?: ApiMethodEndpoints;
    post?: ApiMethodEndpoints;
    put?: ApiMethodEndpoints;
    delete?: ApiMethodEndpoints;
    patch?: ApiMethodEndpoints;
  }
  
  export interface ApiGroup {
    name: string;
    description: string;
    endpoints: ApiGroupEndpoints;
  }
  
  export interface ApiEndpoints {
    [groupName: string]: ApiGroup;
  }
  
  // Type-safe client interfaces
  // This utilizes TypeScript's powerful type system to create 
  // a fully typed API client based on your endpoints structure
  
  type ApiMethodFunction<T = any> = (options?: RequestOptions) => Promise<ApiResponse<T>>;
  
  type ApiMethodClient<T = any> = {
    [endpointName: string]: ApiMethodFunction<T>;
  };
  
  type ApiGroupClient<T = any> = {
    get?: ApiMethodClient<T>;
    post?: ApiMethodClient<T>;
    put?: ApiMethodClient<T>;
    delete?: ApiMethodClient<T>;
    patch?: ApiMethodClient<T>;
  };
  
  export type ApiClient<T = any> = {
    [groupName: string]: ApiGroupClient<T>;
  };