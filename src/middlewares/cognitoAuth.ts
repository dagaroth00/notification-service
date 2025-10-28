import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwtVerifier.js';

// Attach a typed user to Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface VerifyOptions {
  required?: boolean; // if false, allow anonymous (no token)
  roles?: string[]; // allowed roles (Cognito groups or custom claim)
}

// uses verifyToken from jwtVerifier.ts

// Middleware factory
export function requireAuth(options: VerifyOptions = { required: true }) {
    console.log('[cognitoAuth] requireAuth options:', options);
  return async function (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.split(' ')[1];
    const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
    const altHeaderTokenRaw = req.headers['x-access-token'];
    const altHeaderToken = Array.isArray(altHeaderTokenRaw)
      ? altHeaderTokenRaw[0]
      : typeof altHeaderTokenRaw === 'string'
      ? altHeaderTokenRaw
      : undefined;

    const token = headerToken || queryToken || altHeaderToken;

    const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
    const isInternalRequest =
      typeof token === 'string' && internalSecret && token === internalSecret;

    if (isInternalRequest) {
      // Flag request as internal for downstream consumers and skip Cognito verification
      req.user = { internal: true, source: 'internal-service' };
      console.log('[cognitoAuth] Internal service token accepted, skipping Cognito verification');
      return next();
    }

    if (!token) {
      if (options.required === false) return next();
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }

    try {
        console.log('[cognitoAuth] Step 1: Starting token verification');
      const decoded = await verifyToken(token as string);
      // attach user
      req.user = decoded;
      console.log('[cognitoAuth] Step 2: Token verified, user attached to req' + JSON.stringify(req.user));
      // role check: Cognito groups are usually in 'cognito:groups' claim
      if (options.roles && options.roles.length > 0) {
        const groups: string[] = (decoded as any)['cognito:groups'] || [];
        const has = options.roles.some((r) => groups.includes(r));
        if (!has) return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }

      next();
    } catch (err: any) {
      console.error('Token verification failed', err.message || err);
      console.error('Token verification failed error', err);
      return res.status(401).json({ message: 'Unauthorized: invalid token' });
    }
  };
}

export { verifyToken };
