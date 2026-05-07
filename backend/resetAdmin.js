require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function resetAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Delete all existing admins to avoid conflicts
  const del = await Admin.deleteMany({});
  console.log(`🗑️ Deleted ${del.deletedCount} existing admins.`);

  // Create fresh admin
  const admin = new Admin({ 
    email: 'admin@gmail.com', 
    password: 'Admin@123', 
    name: 'Sovely Admin' 
  });
  await admin.save();
  
  console.log('✨ Fresh Admin Created: admin@gmail.com / Admin@123');
  
  await mongoose.disconnect();
  console.log('🔌 Done!');
}

resetAdmin().catch(err => { console.error(err); process.exit(1); });
