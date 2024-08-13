// server.js

// Required packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const productRoutes = require('./routes/product');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS settings
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

// Connect to MongoDB
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Function to insert products if needed
const insertProductsIfNeeded = async () => {
  try {
    const ProductJson = require('./products.json');
    const Product = require('./models/mProduct');
    const existingProducts = await Product.find({}, { name: 1 });
    const existingProductNames = existingProducts.map(product => product.name);

    for (const newProduct of ProductJson) {
      if (!existingProductNames.includes(newProduct.name)) {
        const orderNumber = generateOrderNumber(); // Generate order number
        await Product.create({ ...newProduct, orderNumber }); // Add order number to the new product
        console.log(`Inserted new product: ${newProduct.name}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        console.log(`Product already exists: ${newProduct.name}`);
      }
    }
    console.log("Data insertion completed!");
  } catch (error) {
    console.error('Error inserting products:', error);
    throw error;
  }
};

// Endpoint to handle product creation
app.post('/add-product', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 3 }]), async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);

    const { name, price, details, color, material, specialFeature, productDimensions, closureType, itemWeight, shape, numberOfItems, sizeOptions } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const mainImageUrl = req.files.mainImage ? req.files.mainImage[0].path : '';
    const additionalImageUrls = req.files.additionalImages ? req.files.additionalImages.map(file => file.path) : [];

    const parsedDetails = details ? JSON.parse(details) : [];
    const parsedSizeOptions = sizeOptions ? JSON.parse(sizeOptions) : [];

    const orderNumber = generateOrderNumber();

    const Product = require('./models/mProduct');
    const newProduct = new Product({
      name,
      price,
      details: parsedDetails,
      color,
      material,
      specialFeature,
      productDimensions,
      closureType,
      itemWeight,
      shape,
      numberOfItems,
      sizeOptions: parsedSizeOptions,
      mainImage: mainImageUrl,
      additionalImages: additionalImageUrls,
      orderNumber
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', orderNumber });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Root endpoint to get all products
app.get("/", async (req, res) => {
  try {
    const Product = require('./models/mProduct');
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server and initialize operations
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Insert products if needed
    await insertProductsIfNeeded();

    app.use('/products', productRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start', error);
    process.exit(1);
  }
};

// Call function to start server
startServer();
