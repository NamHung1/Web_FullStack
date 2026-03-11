import User from "../models/User";
import { hashPassword } from "../utils/hash";

export const seedAdmin = async () => {

  console.log('Seeding admin...');

  const admin = await User.findOne({
    role: "admin"
  });

  if (!admin) {

    const password = await hashPassword("admin123");

    await User.create({
      name: "Admin",
      email: "admin@shop.com",
      password,
      role: "admin"
    });

    console.log("Admin account created");
  } else {
    console.log('Admin already exists');
  }
};