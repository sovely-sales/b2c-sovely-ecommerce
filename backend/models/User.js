const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    wishlist: [{ type: String }],
    savedAddresses: [
      {
        firstName: String,
        lastName: String,
        phone: String,
        address: String,
        city: String,
        postalCode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true, collection: "b2c_users" },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
