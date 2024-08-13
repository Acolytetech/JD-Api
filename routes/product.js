const express = require('express');
const multer = require('multer');
const path = require('path');
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
router.get('/:id', async (req, res) => {
  console.log('Request ID:', req.params.id); // Debugging line
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get a single product by ID
router.get('/:orderNumber', getProductById);

router.put('/:id', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), updateProduct);


// Create a new product with image upload
router.post('/', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), createProduct);

// Update a product with image upload
router.put('/:orderNumber', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), updateProduct);

// Delete a product
router.delete('/:orderNumber', deleteProduct);

module.exports = router;
