import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user';

const router = express.Router();

// Carrega especificamente o arquivo process.env
config({ path: join(__dirname, '../configs/process.env') });

router.post('/login', (req: Request, res: Response, next: NextFunction): void => {
  (async () => {
    const { email, password, remember } = req.body;

    console.log(email +" Pass: " + password );

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    console.log(user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET!, {
      expiresIn: remember ? '30d' : '1d'
    });

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      })
      .json({ accessToken });

  })().catch(next);
});

router.post('/refresh', (req: Request, res: Response, next: NextFunction): void => {
  (async () => {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401).json({ error: 'Token ausente' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as { id: string };
      const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });
      res.json({ accessToken });
    } catch (err) {
      res.status(403).json({ error: 'Token inválido' });
    }
  })().catch(next);
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
  });
  res.sendStatus(200);
});

export default router;
