const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');
const productRoutes = require('./routes/product');
const Product = require('./models/mProduct');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS settings
const allowedOrigins = ['http://localhost:3000', 'https://ecommerce-4jip.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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

// Function to generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Function to upload image to Cloudinary
const uploadImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'products' // Optional: Folder in Cloudinary where images will be stored
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Function to insert products if needed
const insertProductsIfNeeded = async () => {
  try {
    // Load products from JSON file
    const ProductJson = require('./products.json');

    // Check if products already exist
    const existingProducts = await Product.find({}, { name: 1 });
    const existingProductNames = existingProducts.map(product => product.name);
    const insertPromises = [];

    for (const newProduct of ProductJson) {
      if (!existingProductNames.includes(newProduct.name)) {
        // Upload main image to Cloudinary
        const mainImageUrl = await uploadImageToCloudinary(newProduct.mainImage);
        newProduct.mainImage = mainImageUrl;

        // Upload additional images to Cloudinary
        const additionalImageUrls = [];
        for (const additionalImage of newProduct.additionalImages) {
          const additionalImageUrl = await uploadImageToCloudinary(additionalImage);
          additionalImageUrls.push(additionalImageUrl);
        }
        newProduct.additionalImages = additionalImageUrls;

        // Create new product
        const createPromise = Product.create(newProduct);
        insertPromises.push(createPromise);
        console.log(`Inserted new product: ${newProduct.name}`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Optional delay between inserts
      } else {
        console.log(`Product already exists: ${newProduct.name}`);
      }
    }

    await Promise.all(insertPromises);
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

// Start server and initialize operations
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Insert products if needed
    await insertProductsIfNeeded();

    // Start the server
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

module.exports = app;
