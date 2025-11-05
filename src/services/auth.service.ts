import axios from 'axios';
import { BadRequestError, ServiceError } from '../errors/httpError.js';
import logger from '../utils/logger.js';
import {
  ExternalServiceDescriptor,
  getExternalServiceClient,
  mapExternalServiceError,
} from './serviceIntegration.js';

export interface UserGuidLookupResult {
  userId: string;
  userGuid: string;
  [key: string]: unknown;
}

const AUTH_USER_GUID_FIELD = 'cognitoUserId';
// const AUTH_USER_GUID_FIELD = 'email';
const AUTH_GET_USER_DETAILS_PATH = 'User/GetUser?id=';
const AUTH_USER_ID_FIELD = 'userId';

const AUTH_SERVICE_DESCRIPTOR: ExternalServiceDescriptor = {
  serviceName: 'authService',
  serviceKey: 'auth',
  timeoutEnv: 'AUTH_SERVICE_TIMEOUT_MS',
  defaultTimeoutMs: 5000,
};

export const getUserGuidByUserId = async (userId: string): Promise<UserGuidLookupResult> => {
  if (!userId || userId.trim().length === 0) {
    throw new BadRequestError('userId is required');
  }

  const client = getExternalServiceClient(AUTH_SERVICE_DESCRIPTOR);
  const path = `${AUTH_GET_USER_DETAILS_PATH}${encodeURIComponent(userId)}`;
  console.log('Auth service path:', path);
  try {
    const response = await client.get<UserGuidLookupResult>(path);
    const data = response.data;

    if (!data || typeof data !== 'object') {
      logger.error({ userId, data }, 'Auth service returned invalid payload');
      throw new ServiceError('Auth service returned invalid payload', { userId });
    }

    const recordPayload = data as Record<string, any>;
    const userGuidValue = recordPayload[AUTH_USER_GUID_FIELD];
    if (typeof userGuidValue !== 'string' || userGuidValue.length === 0) {
      logger.error(
        { userId, data, userGuidField: AUTH_USER_GUID_FIELD },
        'Auth service response missing user GUID field',
      );
      throw new ServiceError('Auth service response missing userGuid', { userId });
    }

    const userIdValue = recordPayload[AUTH_USER_ID_FIELD] ?? userId;

    const userGuid = userGuidValue;
    return {
      ...recordPayload,
      userId: typeof userIdValue === 'string' && userIdValue.length > 0 ? userIdValue : userId,
      userGuid,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw mapExternalServiceError(AUTH_SERVICE_DESCRIPTOR, error, { userId });
    }

    throw new ServiceError('Unexpected error while contacting auth service', { userId, error });
  }
};

export default {
  getUserGuidByUserId,
};