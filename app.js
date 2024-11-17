require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
const port = process.env.PORT;
const cors = require('cors'); // Import cors

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();
app.use(cors());

app.use(express.json());

// Define the Product Schema
const productSchema = new mongoose.Schema({
    productname: { type: String, required: true },
    price: { type: Number, required: true },
    imageurl: { type: String, required: true },
    displayImages: [{ type: String, required: true }],
    category: { type: [String], required: true },
    sizes: [{ type: String, required: true }],
    description: {type: String, required: true},
    shippingAndReturn:{ type: String, required: true},
    careGuide: { type: String, required: true},
    gender: {type: String, required: true}
}, { versionKey: false });


// Main model for the 'products' collection.
const MainProductModel = mongoose.model('MainProduct', productSchema, 'products');

// Endpoint 1: Add a new product to the 'products' collection
app.post('/create-product', async (req, res) => {
    const productData = {
        productname: req.body.productname,
        price: req.body.price,
        imageurl: req.body.imageurl,
        displayImages: req.body.displayImages,
        category: req.body.category,
        sizes: req.body.sizes,
        description: req.body.description,
        shippingAndReturn: req.body.shippingAndReturn,
        careGuide: req.body.careGuide,
        gender: req.body.gender
    };

    try {
        // Save product in the main 'products' collection only
        const savedMainProduct = await new MainProductModel(productData).save();
        res.status(201).json({
            message: 'Product added to the main products collection successfully',
            mainProduct: savedMainProduct
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint 2: Add a new product to a specific collection based on the category provided
app.post('/create-product-in/:collectionName', async (req, res) => {
    const { collectionName } = req.params; // Get collection name from URL parameter

    // Dynamic model for the specified collection name
    const DynamicProductModel = mongoose.model(collectionName, productSchema, collectionName);

    const productData = {
        productname: req.body.productname,
        price: req.body.price,
        imageurl: req.body.imageurl,
        displayImages: req.body.displayImages,
        category: req.body.category,
        sizes: req.body.sizes,
        description: req.body.description,
        shippingAndReturn: req.body.shippingAndReturn,
        careGuide: req.body.careGuide,
        gender: req.body.gender
    };

    try {
        // Save product in the specified sub-collection only
        const savedSubProduct = await new DynamicProductModel(productData).save();
        res.status(201).json({
            message: `Product added to the ${collectionName} collection successfully`,
            subProduct: savedSubProduct
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Create a GET route to fetch products from the main 'products' collection
app.get('/get-products', async (req, res) => {
    try {
        const products = await MainProductModel.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Optional: Create a GET route to fetch products from a specified collection
app.get('/get-products/:collectionName', async (req, res) => {
    const { collectionName } = req.params;

    try {
        const DynamicProductModel = mongoose.model(collectionName, productSchema, collectionName);
        const products = await DynamicProductModel.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/get-product-details/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await MainProductModel.findById(productId); // Use MainProductModel here
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const Razorpay = require('razorpay');
const instance = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET',
});

app.post('/create-order', async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // amount in paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };
  try {
    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.listen(port || 3000, () => {
    console.log(`Server Started at ${port}.`)
})

app.use(cors({
    origin: 'http://localhost:4200'
}));