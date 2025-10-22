import { RequestHandler } from 'express';
import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';

const genReqId = (req: any) => {
	return req.headers['x-request-id'] || randomUUID();
};

// pinoHttp may not have perfect typings for invocation; cast to any to call
const pinoMiddleware: RequestHandler = (pinoHttp as any)({
	logger,
	genReqId,
	customLogLevel: (res: any, err: any) => {
		if (res.statusCode >= 500 || err) return 'error';
		if (res.statusCode >= 400) return 'warn';
		return 'info';
	},
});

// Add response-time measurement middleware wrapper
const middleware: RequestHandler = (req, res, next) => {
	const start = process.hrtime();
		res.once('finish', () => {
			const diff = process.hrtime(start);
			const ms = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
			// Avoid setting headers after they are sent to the client
			try {
				if (!res.headersSent) {
					res.setHeader('X-Response-Time', `${ms}`);
				}
			} catch (err) {
				// ignore header-setting errors — still log the timing
			}
			// pino-http attaches logger to req.log
			const log = (req as any).log || logger;
			log.info({ req: { method: req.method, url: req.url }, res: { statusCode: res.statusCode }, responseTimeMs: ms }, 'request_finished');
		});
	return pinoMiddleware(req, res, next);
};

export default middleware;