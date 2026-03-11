import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },

        quantity: Number,

        price: Number
      }
    ],

    totalPrice: Number,

    shippingAddress: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer", "momo"],
      default: "cod"
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending"
    },

    cancelReason: String
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);