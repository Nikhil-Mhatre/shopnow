import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPublicKey } from '../config/keys.js'; // Ensure the relative path to keys.ts matches your project structure

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; email: string };
    }
  }
}

interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // 1. Read headers injected by Envoy Gateway
  let userId = req.headers['x-user-id'] as string;
  let userRole = req.headers['x-user-role'] as string;
  let userEmail = req.headers['x-user-email'] as string;

  // 2. Local Fallback: If Envoy didn't parse headers, consume and verify the token directly
  if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      // getPublicKey() reads the PEM context; algorithms parameter enforces RS256 asymmetry
      const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as JwtPayload;
      
      userId = decoded.id;
      userRole = decoded.role;
      userEmail = decoded.email;
    } catch (err) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
      return;
    }
  }

  // 3. Fall through block if both parsing methods find no valid identification
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Missing identity headers or token.' });
    return;
  }

  // 4. Attach structured payload metadata to request object context
  req.user = { id: userId, role: userRole, email: userEmail };
  next();
};