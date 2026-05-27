const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Admin = require('./models/Admin');
const User = require('./models/User');
const { signToken, authenticate } = require('./middleware/auth');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 8014;

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ─── MongoDB ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ═════════════════════════════════════════════════════════════
// PUBLIC PRODUCT & CATEGORY ROUTES
// ═════════════════════════════════════════════════════════════

app.get('/api/categories', async (req, res) => {
  try {
    res.json(await Category.find({}));
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, limit, skip, search, deals } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      const Category = require('./models/Category');
      const mongoose = require('mongoose');
      
      const categoryDoc = await Category.findOne({
        $or: [
          { name: { $regex: new RegExp('^' + category + '$', 'i') } },
          { id: category }
        ]
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
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { title: searchRegex }
      ];
    }

    if (deals === 'true') {
      filter.$or = [
        { $expr: { $gt: [ "$suggestedRetailPrice", "$dropshipBasePrice" ] } },
        { $expr: { $gt: [ "$originalPrice", "$price" ] } }
      ];
    }

    const query = Product.find(filter);
    const queryLimit = limit ? parseInt(limit) : 24;
    const querySkip = skip ? parseInt(skip) : 0;
    
    query.skip(querySkip).limit(queryLimit);

    const products = await query;
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { id: isNaN(id) ? -1 : parseInt(id) }] };
    } else {
      query = { id: isNaN(id) ? -1 : parseInt(id) };
    }
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ═════════════════════════════════════════════════════════════
// ORDER ROUTES (public checkout)
// ═════════════════════════════════════════════════════════════

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json({ success: true, orderId: saved._id });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// GET /api/orders/track/:id - public tracking
app.get('/api/orders/track/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch {
    res.status(400).json({ message: 'Invalid Order ID' });
  }
});


// ═════════════════════════════════════════════════════════════
// ADMIN AUTH  (stores in b2c_admins)
// ═════════════════════════════════════════════════════════════

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ id: admin._id, email: admin.email, role: 'admin', name: admin.name });
    res.json({ success: true, token, name: admin.name, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/admin/me  — verify token & return admin info
app.get('/api/admin/me', authenticate('admin'), (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role });
});

// GET /api/admin/orders  — protected
app.get('/api/admin/orders', authenticate('admin'), async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/admin/users — admin can list all customers
app.get('/api/admin/users', authenticate('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /api/admin/orders/:id/status — update order status
app.patch('/api/admin/orders/:id/status', authenticate('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});


// ═════════════════════════════════════════════════════════════
// CUSTOMER AUTH (stores in b2c_users)
// ═════════════════════════════════════════════════════════════

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });
    const token = signToken({ id: user._id, email: user.email, role: 'user', name: user.name });
    res.status(201).json({ success: true, token, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const lowerEmail = email.toLowerCase();
    
    // 1. Check if it's an Admin
    let admin = await Admin.findOne({ email: lowerEmail });
    if (admin) {
      console.log('Admin found, checking password...');
      const match = await admin.comparePassword(password);
      console.log('Password match:', match);
      if (match) {
        const token = signToken({ id: admin._id, email: admin.email, role: 'admin', name: admin.name });
        return res.json({ success: true, token, name: admin.name, email: admin.email, role: 'admin' });
      }
    }

    // 2. Check if it's a Customer
    let user = await User.findOne({ email: lowerEmail });
    if (user) {
      console.log('User found, checking password...');
      const match = await user.comparePassword(password);
      console.log('Password match:', match);
      if (match) {
        const token = signToken({ id: user._id, email: user.email, role: 'user', name: user.name });
        return res.json({ success: true, token, name: user.name, email: user.email, role: 'user' });
      }
    }

    console.log('No match found for:', email);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/me - get current user
app.get('/api/me', authenticate('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});
// GET /api/user/orders - get orders for logged in user
app.get('/api/user/orders', authenticate('user'), async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});
app.post('/api/user/address', authenticate('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddr = req.body;
    const exists = user.savedAddresses.some(a => a.address === newAddr.address && a.postalCode === newAddr.postalCode);
    
    if (!exists) {
      user.savedAddresses.push(newAddr);
      await user.save();
    }
    res.json({ success: true, addresses: user.savedAddresses });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/user/addresses - Get saved addresses
app.get('/api/user/addresses', authenticate('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.savedAddresses || []);
  } catch {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/razorpay/order - Create order for razorpay
app.post('/api/razorpay/order', async (req, res) => {
  try {
    const { amount } = req.body; 
    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error('Razorpay Order Error:', err);
    res.status(500).json({ message: 'Could not create Razorpay order' });
  }
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
