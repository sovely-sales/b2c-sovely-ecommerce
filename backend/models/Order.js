const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    items: [
      {
        id: String,
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    total: { type: Number, required: true },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: { type: String },
    paymentMethod: { type: String, default: "razorpay" },
    paymentId: { type: String },
    status: {
      type: String,
      default: "Pending Payment",
      enum: [
        "Pending Payment",
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
  },
  { timestamps: true, collection: "b2c_orders" },
);

module.exports = mongoose.model("Order", orderSchema);
