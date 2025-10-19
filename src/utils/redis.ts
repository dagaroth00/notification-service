import 'dotenv/config';
import { createClient } from 'redis';

export const createRedisClient = () => {
  const client = createClient({ url: process.env.REDIS_URL });
  return client;
};
