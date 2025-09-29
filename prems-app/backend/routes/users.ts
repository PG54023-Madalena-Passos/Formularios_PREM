import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user';

const router = Router();

// Criar novo utilizador (registo)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role = 0 } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e password são obrigatórios' });
      return;
    }

    // verificar se já existe
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'Utilizador já existe' });
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      email,
      password: hashedPassword,
      remember: true,
      role,
    });

    await user.save();

    res.status(201).json({ message: 'Utilizador criado com sucesso', user });
  } catch (err) {
    console.error('Erro ao criar utilizador:', err);
    next(err);
  }
});

export default router;