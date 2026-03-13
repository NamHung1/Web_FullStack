import { Router } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt";
import { register, login } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { hashPassword } from "../utils/hash";
import User from "../models/User";

const router = Router();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const ensureStrategy = (strategy: string) => (req: any, res: any, next: any) => {
  const activeStrategy = (passport as any)._strategy(strategy);

  if (!activeStrategy) {
    return res.status(503).json({
      message: `${strategy} login is not configured. Please check environment variables.`
    });
  }

  next();
};

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

router.get("/oauth-providers", (_req, res) => {
  const providers = {
    google: Boolean((passport as any)._strategy("google")),
    facebook: Boolean((passport as any)._strategy("facebook"))
  };

  res.json(providers);
});

/*
 GOOGLE LOGIN
*/

router.get(
  "/google",
  ensureStrategy("google"),
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  ensureStrategy("google"),
  passport.authenticate("google", { session: false }),
  (req: any, res) => {

    const token = generateToken(req.user._id, req.user.role);

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
  ensureStrategy("facebook"),
  passport.authenticate("facebook")
);

router.get(
  "/facebook/callback",
  ensureStrategy("facebook"),
  passport.authenticate("facebook", { session: false }),
  (req: any, res) => {

    const token = generateToken(req.user._id, req.user.role);

    res.redirect(
      `${frontendUrl}/oauth-success?token=${token}`
    );
  }
);

export default router;