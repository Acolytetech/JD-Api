const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/Cproduct');

// Get all products
router.get('/', getAllProducts);

// Create a new product
router.post('/', createProduct);

// Update a product
router.put('/:productId', updateProduct);

// Delete a product
router.delete('/:productId', deleteProduct);

module.exports = router;
