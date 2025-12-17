import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Express.Request {
  userId?: string;
  tenantId?: string;
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const validateTenant = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.tenantId) {
    return res.status(401).json({ error: 'Tenant not found' });
  }
  next();
};
