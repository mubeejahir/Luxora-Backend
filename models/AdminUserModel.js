const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hotelName: { type: String, required: true },
    hotelAddress: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', AdminUserSchema);