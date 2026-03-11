import { Request, Response } from "express";
import Review from "../models/Review";

export const addReview = async (req: Request, res: Response) => {

  const userId = (req as any).user.id;

  const review = await Review.create({
    userId,
    productId: req.body.productId,
    rating: req.body.rating,
    comment: req.body.comment
  });

  res.json(review);
};