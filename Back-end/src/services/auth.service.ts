import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashed = await hashPassword(password);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed
  });

  const token = generateToken(user._id.toString(), user.role);

  return { user, token };
};

export const loginUser = async (
  email: string,
  password: string
) => {

  console.log('Finding user:', email);

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    console.log('User not found');
    throw new Error("User not found");
  }

  if (!user.password) {
    console.log('Password not set');
    throw new Error("Password not set for this user");
  }

  console.log('Comparing password');

  const valid = await comparePassword(password, user.password);

  console.log('Password valid:', valid);

  if (!valid) {
    console.log('Invalid password');
    throw new Error("Invalid password");
  }

  const token = generateToken(user._id.toString(), user.role);

  return { user, token };
};