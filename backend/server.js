const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Razorpay = require("razorpay");
require("dotenv").config({ path: "../.env" });

const Product = require("./models/Product");
const Category = require("./models/Category");
const Order = require("./models/Order");
const Admin = require("./models/Admin");
const User = require("./models/User");
const Coupon = require("./models/Coupon");
const Marketing = require("./models/Marketing");
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
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const calculateCartTotal = async (items, couponCode = null) => {
  let calculatedSubtotal = 0;
  const sanitizedItems = [];

  for (let item of items) {
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for item ID: ${item.id}`);
    }

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
      calculatedSubtotal += itemPrice * qty;

      sanitizedItems.push({
        id: String(product.id || product._id),
        productId: product._id,
        name: product.name || product.title || "Product",
        price: itemPrice,
        quantity: qty,
        image: product.image,
      });
    } else {
      throw new Error(`Product not found for ID: ${item.id}`);
    }
  }

  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const normalizedCode = couponCode.toUpperCase().replace(/\s+/g, "");
    const validCoupon = await Coupon.findOne({
      code: normalizedCode,
      isActive: true,
    });

    if (validCoupon) {
      if (
        validCoupon.expirationDate &&
        new Date() > validCoupon.expirationDate
      ) {
        throw new Error("This coupon has expired.");
      }

      if (
        validCoupon.usageLimit &&
        validCoupon.timesUsed >= validCoupon.usageLimit
      ) {
        throw new Error("This coupon has reached its usage limit.");
      }

      discountAmount = Math.round(
        calculatedSubtotal * (validCoupon.discountPercent / 100),
      );
      appliedCoupon = validCoupon.code;
    } else {
      throw new Error("Invalid coupon code.");
    }
  }

  const discountedSubtotal = calculatedSubtotal - discountAmount;
  const deliveryFee = discountedSubtotal > 499 ? 0 : 50;

  return {
    calculatedSubtotal,
    discountAmount,
    deliveryFee,
    finalTotal: discountedSubtotal + deliveryFee,
    sanitizedItems,
    appliedCoupon,
  };
};
app.get("/api/categories", async (req, res) => {
  try {
    const activeCategories = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);
    
    const categoryIds = activeCategories.map(c => c._id).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    
    const countMap = {};
    activeCategories.forEach(c => {
      countMap[String(c._id)] = c.count;
    });
    
    const enriched = categories.map(cat => ({
      ...cat,
      count: countMap[String(cat._id)] || 0
    }));
    
    enriched.sort((a, b) => (countMap[String(b._id)] || 0) - (countMap[String(a._id)] || 0));
    
    res.json(enriched);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const {
      category,
      limit,
      skip,
      search,
      deals,
      minPrice,
      maxPrice,
      sort,
      freeDelivery,
      minRating,
    } = req.query;
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

    if (freeDelivery === "true") {
      filter.freeDelivery = true;
    }

    if (minRating) {
      const ratingNum = parseFloat(minRating);
      if (!isNaN(ratingNum)) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { rating: { $gte: ratingNum } },
            { averageRating: { $gte: ratingNum } },
          ],
        });
      }
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
      sortObj = { rating: -1, averageRating: -1 };
    } else if (sort === "reviews") {
      sortObj = { reviews: -1, reviewCount: -1 };
    } else if (sort === "nameAsc") {
      sortObj = { name: 1, title: 1 };
    } else if (sort === "nameDesc") {
      sortObj = { name: -1, title: -1 };
    } else {
      sortObj = { _id: -1 };
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

app.get("/api/marketing", async (req, res) => {
  try {
    const marketingData = await Marketing.find({});
    res.json(marketingData);
  } catch (error) {
    console.error("Error fetching marketing data:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/admin/marketing", authenticate("admin"), async (req, res) => {
  try {
    const { section, data } = req.body;

    if (!section || !data) {
      return res.status(400).json({ message: "Section and data are required" });
    }

    const updated = await Marketing.findOneAndUpdate(
      { section },
      { section, data },
      { upsert: true, new: true },
    );

    res.json({ success: true, marketing: updated });
  } catch (error) {
    console.error("Error saving marketing data:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { items, couponCode, ...restBody } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { finalTotal, sanitizedItems, appliedCoupon } =
      await calculateCartTotal(items, couponCode);

    let userId = null;
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {}
    }

    const order = new Order({
      ...restBody,
      items: sanitizedItems,
      total: finalTotal,
      couponCode: appliedCoupon, // <-- Explicitly save it here too
      userId,
    });

    const saved = await order.save();

    // <-- ADD THIS: Increment the coupon right away for COD orders
    if (appliedCoupon) {
      await Coupon.findOneAndUpdate(
        { code: appliedCoupon },
        { $inc: { timesUsed: 1 } },
      );
    }

    res.status(201).json({ success: true, orderId: saved._id });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message || "Failed to save order" });
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
      const allOrders = await Order.find({ status: { $ne: "Pending Payment" } })
        .sort({ createdAt: -1 })
        .limit(500);
      order = allOrders.find(
        (o) => o._id.toString().endsWith(id) || o._id.toString().includes(id),
      );
    }

    if (!order || order.status === "Pending Payment") {
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

app.post("/api/orders/init", async (req, res) => {
  try {
    const { items, couponCode, ...restBody } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const {
      calculatedSubtotal,
      deliveryFee,
      finalTotal,
      discountAmount,
      sanitizedItems,
      appliedCoupon,
    } = await calculateCartTotal(items, couponCode);

    const options = {
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const rzpOrder = await razorpay.orders.create(options);

    const order = new Order({
      ...restBody,
      items: sanitizedItems,
      total: finalTotal,
      couponCode: appliedCoupon,
      status: restBody.paymentMethod === "COD" ? "Pending" : "Pending Payment",
      razorpayOrderId: rzpOrder.id,
    });

    const savedOrder = await order.save();

    res.json({ success: true, rzpOrder, dbOrderId: savedOrder._id });
  } catch (err) {
    console.error("Init Error:", err);
    res
      .status(500)
      .json({ message: err.message || "Order initialization failed" });
  }
});

app.post("/api/orders/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findOneAndUpdate(
        {
          _id: dbOrderId,
          razorpayOrderId: razorpay_order_id,
          status: "Pending Payment",
        },
        {
          $set: {
            status: "Paid",
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
        },
        { new: true },
      );

      const completedOrder = await Order.findById(dbOrderId);
      if (completedOrder && completedOrder.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: completedOrder.couponCode },
          { $inc: { timesUsed: 1 } },
        );
      }

      if (!order) {
        return res.status(400).json({
          success: false,
          message: "Order already processed, not found, or ID mismatch.",
        });
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid Signature. Spoofing detected.",
      });
    }
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ message: "Verification failed" });
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

app.get("/api/user/orders", authenticate("user"), async (req, res) => {
  try {
    const orders = await Order.find({
      email: req.user.email,
      status: { $ne: "Pending Payment" },
    }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/admin/orders", authenticate("admin"), async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "Pending Payment" } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
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

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (order.status === "Pending Payment" && status !== "Cancelled") {
        return res.status(400).json({
          message: "Cannot update status. Payment has not been verified yet.",
        });
      }

      order.status = status;
      await order.save();

      res.json({ success: true, order });
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  },
);

app.patch(
  "/api/admin/products/:id/price",
  authenticate("admin"),
  async (req, res) => {
    try {
      const { price, originalPrice } = req.body;
      const { id } = req.params;

      if (price === undefined || originalPrice === undefined) {
        return res
          .status(400)
          .json({ message: "Price and originalPrice are required" });
      }

      let query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { id: isNaN(id) ? -1 : parseInt(id) }] }
        : { id: isNaN(id) ? -1 : parseInt(id) };

      const updatedProduct = await Product.findOneAndUpdate(
        query,
        {
          $set: {
            price: Number(price),
            originalPrice: Number(originalPrice),
          },
        },
        { new: true },
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ success: true, product: updatedProduct });
    } catch (err) {
      console.error("Price change error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

app.post(
  "/api/admin/products/bulk-price-increase",
  authenticate("admin"),
  async (req, res) => {
    try {
      const { type, value } = req.body;
      if (!type || value === undefined || isNaN(value)) {
        return res.status(400).json({ message: "Invalid type or value" });
      }

      const products = await Product.find({});
      const bulkOps = products.map((p) => {
        const currentPrice =
          p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30;
        const currentOriginalPrice =
          p.originalPrice !== undefined
            ? p.originalPrice
            : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30;

        let newPrice = currentPrice;
        let newOriginalPrice = currentOriginalPrice;

        if (type === "amount") {
          newPrice += Number(value);
          newOriginalPrice += Number(value);
        } else if (type === "percent") {
          newPrice = Math.round(newPrice * (1 + Number(value) / 100));
          newOriginalPrice = Math.round(
            newOriginalPrice * (1 + Number(value) / 100),
          );
        }

        return {
          updateOne: {
            filter: { _id: p._id },
            update: {
              $set: { price: newPrice, originalPrice: newOriginalPrice },
            },
          },
        };
      });

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
      }

      res.json({
        success: true,
        message: `Successfully increased prices of ${bulkOps.length} products.`,
      });
    } catch (err) {
      console.error("Bulk price increase error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

app.post(
  "/api/admin/products/bulk-price-decrease",
  authenticate("admin"),
  async (req, res) => {
    try {
      const { type, value } = req.body;
      if (!type || value === undefined || isNaN(value)) {
        return res.status(400).json({ message: "Invalid type or value" });
      }

      const products = await Product.find({});
      const bulkOps = products.map((p) => {
        const currentPrice =
          p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30;
        const currentOriginalPrice =
          p.originalPrice !== undefined
            ? p.originalPrice
            : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30;

        let newPrice = currentPrice;
        let newOriginalPrice = currentOriginalPrice;

        if (type === "amount") {
          newPrice -= Number(value);
          newOriginalPrice -= Number(value);
        } else if (type === "percent") {
          newPrice = Math.round(newPrice * (1 - Number(value) / 100));
          newOriginalPrice = Math.round(
            newOriginalPrice * (1 - Number(value) / 100),
          );
        }

        // Prevent negative prices
        newPrice = Math.max(0, newPrice);
        newOriginalPrice = Math.max(0, newOriginalPrice);

        return {
          updateOne: {
            filter: { _id: p._id },
            update: {
              $set: { price: newPrice, originalPrice: newOriginalPrice },
            },
          },
        };
      });

      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
      }

      res.json({
        success: true,
        message: `Successfully decreased prices of ${bulkOps.length} products.`,
      });
    } catch (err) {
      console.error("Bulk price decrease error:", err);
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

app.get("/api/coupons", async (req, res) => {
  try {
    res.json(await Coupon.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: "Error fetching coupons" });
  }
});

app.post("/api/admin/coupons", authenticate("admin"), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ message: "Error creating coupon" });
  }
});

app.delete(
  "/api/admin/coupons/:id",
  authenticate("admin"),
  async (req, res) => {
    try {
      await Coupon.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Error deleting coupon" });
    }
  },
);

app.post("/api/razorpay/webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).send("Webhook secret not configured");

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(req.rawBody);
    const digest = shasum.digest("hex");

    if (digest === signature) {
      console.log(`Webhook Received: ${req.body.event}`);

      if (
        req.body.event === "payment.captured" ||
        req.body.event === "order.paid"
      ) {
        const paymentEntity = req.body.payload.payment.entity;
        const rzpOrderId = paymentEntity.order_id;
        const rzpPaymentId = paymentEntity.id;

        const order = await Order.findOneAndUpdate(
          { razorpayOrderId: rzpOrderId, status: "Pending Payment" },
          {
            $set: {
              status: "Paid",
              razorpayPaymentId: rzpPaymentId,
            },
          },
          { new: true },
        );

        if (order) {
          console.log(`✅ Webhook rescued & updated order: ${order._id}`);
        }
      }

      res.status(200).json({ status: "ok" });
    } else {
      console.error(
        "❌ Webhook signature mismatch. Potential spoofing attempt.",
      );
      res.status(400).send("Invalid signature");
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Server Error");
  }
});
