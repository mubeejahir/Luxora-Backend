const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const AdminUserSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true , validate: [validator.isEmail, 'please provide a valid email']},
    password: { type: String, required: true, minlength: 8, select: false },
    hotelName: { type: String, required: true },
    hotelAddress: { type: String, required: true },
}, { timestamps: true });

AdminUserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

AdminUserSchema.methods.correctPassword = async (inputPassword, adminPassword)=>{
    return await bcrypt.compare(inputPassword, adminPassword);
} 


module.exports = mongoose.model('AdminUser', AdminUserSchema);