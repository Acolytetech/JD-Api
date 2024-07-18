const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mainImage: {
        type: String,
        required: true,
    },
    additionalImages: {
        type: [String],
    },
    details: [{
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    }],
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    ratings: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    material: {
        type: String,
        required: true,
    },
    roomType: {
        type: [String],
        required: true,
    },
    numberOfShelves: {
        type: Number,
        required: true,
    },
    specialFeature: {
        type: String,
        required: true,
    },
    productDimensions: {
        type: String,
        required: true,
    },
    style: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    productCareInstructions: {
        type: String,
        required: true,
    },
    sizeOptions: [{
        size: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    }],
});

module.exports = mongoose.model('Product', productSchema);
