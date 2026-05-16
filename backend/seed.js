require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const Product = require("./models/Product");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  let admin = await Admin.findOne({ email: "admin@sovely.in" });
  if (admin) {
    console.log("ℹ️  Admin exists. Updating password to Admin@123...");
    admin.password = "Admin@123";
    await admin.save();
    console.log("✅ Admin password updated.");
  } else {
    await Admin.create({
      email: "admin@sovely.in",
      password: "Admin@123",
      name: "Sovely Admin",
    });
    console.log("✅ Admin created: admin@sovely.in / Admin@123");
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log("ℹ️  No products found. Seeding dummy inventory...");

    const dummyProducts = [
      {
        id: 101,
        name: "Premium Wireless Headphones",
        category: "Electronics",
        price: 2999,
        originalPrice: 4999,
        rating: 4.8,
        reviews: 124,
        badge: "Sale",
        badgeColor: "#ef4444",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        freeDelivery: true,
      },
      {
        id: 102,
        name: "Minimalist Ceramic Vase",
        category: "Home & Decor",
        price: 899,
        originalPrice: 1299,
        rating: 4.5,
        reviews: 89,
        badge: "Bestseller",
        badgeColor: "#3b82f6",
        image:
          "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&h=800&fit=crop",
        freeDelivery: false,
      },
      {
        id: 103,
        name: "Organic Cotton T-Shirt",
        category: "Apparel",
        price: 599,
        originalPrice: 799,
        rating: 4.2,
        reviews: 45,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        freeDelivery: true,
      },
    ];

    await Product.insertMany(dummyProducts);
    console.log("✅ Dummy products seeded successfully.");
  } else {
    console.log(
      `ℹ️  Database already has ${productCount} products. Skipping product seed.`,
    );
  }

  await mongoose.disconnect();
  console.log("🔌 Disconnected. Done!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
