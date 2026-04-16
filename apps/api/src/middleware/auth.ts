import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt';

// Extend Express Request to carry the decoded founder
declare global {
  namespace Express {
    interface Request {
      founder?: JwtPayload;
    }
  }
}

/**
 * requireAuth — middleware that validates the JWT from the Authorization header.
 * Attaches decoded payload to req.founder on success.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    req.founder = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * optionalAuth — same as requireAuth but does not block unauthenticated requests.
 * Useful for public routes that behave differently when logged in.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.founder = verifyToken(authHeader.slice(7));
    } catch {
      // ignore — proceed unauthenticated
    }
  }
  next();
}
