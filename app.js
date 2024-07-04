const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db/connect');
const productRoutes = require('./routes/product');
const Product = require('./models/mProduct');
const ProductJson = require('./products.json');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use('/', productRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Array of file paths to upload
const filePaths = [
  // first api images
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Clothes Organizer1.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Clothes Organizer2.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Clothes Organizer3.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Clothes Organizer4.jpg',
  // second api images
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Tiers Plastic Storage Boxes1.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Tiers Plastic Storage Boxes2.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Tiers Plastic Storage Boxes3.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Tiers Plastic Storage Boxes4.jpg',
  // third api images
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Foldable Wardrobe1.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Foldable Wardrobe2.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Foldable Wardrobe3.jpg',
  'C:\\Users\\acoly\\OneDrive\\Desktop\\projects\\KD\\api\\JD-Api\\images\\Foldable Wardrobe4.jpg'
];

// Function to upload each file in filePaths array
const uploadFiles = async () => {
  try {
    const uploadResults = [];

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'products' // Optional: Folder in Cloudinary where images will be stored
        });
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
        await new Promise(resolve => setTimeout(resolve, 100));
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

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    await insertProductsIfNeeded();
    await uploadFiles(); // Call the function to upload files to Cloudinary
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
