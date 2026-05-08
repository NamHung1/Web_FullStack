import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category';
import Product from '../models/Product';

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

const buildProductPayload = async (
  body: Request['body'],
  options: { partial: boolean },
): Promise<{ payload: Record<string, unknown>; error?: never } | { payload?: never; error: string }> => {
  const payload: Record<string, unknown> = {};

  if (!options.partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return { error: 'Product name is required' };
    }

    payload.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      return { error: 'Description must be a string' };
    }

    payload.description = body.description.trim();
  }

  if (!options.partial || body.price !== undefined) {
    const price = Number(body.price);

    if (!Number.isFinite(price) || price < 0) {
      return { error: 'Price must be a non-negative number' };
    }

    payload.price = price;
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return { error: 'Stock must be a non-negative integer' };
    }

    payload.stock = stock;
  }

  if (body.images !== undefined) {
    if (
      !Array.isArray(body.images) ||
      body.images.some((image: unknown) => typeof image !== 'string')
    ) {
      return { error: 'Images must be an array of strings' };
    }

    payload.images = body.images.map((image: string) => image.trim()).filter(Boolean);
  }

  if (!options.partial || body.category !== undefined) {
    if (typeof body.category !== 'string' || !isValidObjectId(body.category)) {
      return { error: 'Invalid category' };
    }

    const categoryExists = await Category.exists({ _id: body.category });

    if (!categoryExists) {
      return { error: 'Category not found' };
    }

    payload.category = body.category;
  }

  return { payload };
};

export const getProducts = async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  const query: Record<string, unknown> = {};

  if (search?.trim()) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    if (!isValidObjectId(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    query.category = category;
  }

  const products = await Product.find(query).populate('category', 'name');

  res.json(products);
};

export const getProduct = async (req: Request, res: Response) => {
  const productId = String(req.params.id);

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findById(productId).populate(
    'category',
    'name',
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const result = await buildProductPayload(req.body, {
    partial: false,
  });

  if ('error' in result) {
    return res.status(400).json({ message: result.error });
  }

  const product = await Product.create(result.payload);

  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const productId = String(req.params.id);

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const result = await buildProductPayload(req.body, {
    partial: true,
  });

  if ('error' in result) {
    return res.status(400).json({ message: result.error });
  }

  if (!Object.keys(result.payload).length) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  const product = await Product.findByIdAndUpdate(productId, result.payload, {
    new: true,
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const productId = String(req.params.id);

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Deleted Successfully' });
};
