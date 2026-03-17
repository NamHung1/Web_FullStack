import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    comment: String
  },
  { timestamps: true }
);

ReviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);