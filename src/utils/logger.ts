let logger: any;

try {
	// Dynamically require pino so the TS build doesn't hard-fail if it's not installed
	// at type-check time in this environment.
	// At runtime (normal dev/prod), pino should be installed and this will be used.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const pino = require('pino');
	const level = process.env.LOG_LEVEL || 'info';
	logger = pino({ level });
} catch (err) {
	// Fallback minimal logger
	logger = {
		info: (meta: any, msg?: string) => console.log('[INFO]', msg ?? meta, meta ?? ''),
		warn: (meta: any, msg?: string) => console.warn('[WARN]', msg ?? meta, meta ?? ''),
		error: (meta: any, msg?: string) => console.error('[ERROR]', msg ?? meta, meta ?? ''),
	};
}

export default logger;

export const info = (msg: string, meta?: any) => logger.info(meta, msg);
export const warn = (msg: string, meta?: any) => logger.warn(meta, msg);
export const error = (msg: string, meta?: any) => logger.error(meta, msg);