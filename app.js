const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const app = express();
const connectDB = require('./db/connect');
const productRoutes = require('./routes/product');
const Product = require('./models/mProduct');
const ProductJson = require('./products.json');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000' 
}));

// Middleware for product routes
app.use('/', productRoutes);

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer middleware for file uploads to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', 
    format: async (req, file) => 'png', 
    public_id: (req, file) => `${Date.now()}-${file.originalname}`
  }
});

const upload = multer({ storage: storage });


app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.path });
});


const insertProductsIfNeeded = async () => {
  
};

const startServer = async () => {
   
};

startServer();

module.exports = app;
