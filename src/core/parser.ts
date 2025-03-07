import { ApiEndpoints, ApiEndpoint } from '../types';

/**
 * Helper function to convert a string to camelCase
 */
function toCamelCase(input: string): string {
  // Remove any trailing periods
  const cleaned = input.replace(/\.$/, '');
  
  if (!cleaned.includes(' ')) {
    // If single word, just lowercase the first letter
    return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  }
  
  return cleaned
    .replace(/\s+(\w)/g, (_, letter) => letter.toUpperCase())
    .replace(/^(.)/, (_, first) => first.toLowerCase());
}

/**
 * Parse Postman JSON structure into a more accessible API endpoints structure
 * 
 * @param postmanData - The Postman collection JSON document
 * @returns A structured representation of the API endpoints
 */
export function createApiEndpoints(postmanData: any): ApiEndpoints {
  const result: ApiEndpoints = {};
  
  // Process each main group (Authentication, Users, etc.)
  postmanData.item.forEach((group: any) => {
    // Convert group name to camelCase for object keys
    const groupKey = toCamelCase(group.name);
    
    result[groupKey] = {
      name: group.name,
      description: group.description || '',
      endpoints: {}
    };
    
    // Process each endpoint in the group
    if (group.item && group.item.length) {
      group.item.forEach((endpoint: any) => {
        const method = endpoint.request.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
        
        // Handle different Postman collection versions
        let path: string[] = [];
        if (endpoint.request.url.path) {
          path = endpoint.request.url.path;
        } else if (endpoint.request.url.raw) {
          // Extract path from raw URL (remove protocol, host and query params)
          const urlParts = endpoint.request.url.raw.split('?')[0];
          const pathPart = urlParts.match(/https?:\/\/[^\/]+(\/.*)/)?.[1] || urlParts;
          path = pathPart.split('/').filter(Boolean);
        }
        
        // Convert endpoint name to camelCase
        const name = toCamelCase(endpoint.name);
        
        // Initialize method object if not exists
        if (!result[groupKey].endpoints[method]) {
          result[groupKey].endpoints[method] = {};
        }
        
        // Add endpoint
        result[groupKey].endpoints[method]![name] = {
          name: endpoint.name.replace(/\.$/, ''), // Store original name without trailing period
          path: path.join('/'),
          description: endpoint.request.description || '',
          fullPath: `/${path.join('/')}`,
          method: method,
          responses: endpoint.response ? endpoint.response.map((resp: any) => ({
            code: resp.code || resp.status || 200,
            body: resp.body || ''
          })) : []
        };
      });
    }
  });
  
  return result;
}

/**
 * Utility function to get an endpoint by group, method, and name
 * Note: group and name parameters should be in camelCase
 */
export function getEndpoint(
  endpoints: ApiEndpoints,
  group: string,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  name: string
): ApiEndpoint | undefined {
  return endpoints[group]?.endpoints[method]?.[name];
}

/**
 * Utility function to get all endpoints in a group
 * Note: group parameter should be in camelCase
 */
export function getGroupEndpoints(endpoints: ApiEndpoints, group: string) {
  return endpoints[group]?.endpoints;
}

/**
 * Utility function to get all endpoints of a specific method in a group
 * Note: group parameter should be in camelCase
 */
export function getMethodEndpoints(
  endpoints: ApiEndpoints,
  group: string,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
) {
  return endpoints[group]?.endpoints[method];
}