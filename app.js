const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const productRoutes = require('./routes/product');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/products', productRoutes);

const startServer = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server failed to start', error);
        process.exit(1);
    }
};

startServer();
