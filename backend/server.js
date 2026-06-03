const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
require("dotenv").config({ path: "../.env" });

const Product = require("./models/Product");
const Category = require("./models/Category");
const Order = require("./models/Order");
const Admin = require("./models/Admin");
const User = require("./models/User");
const Coupon = require("./models/Coupon");
const { signToken, authenticate } = require("./middleware/auth");

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8014;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const calculateCartTotal = async (items) => {
  let calculatedSubtotal = 0;

  for (let item of items) {
    let query = mongoose.Types.ObjectId.isValid(item.id)
      ? {
          $or: [
            { _id: item.id },
            { id: isNaN(item.id) ? -1 : parseInt(item.id) },
          ],
        }
      : { id: isNaN(item.id) ? -1 : parseInt(item.id) };

    const product = await Product.findOne(query);
    if (product) {
      const itemPrice = (product.dropshipBasePrice || product.price || 0) + 30;
      calculatedSubtotal += itemPrice * item.quantity;
    }
  }

  const deliveryFee = calculatedSubtotal > 499 ? 0 : 50;
  return {
    calculatedSubtotal,
    deliveryFee,
    finalTotal: calculatedSubtotal + deliveryFee,
  };
};

app.get("/api/categories", async (req, res) => {
  try {
    res.json(await Category.find({}));
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, limit, skip, search, deals, minPrice, maxPrice, sort } =
      req.query;
    let filter = {};

    if (category && category !== "All") {
      const safeCategory = escapeRegex(category.trim());
      const categoryDoc = await Category.findOne({
        $or: [
          { name: { $regex: new RegExp("^" + safeCategory + "$", "i") } },
          { id: category },
        ],
      });

      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      } else if (mongoose.Types.ObjectId.isValid(category)) {
        filter.categoryId = new mongoose.Types.ObjectId(category);
      } else {
        filter.categoryId = category;
      }
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const terms = safeSearch.split(/\s+/);

      const allWordsRegex = new RegExp(
        terms.map((t) => `(?=.*${t})`).join(""),
        "i",
      );
      const typoRegex = new RegExp(safeSearch.split("").join(".*?"), "i");

      filter.$or = [{ name: allWordsRegex }, { title: allWordsRegex }];

      if (safeSearch.length < 20) {
        filter.$or.push({ name: typoRegex }, { title: typoRegex });
      }
    }

    if (deals === "true") {
      filter.$or = [
        { $expr: { $gt: ["$suggestedRetailPrice", "$dropshipBasePrice"] } },
        { $expr: { $gt: ["$originalPrice", "$price"] } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) {
        priceFilter.$gte = parseFloat(minPrice) - 30;
      }
      if (maxPrice) {
        priceFilter.$lte = parseFloat(maxPrice) - 30;
      }
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ dropshipBasePrice: priceFilter }, { price: priceFilter }],
      });
    }

    const query = Product.find(filter);

    let sortObj = {};
    if (sort === "priceAsc") {
      sortObj = { dropshipBasePrice: 1, price: 1 };
    } else if (sort === "priceDesc") {
      sortObj = { dropshipBasePrice: -1, price: -1 };
    } else if (sort === "popularity") {
      sortObj = { rating: -1, reviews: -1, averageRating: -1, reviewCount: -1 };
    } else {
      sortObj = { createdAt: -1 };
    }
    query.sort(sortObj);

    const queryLimit = Math.max(1, parseInt(limit) || 24);
    const querySkip = Math.max(0, parseInt(skip) || 0);

    query.skip(querySkip).limit(queryLimit);

    const products = await query;
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { id: isNaN(id) ? -1 : parseInt(id) }] };
    } else {
      query = { id: isNaN(id) ? -1 : parseInt(id) };
    }
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { items, ...restBody } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { finalTotal } = await calculateCartTotal(items);

    let userId = null;
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Ignore invalid token
      }
    }

    const order = new Order({
      ...restBody,
      items,
      total: finalTotal,
      userId,
    });

    const saved = await order.save();
    res.status(201).json({ success: true, orderId: saved._id });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to save order" });
  }
});

app.get("/api/orders/track/:id", async (req, res) => {
  try {
    const id = req.params.id.trim();
    let order = null;

    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findById(id);
    }

    if (!order) {
      const allOrders = await Order.find({}).sort({ createdAt: -1 }).limit(500);
      order = allOrders.find(
        (o) => o._id.toString().endsWith(id) || o._id.toString().includes(id),
      );
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found. Please check your Order ID and try again.",
      });
    }

    res.json(order);
  } catch (err) {
    console.error("Track order error:", err);
    res.status(400).json({
      message: "Could not look up that Order ID. Please verify and try again.",
    });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = signToken({
      id: admin._id,
      email: admin.email,
      role: "admin",
      name: admin.name,
    });
    res.json({ success: true, token, name: admin.name, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/admin/me", authenticate("admin"), (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
  });
});

app.get("/api/admin/orders", authenticate("admin"), async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/admin/users", authenticate("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.patch(
  "/api/admin/orders/:id/status",
  authenticate("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true },
      );
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json({ success: true, order });
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  },
);

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone });
    const token = signToken({
      id: user._id,
      email: user.email,
      role: "user",
      name: user.name,
    });
    res
      .status(201)
      .json({ success: true, token, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const lowerEmail = email.toLowerCase();

    let admin = await Admin.findOne({ email: lowerEmail });
    if (admin && (await admin.comparePassword(password))) {
      const token = signToken({
        id: admin._id,
        email: admin.email,
        role: "admin",
        name: admin.name,
      });
      return res.json({
        success: true,
        token,
        name: admin.name,
        email: admin.email,
        role: "admin",
      });
    }

    let user = await User.findOne({ email: lowerEmail });
    if (user && (await user.comparePassword(password))) {
      const token = signToken({
        id: user._id,
        email: user.email,
        role: "user",
        name: user.name,
      });
      return res.json({
        success: true,
        token,
        name: user.name,
        email: user.email,
        role: "user",
      });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/me", authenticate("user"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/user/orders", authenticate("user"), async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/user/address", authenticate("user"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddr = req.body;
    const exists = user.savedAddresses.some(
      (a) =>
        a.address === newAddr.address && a.postalCode === newAddr.postalCode,
    );

    if (!exists) {
      user.savedAddresses.push(newAddr);
      await user.save();
    }
    res.json({ success: true, addresses: user.savedAddresses });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/user/wishlist", authenticate("user"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.wishlist || []);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post(
  "/api/user/wishlist/toggle",
  authenticate("user"),
  async (req, res) => {
    try {
      const { productId } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.wishlist) user.wishlist = [];

      const stringId = String(productId);
      const index = user.wishlist.indexOf(stringId);

      if (index === -1) {
        user.wishlist.push(stringId);
      } else {
        user.wishlist.splice(index, 1);
      }

      await user.save();
      res.json({ success: true, wishlist: user.wishlist });
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

app.post(
  "/api/products/:id/reviews",
  authenticate("user"),
  async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const { id } = req.params;

      let query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { id: isNaN(id) ? -1 : parseInt(id) }] }
        : { id: isNaN(id) ? -1 : parseInt(id) };

      const product = await Product.findOne(query);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      const alreadyReviewed = product.reviewsList.find(
        (r) => r.userId.toString() === req.user.id.toString(),
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: "Product already reviewed" });
      }

      const review = {
        userId: req.user.id,
        userName: req.user.name,
        rating: Number(rating),
        comment,
      };

      product.reviewsList.push(review);
      product.reviews = product.reviewsList.length;
      product.rating =
        product.reviewsList.reduce((acc, item) => item.rating + acc, 0) /
        product.reviewsList.length;

      await product.save();
      res.status(201).json({ success: true, message: "Review added", product });
    } catch (error) {
      console.error("Review error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

app.get("/api/user/addresses", authenticate("user"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.savedAddresses || []);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/razorpay/order", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { finalTotal } = await calculateCartTotal(items);

    const options = {
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order, finalTotal });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ message: "Could not create Razorpay order" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
