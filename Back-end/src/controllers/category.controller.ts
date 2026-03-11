import { Request, Response } from "express";
import Category from "../models/Category";

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });

  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const existing = await Category.findOne({ name: name.trim() });

  if (existing) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name: name.trim() });

  return res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: name.trim() },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.json({ message: "Deleted" });
};