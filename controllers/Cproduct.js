const cloudinary = require('cloudinary').v2;
const Product = require('../models/mProduct');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, details, quantity, ratings } = req.body;
        const mainImage = req.file.path; // Assuming multer is used for file upload

        // Upload main image to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(mainImage);
        const mainImageUrl = cloudinaryResponse.secure_url;

        // Create new product with Cloudinary URL
        const newProduct = new Product({
            name,
            mainImage: mainImageUrl,
            details,
            quantity,
            ratings,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, details, quantity, ratings } = req.body;

        // Update product details
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, details, quantity, ratings },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Delete product
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
