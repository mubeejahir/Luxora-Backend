const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const GuestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true , validate: [validator.isEmail, 'please provide a valid email']},
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 8, select: false },
}, { timestamps: true });


GuestSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

GuestSchema.methods.correctPassword = async (candidatePassword, guestPassword)=>{
    return await bcrypt.compare(candidatePassword, guestPassword);
} 

module.exports = mongoose.model('Guest', GuestSchema);
