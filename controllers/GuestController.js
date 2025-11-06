const Guest = require('../models/GuestModel');

//post the data for the new guests
exports.registerGuest = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;  
        const existingGuest = await Guest.findOne({ email });
        if (existingGuest) {
            return res.status(400).json({ error: 'Email already in use' });
        }   
        const newGuest = await Guest.create({ fullName, email, phone, password });
        res.status(201).json({ message: 'Guest registered successfully', guestId: newGuest._id });
    } catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }       
};

//get the user data for login
exports.loginGuest = async (req, res) => {
    try {
        const { email, password } = req.body;  
        const guest = await Guest.findOne({ email, password });
        if (!guest) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }   
        res.json({ message: 'Login successful', guestId: guest._id });
    } catch (err) {
        console.error('loginGuest error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};