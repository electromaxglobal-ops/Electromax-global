import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; name?: string };
  dbUser?: typeof users.$inferSelect;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Dev bypass / preview session header support
  if (token.startsWith('dev-session-') || token === 'demo-admin-token') {
    const email = req.headers['x-user-email'] as string || 'electromaxglobal@gmail.com';
    req.user = {
      uid: token,
      email: email,
      name: 'Mr. Sushil Goyal',
    };
    try {
      const u = await db.select().from(users).where(eq(users.email, email));
      if (u.length > 0) {
        req.dbUser = u[0];
      }
    } catch {
      // Non-fatal
    }
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    if (decodedToken.email) {
      const u = await db.select().from(users).where(eq(users.email, decodedToken.email));
      if (u.length > 0) {
        req.dbUser = u[0];
      }
    }
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
