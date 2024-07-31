const express = require('express');
const cors = require('cors');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const connectDB = require('./db/connect');
const productRoutes = require('./routes/product');
const Product = require('./models/mProduct');
const ProductJson = require('./products.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use('/api', productRoutes);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload images to Cloudinary
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

// Array of file paths to upload
const filePaths = [
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Clothes Organizer1.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Clothes Organizer2.jpg',
];

// Function to upload each file in filePaths array
const uploadFiles = async () => {
  try {
    const uploadResults = [];

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        const result = await uploadImageToCloudinary(filePath);
        uploadResults.push(result);
      } else {
        console.error(`File not found: ${filePath}`);
      }
    }

    console.log('Upload results:', uploadResults);
  } catch (error) {
    console.error('Upload error:', error);
  }
};

// Function to insert products if they do not already exist
const insertProductsIfNeeded = async () => {
  try {
    const existingProducts = await Product.find({}, { name: 1 });
    const existingProductNames = existingProducts.map(product => product.name);
    const insertPromises = [];

    for (const newProduct of ProductJson) {
      if (!existingProductNames.includes(newProduct.name)) {
        const mainImageUrl = await uploadImageToCloudinary(newProduct.mainImage);
        newProduct.mainImage = mainImageUrl;
        const additionalImageUrls = [];
        for (const additionalImage of newProduct.additionalImages) {
          const additionalImageUrl = await uploadImageToCloudinary(additionalImage);
          additionalImageUrls.push(additionalImageUrl);
        }
        newProduct.additionalImages = additionalImageUrls;
        const createPromise = Product.create(newProduct);
        insertPromises.push(createPromise);
        console.log(`Inserted new product: ${newProduct.name}`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent overwhelming Cloudinary
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

// Start the server and handle database connection
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    await uploadFiles(); // Upload files to Cloudinary
    await insertProductsIfNeeded(); // Insert products if needed
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
