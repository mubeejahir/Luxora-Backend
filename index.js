const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

dotenv.config();
const port = process.env.PORT || 8800;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log('MongoDB connection error:', error);
    }
}

// Test route
app.get('/', (req, res) => {
    res.send('Hello from the Hotel Booking API!');
});

// Start server
app.listen(port, () => {
    // connectDB();
    console.log(`Server is running on port ${port}`);
});