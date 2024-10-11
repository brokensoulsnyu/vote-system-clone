import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(): string {
  return jwt.sign({}, SECRET_KEY, { expiresIn: '3d' });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, SECRET_KEY);
    return true;
  } catch {
    return false;
  }
}