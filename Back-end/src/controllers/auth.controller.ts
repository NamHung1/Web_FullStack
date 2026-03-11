import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {

  try {

    const { name, email, password } = req.body;

    const result = await registerUser(name, email, password);

    res.json(result);

  } catch (error: any) {

    res.status(400).json({ message: error.message });

  }
};

export const login = async (req: Request, res: Response) => {

  try {

    const { email, password } = req.body;

    console.log('Login attempt:', { email, password: '***' });

    const result = await loginUser(email, password);

    console.log('Login success:', result.user.email);

    res.json(result);

  } catch (error: any) {

    console.log('Login error:', error.message);

    res.status(400).json({ message: error.message });

  }
};