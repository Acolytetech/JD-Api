const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
} = require('../controllers/Cproduct');

// Get all products
router.get('/', getAllProducts);

// Get a single product by ID
router.get('/:productId', getProductById);

// Create a new product
router.post('/', createProduct);

// Update a product
router.put('/:productId', updateProduct);

// Delete a product
router.delete('/:productId', deleteProduct);

module.exports = router;
