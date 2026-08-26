import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { users } from './users';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export function loginHandler(req: Request, res: Response) {
  const { username, password } = req.body || {};
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const accessToken = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  });
  res.json({ accessToken, role: user.role });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
