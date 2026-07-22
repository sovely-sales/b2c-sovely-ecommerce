const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: false,
      min: 1,
      max: 100,
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    discountAmount: {
      type: Number,
      required: false,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expirationDate: {
      type: Date,
      required: false,
    },
    usageLimit: {
      type: Number,
      required: false,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

couponSchema.pre("validate", function (next) {
  if (this.discountType === "fixed") {
    if (!this.discountAmount || this.discountAmount < 1) {
      this.invalidate("discountAmount", "Fixed discount amount is required and must be at least 1");
    }
    this.discountPercent = undefined;
  } else {
    if (!this.discountPercent || this.discountPercent < 1 || this.discountPercent > 100) {
      this.invalidate("discountPercent", "Percentage discount is required and must be between 1 and 100");
    }
    this.discountAmount = undefined;
  }
  next();
});

module.exports = mongoose.model("Coupon", couponSchema);

