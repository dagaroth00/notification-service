import { AxiosError, AxiosInstance } from 'axios';
import { BadRequestError, NotFoundError, ServiceError } from '../errors/httpError.js';
import logger from '../utils/logger.js';
import { createServiceHttpClient } from '../clients/serviceHttpClient.js';
import { ServiceKey, resolveServiceBaseUrl } from '../constants/serviceApiPaths.js';

const DEFAULT_TIMEOUT_MS = 5000;

export interface ExternalServiceDescriptor {
  serviceName: string;
  serviceKey: ServiceKey;
  timeoutEnv?: string;
  defaultTimeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

export interface ExternalServiceConfig {
  name: string;
  baseURL: string;
  timeoutMs: number;
}

const configCache = new Map<string, ExternalServiceConfig>();
const clientCache = new Map<string, AxiosInstance>();

export const resolveExternalServiceConfig = (descriptor: ExternalServiceDescriptor): ExternalServiceConfig => {
  const cached = configCache.get(descriptor.serviceName);
  if (cached) {
    return cached;
  }

  let baseURL: string;
  try {
    baseURL = resolveServiceBaseUrl(descriptor.serviceKey);
  } catch (err) {
    logger.error(
      { service: descriptor.serviceName, serviceKey: descriptor.serviceKey, err },
      'Failed to resolve base URL from service constants',
    );
    throw new ServiceError(`${descriptor.serviceName} service base URL is not configured`);
  }

  const timeoutEnvValue = descriptor.timeoutEnv ? process.env[descriptor.timeoutEnv] : undefined;
  const fallback = descriptor.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  const parsedTimeout = timeoutEnvValue ? Number.parseInt(timeoutEnvValue, 10) : fallback;
  const timeoutMs = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : fallback;

  const resolved: ExternalServiceConfig = {
    name: descriptor.serviceName,
    baseURL,
    timeoutMs,
  };

  configCache.set(descriptor.serviceName, resolved);
  return resolved;
};

export const getExternalServiceClient = (descriptor: ExternalServiceDescriptor): AxiosInstance => {
  const cached = clientCache.get(descriptor.serviceName);
  if (cached) {
    return cached;
  }

  const config = resolveExternalServiceConfig(descriptor);
  const client = createServiceHttpClient({
    baseURL: config.baseURL,
    timeoutMs: config.timeoutMs,
    defaultHeaders: descriptor.defaultHeaders,
  });

  clientCache.set(descriptor.serviceName, client);
  return client;
};

export const buildPathFromTemplate = (template: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce((path, [key, value]) => {
    const encoded = encodeURIComponent(value);
    const colonPattern = new RegExp(`:${key}(\\b|$)`, 'g');
    const curlyPattern = new RegExp(`{${key}}`, 'g');

    return path.replace(colonPattern, encoded).replace(curlyPattern, encoded);
  }, template);
};

export const extractField = (data: Record<string, unknown>, path: string): unknown => {
  if (!path || typeof path !== 'string') {
    return undefined;
  }

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
};

export const mapExternalServiceError = (
  descriptor: ExternalServiceDescriptor,
  error: AxiosError,
  context: Record<string, unknown> = {},
) => {
  const config = configCache.get(descriptor.serviceName);
  const status = error.response?.status;
  const responseData = error.response?.data;
  const messageFromService =
    typeof responseData === 'object' && responseData && 'message' in responseData
      ? String((responseData as Record<string, unknown>).message)
      : undefined;

  const details: Record<string, unknown> = {
    service: descriptor.serviceName,
    serviceKey: descriptor.serviceKey,
    status,
    code: error.code,
    data: responseData,
    context,
  };

  if (config) {
    details.baseURL = config.baseURL;
  }

  if (status === 404) {
    return new NotFoundError(messageFromService || `${descriptor.serviceName} resource not found`, details);
  }

  if (status && status >= 400 && status < 500) {
    return new BadRequestError(messageFromService || `${descriptor.serviceName} rejected request`, details);
  }

  return new ServiceError(messageFromService || `${descriptor.serviceName} request failed`, details);
};
