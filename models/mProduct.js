const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mainImage: {
    type: String,
    required: true,
  },
  additionalImages: [{
    type: String,
  }],
  details: [{
    description: {
      type: String,
      required: false,
    },
  }],
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
  },
  material: {
    type: String,
  },
  specialFeature: {
    type: String,
  },
  productDimensions: {
    type: String,
  },
  closureType: {
    type: String,
  },
  itemWeight: {
    type: Number,
  },
  shape: {
    type: String,
  },
  numberOfItems: {
    type: Number,
  },
  sizeOptions: [{
    size: {
      type: String,
    },
    price: {
      type: Number,
    },
  }],
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  }
});

module.exports = mongoose.model('Product', productSchema);
