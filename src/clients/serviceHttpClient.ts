import axios, { AxiosError, AxiosInstance } from 'axios';
import logger from '../utils/logger.js';

export interface ServiceHttpClientOptions {
  baseURL: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 5000;

export const createServiceHttpClient = (options: ServiceHttpClientOptions): AxiosInstance => {
  const { baseURL, timeoutMs = DEFAULT_TIMEOUT_MS, defaultHeaders } = options;

  const client = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        logAxiosError(error);
      } else {
        logger.error({ err: error }, 'HTTP client error');
      }
      return Promise.reject(error);
    },
  );

  return client;
};

const logAxiosError = (error: AxiosError) => {
  const response = error.response;
  const request = error.request as { path?: string } | undefined;

  logger.error(
    {
      err: {
        message: error.message,
        code: error.code,
        status: response?.status,
        data: sanitizePayload(response?.data),
        url: error.config?.url ?? request?.path,
        method: error.config?.method,
      },
    },
    'HTTP request to dependent service failed',
  );
};

const sanitizePayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  try {
    return JSON.parse(JSON.stringify(payload));
  } catch (err) {
    logger.warn({ err }, 'Failed to serialise dependent service payload for logging');
    return undefined;
  }
};

