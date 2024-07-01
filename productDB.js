require("dotenv").config();
const connectDB = require("./db/connect");
const Product = require("./models/mProduct");
const ProductJson = require("./Products.json");

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        await Product.deleteMany();
        await Product.create(ProductJson);

        console.log("Data successfully inserted!");
    } catch (error) {
        console.log(error);
    }
};

start();
