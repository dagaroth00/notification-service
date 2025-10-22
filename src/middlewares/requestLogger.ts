import logger from '../utils/logger.js';

let pinoMiddleware: any;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const pinoHttp = require('pino-http');
	pinoMiddleware = pinoHttp({ logger });
} catch (err) {
	// fallback simple middleware
	pinoMiddleware = (req: any, res: any, next: any) => {
		logger.info('req', { method: req.method, url: req.url });
		next();
	};
}

export default pinoMiddleware;