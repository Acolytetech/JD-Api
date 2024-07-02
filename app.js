const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const productRoutes = require('./routes/product');
const Product = require('./models/mProduct');
const ProductJson = require('./products.json'); // Assuming this file contains your new products
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for product routes
app.use('/api/products', productRoutes);

// Function to insert new products only if they don't already exist
const insertProductsIfNeeded = async () => {
    try {
        // Fetch all existing product names from MongoDB
        const existingProducts = await Product.find({}, { name: 1 });
        const existingProductNames = existingProducts.map(product => product.name);

        // Array to store promises for product creation
        const insertPromises = [];

        // Iterate over ProductJson and insert products sequentially
        for (const newProduct of ProductJson) {
            if (!existingProductNames.includes(newProduct.name)) {
                // Create a new promise for each product insertion
                const createPromise = Product.create(newProduct);
                insertPromises.push(createPromise);
                console.log(`Inserted new product: ${newProduct.name}`);
                // Wait for a short delay to maintain sequential order
                await new Promise(resolve => setTimeout(resolve, 100)); // Adjust delay as needed
            } else {
                console.log(`Product already exists: ${newProduct.name}`);
            }
        }

        // Wait for all insert operations to complete
        await Promise.all(insertPromises);

        console.log("Data insertion completed!");
    } catch (error) {
        console.error('Error inserting products:', error);
        throw error; // Propagate error for handling
    }
};

const startServer = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        // Insert new products if needed
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

startServer();

module.exports = app;
