import Product from "../models/Product";

export const searchProducts = async (search: string) => {

  return Product.find({
    name: { $regex: search, $options: "i" }
  });
};