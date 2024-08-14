const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  mainImage: {
    type: String,
    required: true,
  },
  additionalImages: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", Product);
