
const Guest = require('../models/GuestModel');

//get all guest
exports.getAllGuests = async (req,res)=>{
    try{
        const guests = await Guest.find();
        res.status(201).json({message: "retrived all Guests successfully", guests})
    }catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ message: err.message });
    }   
}


