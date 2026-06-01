const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    reviewsList: [reviewSchema],
    badge: { type: String },
    badgeColor: { type: String },
    image: { type: String, required: true },
    freeDelivery: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
