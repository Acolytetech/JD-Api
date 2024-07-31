// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const Product = require('../models/mProduct');

// Multer setup
const upload = multer({ dest: 'uploads/' }); // Temporarily store files locally

// Controller functions for product routes (similar to what you already have)

// Create a new product with image upload to Cloudinary
router.post('/', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), async (req, res) => {
  try {
    const { name, price, rating, size, material, details } = req.body;

    // Upload main image to Cloudinary
    const mainImage = await cloudinary.uploader.upload(req.files.mainImage[0].path);

    // Upload additional images to Cloudinary
    const additionalImages = [];
    for (const file of req.files.additionalImages) {
      const image = await cloudinary.uploader.upload(file.path);
      additionalImages.push(image.secure_url);
    }

    const newProduct = new Product({
      name,
      price,
      rating,
      size,
      material,
      details,
      mainImage: mainImage.secure_url,
      additionalImages
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error.message });
  }
});

// Other product routes (GET all, GET by ID, PUT, DELETE) here...

module.exports = router;
