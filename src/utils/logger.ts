import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const logger = pino({ level });

export default logger;

export const info = (msg: string, meta?: any) => logger.info(meta, msg);
export const warn = (msg: string, meta?: any) => logger.warn(meta, msg);
export const error = (msg: string, meta?: any) => logger.error(meta, msg);