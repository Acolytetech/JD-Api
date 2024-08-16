const Product = require('../models/mProduct');
const cloudinary = require('cloudinary').v2;

// Function to generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get a single product by order number or ID
exports.getProductById = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if the identifier is a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    // Find product by order number or ID
    const product = isObjectId
      ? await Product.findById(identifier) // If it's a valid ObjectId, search by ID
      : await Product.findOne({ orderNumber: identifier }); // Otherwise, search by orderNumber

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'products'
  });
  return result.secure_url;
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, details, color, material, specialFeature, productDimensions, closureType, itemWeight, shape, numberOfItems, sizeOptions } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const mainImageUrl = req.files['mainImage'] ? await uploadImageToCloudinary(req.files['mainImage'][0]) : '';
    const additionalImageUrls = req.files['additionalImages'] ? await Promise.all(req.files['additionalImages'].map(file => uploadImageToCloudinary(file))) : [];

    const parsedDetails = details ? JSON.parse(details) : [];
    const parsedSizeOptions = sizeOptions ? JSON.parse(sizeOptions) : [];

    const orderNumber = generateOrderNumber(); // Generate unique order number

    const newProduct = new Product({
      name,
      price,
      details: parsedDetails,
      color,
      material,
      specialFeature,
      productDimensions,
      closureType,
      itemWeight,
      shape,
      numberOfItems,
      sizeOptions: parsedSizeOptions,
      mainImage: mainImageUrl,
      additionalImages: additionalImageUrls,
      orderNumber
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', orderNumber });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, details, color, material, specialFeature, productDimensions, closureType, itemWeight, shape, numberOfItems, sizeOptions } = req.body;

    const mainImageUrl = req.files['mainImage'] ? await uploadImageToCloudinary(req.files['mainImage'][0]) : '';
    const additionalImageUrls = req.files['additionalImages'] ? await Promise.all(req.files['additionalImages'].map(file => uploadImageToCloudinary(file))) : [];

    const parsedDetails = details ? JSON.parse(details) : [];
    const parsedSizeOptions = sizeOptions ? JSON.parse(sizeOptions) : [];

    const updatedProduct = await Product.findOneAndUpdate(
      { orderNumber: req.params.identifier },
      {
        name,
        price,
        details: parsedDetails,
        color,
        material,
        specialFeature,
        productDimensions,
        closureType,
        itemWeight,
        shape,
        numberOfItems,
        sizeOptions: parsedSizeOptions,
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ orderNumber: req.params.identifier });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
