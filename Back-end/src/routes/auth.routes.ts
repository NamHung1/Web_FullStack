import { Router } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt";
import { register, login } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { hashPassword } from "../utils/hash";
import User from "../models/User";

const router = Router();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

/*
 NORMAL LOGIN
*/

router.post("/register", register);
router.post("/login", login);

router.post("/reset-admin", async (req, res) => {
  try {
    await User.deleteMany({ role: "admin" });
    const password = await hashPassword("admin123");
    await User.create({
      name: "Admin",
      email: "admin@shop.com",
      password,
      role: "admin"
    });
    res.json({ message: "Admin reset" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*
 GOOGLE LOGIN
*/

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {

    const token = generateToken(req.user._id);

    res.redirect(
      `${frontendUrl}/oauth-success?token=${token}`
    );
  }
);

/*
 FACEBOOK LOGIN
*/

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req: any, res) => {

    const token = generateToken(req.user._id);

    res.redirect(
      `${frontendUrl}/oauth-success?token=${token}`
    );
  }
);

export default router;