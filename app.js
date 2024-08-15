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
    required: false,  // Make size optional
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
    type: [String],
    required: false,  // Make additionalImages optional
  },
});

const Product = mongoose.model("Product", ProductSchema);

// Endpoint to handle product creation
app.post('/add-product', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 4 }  // Allow up to 4 additional images
]), async (req, res) => {
  try {
      console.log('Request Body:', req.body);
      console.log('Files:', req.files);

      const { name, price, details, material, rating, size } = req.body;

      if (!name || !price) {
          return res.status(400).json({ message: 'Name and price are required' });
      }

      const mainImageUrl = req.files.mainImage ? req.files.mainImage[0].path : '';
      const additionalImageUrls = req.files.additionalImages ? req.files.additionalImages.map(file => file.path) : [];

      const newProduct = new Product({
          name,
          price,
          details,
          material,
          rating,
          size: size || '',  // Ensure size is included but optional
          mainImage: mainImageUrl,
          additionalImages: additionalImageUrls,
      });

      await newProduct.save();
      res.status(201).json(newProduct);

  } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server and initialize operations
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI || "mongodb://localhost:27017/productsdb");
    console.log('MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start', error);
    process.exit(1);
  }
};

startServer();
