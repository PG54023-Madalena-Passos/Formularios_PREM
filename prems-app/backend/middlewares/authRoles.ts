// middlewares/authRoles.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authorize = (roles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token ausente' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: number };

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Repare que precisamos do tipo extendido para o TypeScript
      (req as any).user = decoded;

      next();
    } catch {
      return res.status(403).json({ error: 'Token inválido' });
    }
  };
};