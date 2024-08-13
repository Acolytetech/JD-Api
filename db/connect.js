const mongoose = require('mongoose');

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useUnifiedTopology: true // This is still recommended for handling MongoDB topology
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1); // Exit process on error
    }
};

module.exports = connectDB;
