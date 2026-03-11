import mongoose from "mongoose";

/*
  Connect MongoDB Atlas
*/

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection error");

    process.exit(1);
  }
};

export default connectDB;