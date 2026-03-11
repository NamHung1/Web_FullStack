import { Request, Response } from "express";
import Category from "../models/Category";

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });

  res.json(categories);
};