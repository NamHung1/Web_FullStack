import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";

import connectDB from "./config/database";

import "./config/passport";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/cart.routes";
import categoryRoutes from "./routes/categoty.route";
import adminRoutes from "./routes/admin.routes";
import { seedAdmin } from "./config/seedAdmin";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

connectDB().then(() => seedAdmin());

/*
 Passport session
*/

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

/*
 Routes
*/

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});