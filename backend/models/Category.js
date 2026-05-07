const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  bg: { type: String, required: true },
  count: { type: String, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
