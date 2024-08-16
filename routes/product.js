const express = require('express');
const multer = require('multer');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById
} = require('../controllers/Cproduct');

const router = express.Router();

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Get all products
router.get('/', getAllProducts);

// Get a single product by id
router.get('/:id', getProductById);

// Create a new product with image upload
router.post('/', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), createProduct);

// Update a product with image upload
router.put('/:id', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), updateProduct);

// Delete a product by id
router.delete('/:id', deleteProduct);

module.exports = router;
