// for dev
// export const SERVICE_BASE_URLS = {
//   auth: 'https://demo-webapi.colobbo.com/api/',
//   notification: 'http://localhost:7000/api/notifications/',
//   user: 'http://localhost:4001/api/users/',
// } as const;

// Include trailing slashes so relative endpoint paths concatenate correctly.
export const SERVICE_BASE_URLS = {
  auth: 'http://localhost:57111/api/',
  notification: 'http://localhost:4000/api/notifications/',
  user: 'http://localhost:4001/api/users/',
} as const;

export type ServiceKey = keyof typeof SERVICE_BASE_URLS;

export const resolveServiceBaseUrl = (service: ServiceKey): string => {
  const baseUrl = SERVICE_BASE_URLS[service];
  if (!baseUrl) {
    throw new Error(`Base URL for service "${service}" is not configured`);
  }
  return baseUrl;
};

export const SERVICE_ENDPOINTS = {
  auth: {
    getUserDetailsByUserId: 'User/GetUser?id=:userId',
  },
  notification: {},
  user: {},
} as const;

export type ServiceEndpointGroup = typeof SERVICE_ENDPOINTS;

export const resolveEndpoint = <
  K extends keyof ServiceEndpointGroup,
  P extends keyof ServiceEndpointGroup[K],
>(
  service: K,
  endpointKey: P,
): ServiceEndpointGroup[K][P] => {
  const endpoints = SERVICE_ENDPOINTS[service];
  if (!endpoints) {
    throw new Error(`No endpoints configured for service "${String(service)}"`);
  }

  const endpoint = endpoints[endpointKey];
  if (!endpoint) {
    throw new Error(`Endpoint "${String(endpointKey)}" not configured for service "${String(service)}"`);
  }

  return endpoint;
};
