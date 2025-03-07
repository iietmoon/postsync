/**
 * PostSync - Turn Postman collections into type-safe API clients
 */

export { createApiClient } from './client/createApiClient';

export type {
  ApiClient,
  ApiClientConfig,
  ApiEndpoints,
  ApiGroup,
  ApiEndpoint,
  ApiResponse,
  RequestOptions
} from './types';

export {
  getEndpoint,
  getGroupEndpoints,
  getMethodEndpoints
} from './core/parser';