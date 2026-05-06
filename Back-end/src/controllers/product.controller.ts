import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  const query: Record<string, unknown> = {};

  if (search?.trim()) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query).populate('category', 'name');

  res.json(products);
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate(
    'category',
    'name',
  );

  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const product = await Product.create(req.body);

  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  await Product.findByIdAndDelete(req.params.id);

  res.json({ message: 'Deleted Successfully' });
};
