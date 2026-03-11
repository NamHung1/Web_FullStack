import { Request, Response } from "express";
import Product from "../models/Product";

export const getProducts = async (req: Request, res: Response) => {

  const search = req.query.search as string;

  if (search) {

    const products = await Product.find({
      name: { $regex: search, $options: "i" }
    });

    return res.json(products);
  }

  const products = await Product.find();

  res.json(products);
};

export const getProduct = async (req: Request, res: Response) => {

  const product = await Product.findById(req.params.id);

  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {

  const product = await Product.create(req.body);

  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {

  await Product.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });
};