import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(role) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role)
      return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// Attach full user (optional convenience)
export async function attachCurrentUser(req, res, next) {
  if (!req.user?.id) return next();
  const user = await User.findById(req.user.id);
  if (user) req.currentUser = user;
  next();
}
