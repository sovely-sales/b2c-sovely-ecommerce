require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Find and update or create
  let admin = await Admin.findOne({ email: 'admin@sovely.in' });
  
  if (admin) {
    console.log('ℹ️  Admin exists. Updating password to Admin@123...');
    admin.password = 'Admin@123';
    await admin.save();
    console.log('✅ Admin password updated.');
  } else {
    await Admin.create({ email: 'admin@sovely.in', password: 'Admin@123', name: 'Sovely Admin' });
    console.log('✅ Admin created: admin@sovely.in / Admin@123');
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });
