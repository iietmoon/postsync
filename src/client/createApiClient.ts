import { createApiEndpoints } from '../core/parser';
import { ApiEndpoints } from '../types';
import { RequestOptions, ApiClient, ApiClientConfig, ApiResponse } from '../types';

/**
 * Creates an API client from a Postman collection document
 * 
 * @param postmanDocument - The Postman collection JSON document
 * @param config - Configuration options for the API client
 * @returns A fully typed API client instance
 * 
 * @example
 * ```typescript
 * import { createApiClient } from 'postsync';
 * import postmanCollection from './postman-collection.json';
 * 
 * const api = createApiClient(postmanCollection, {
 *   baseUrl: 'https://api.example.com',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer token123'
 *   }
 * });
 * 
 * // Now you can use the typed API client
 * const user = await api.users.get.getUserById({
 *   pathParams: { id: '123' }
 * });
 * ```
 */
export function createApiClient<T = any>(
  postmanDocument: any, 
  config: ApiClientConfig = {}
): ApiClient<T> {
  // Parse the Postman document into our structured format
  const endpoints: ApiEndpoints = createApiEndpoints(postmanDocument);
  
  // Create a proxy-based client that dynamically handles API calls
  return createClientProxy(endpoints, config);
}

/**
 * Creates a proxy-based client that allows for intuitive API call syntax
 */
function createClientProxy(endpoints: ApiEndpoints, config: ApiClientConfig): any {
  // Default configuration
  const defaultConfig: ApiClientConfig = {
    baseUrl: '',
    headers: {
      'Content-Type': 'application/json'
    },
    timeoutMs: 30000,
    ...config
  };

  // Create the base client object
  const client: any = {};

  // Iterate through each group (e.g., 'users', 'products')
  Object.keys(endpoints).forEach(groupName => {
    const group = endpoints[groupName];
    client[groupName] = {};

    // Iterate through each HTTP method in the group
    Object.keys(group.endpoints).forEach(method => {
      const methodEndpoints = group.endpoints[method as keyof typeof group.endpoints];
      if (!methodEndpoints) return;

      client[groupName][method] = {};

      // Iterate through each endpoint in the method
      Object.keys(methodEndpoints).forEach(endpointName => {
        const endpoint = methodEndpoints[endpointName];

        // Create a function for this specific endpoint
        client[groupName][method][endpointName] = async (options: RequestOptions = {}): Promise<ApiResponse<any>> => {
          // Generate the full URL with path parameters
          let url = `${defaultConfig.baseUrl}${endpoint.fullPath}`;
          
          // Replace path parameters e.g., /users/:id -> /users/123
          if (options.pathParams) {
            Object.keys(options.pathParams).forEach(param => {
              url = url.replace(`:${param}`, encodeURIComponent(String(options.pathParams![param])));
            });
          }
          
          // Add query parameters
          if (options.queryParams) {
            const queryString = Object.keys(options.queryParams)
              .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(options.queryParams![key]))}`)
              .join('&');
            
            url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
          }
          
          // Merge headers
          const headers = {
            ...defaultConfig.headers,
            ...options.headers
          };
          
          // Build fetch options
          const fetchOptions: RequestInit = {
            method: endpoint.method.toUpperCase(),
            headers,
            signal: options.abortSignal,
          };
          
          // Add body for non-GET requests
          if (options.body && endpoint.method !== 'get') {
            fetchOptions.body = typeof options.body === 'string' 
              ? options.body 
              : JSON.stringify(options.body);
          }
          
          // Add custom fetch options
          if (options.fetchOptions) {
            Object.assign(fetchOptions, options.fetchOptions);
          }
          
          try {
            // Setup timeout if configured
            const timeoutPromise = defaultConfig.timeoutMs
              ? new Promise<never>((_, reject) => {
                  setTimeout(() => reject(new Error(`Request timeout after ${defaultConfig.timeoutMs}ms`)), defaultConfig.timeoutMs);
                })
              : null;
            
            // Execute the fetch request with timeout
            const response = await (timeoutPromise
              ? Promise.race([
                  fetch(url, fetchOptions),
                  timeoutPromise
                ])
              : fetch(url, fetchOptions)) as Response;
            
            // Parse the response based on content type
            let data: any;
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
              data = await response.json();
            } else if (contentType.includes('text/')) {
              data = await response.text();
            } else {
              data = await response.blob();
            }
            
            const result: ApiResponse<any>|any = {
              status: response.status,
              ok: response.ok,
              //@ts-ignore
              headers: Object.fromEntries(response.headers.entries()),
              data
            };
            
            // Handle non-OK responses
            if (!response.ok) {
              const error = new Error(`API request failed with status ${response.status}`);
              Object.assign(error, result);
              throw error;
            }
            
            return result;
          } catch (error) {
            // Check if this is already our error type
            if (error instanceof Error && 'status' in error) {
              throw error;
            }
            
            // Otherwise, format as our standard error
            const formattedError = new Error(error instanceof Error ? error.message : 'Unknown error');
            Object.assign(formattedError, {
              status: 0,
              ok: false,
              headers: {},
              data: null,
              originalError: error
            });
            
            throw formattedError;
          }
        };
      });
    });
  });
  
  return client;
}