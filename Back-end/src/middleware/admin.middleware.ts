import { Request, Response, NextFunction } from "express";
import User from "../models/User";

/*
 Check admin role
*/

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user.id;

  const user = await User.findById(userId);

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};