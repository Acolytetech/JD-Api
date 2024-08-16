// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from React frontend

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    format: async (req, file) => 'jpeg',
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage: storage });

// MongoDB connection
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Product schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  rating: { type: String, required: true },
  size: { type: String, required: false },
  material: { type: String, required: true },
  details: { type: String, required: true },
  mainImage: { type: String, required: true },
  additionalImages: { type: [String], required: false },
});

const Product = mongoose.model('Product', ProductSchema);

// Helper function for error responses
const sendError = (res, statusCode, message, error) => {
  console.error(message, error.message);
  res.status(statusCode).json({ message, error: error.message });
};

// Endpoint to add a new product
app.post('/', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 4 }
]), async (req, res) => {
  try {
    console.log('Received Request Body:', req.body);
    console.log('Received Files:', req.files);

    const { name, price, details, material, rating, size } = req.body;

    // Check for required fields
    if (!name || !price || !details || !material || !rating) {
      return res.status(400).json({ message: 'Name, price, details, material, and rating are required' });
    }

    // Ensure main image is provided
    if (!req.files || !req.files.mainImage) {
      return res.status(400).json({ message: 'Main image is required' });
    }

    // Check for uploaded files
    const mainImageUrl = req.files.mainImage ? req.files.mainImage[0].path : '';
    const additionalImageUrls = req.files.additionalImages ? req.files.additionalImages.map(file => file.path) : [];

    // Create and save the new product
    const newProduct = new Product({
      name,
      price,
      details,
      material,
      rating,
      size: size || '',
      mainImage: mainImageUrl,
      additionalImages: additionalImageUrls,
    });

    await newProduct.save();
    console.log('Product successfully added:', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    sendError(res, 500, 'Error adding product', error);
  }
});

// Endpoint to get all products
app.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    sendError(res, 500, 'Error fetching products', error);
  }
});

// Endpoint to get a single product by ID
app.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    sendError(res, 500, 'Error fetching product', error);
  }
});

// Endpoint to update a product by ID
app.put('/products/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 4 }
]), async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);

    const { name, price, details, material, rating, size } = req.body;

    const mainImageUrl = req.files.mainImage ? req.files.mainImage[0].path : '';
    const additionalImageUrls = req.files.additionalImages ? req.files.additionalImages.map(file => file.path) : [];

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      name,
      price,
      details,
      material,
      rating,
      size: size || '',
      mainImage: mainImageUrl || undefined,
      additionalImages: additionalImageUrls.length ? additionalImageUrls : undefined,
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    sendError(res, 500, 'Error updating product', error);
  }
});

// Endpoint to delete a product by ID
app.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Error deleting product', error);
  }
});

// Start server and initialize operations
const startServer = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/productsdb';
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary environment variables.');
    process.exit(1);
  }

  if (!mongoUri) {
    console.error('Missing MongoDB URI.');
    process.exit(1);
  }

  try {
    await connectDB(mongoUri);
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start', error);
    process.exit(1);
  }
};

startServer();
