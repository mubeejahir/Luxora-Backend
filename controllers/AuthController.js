const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const Guest = require('../models/GuestModel');


const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRES_IN 
        });
}


//create a new user signup
exports.registerGuest = async (req, res) => { 
    try {
        const { fullName, email, phone, password } = req.body;  
        const existingGuest = await Guest.findOne({ email });
        if (existingGuest) {
            return res.status(400).json({ error: 'Email already in use' });
        }   
        const newGuest = await Guest.create({ fullName, email, phone, password });
        //jwt
        const token = signToken(newGuest._id);
       
        res.status(201).json({ message: 'Guest registered successfully',token, newGuest });
    } catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ message: err.message });
    }       
};
 
//login
exports.loginGuest = async (req,res,next)=>{
    try{
        const { email, password } = req.body;  
        //1.check if email and password exist
        if(!email || !password){
            return next( new Error("please provide email and password!"))
        }

        //2.check if user exists && password is correct
        const guest = await Guest.findOne({email}).select('+password');
        // const correct = await guest.correctPassword(password, guest.password);

        if(!guest || !(await guest.correctPassword(password, guest.password))){
            return next(new Error ("Incorrect email or password!"))
        }
        
        //3.if everything ok send token to client
        const token = signToken(guest._id);
        res.status(201).json({message: "Login successfully", token})
    }catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ message: err.message });
    }    
}

//Protect
exports.protect = async (req,res,next) => {
    try{
    let token;
        //1. getting token and check of its there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new Error('You are not Logged in ! Please Logged in to get access'))
    }
        //2. verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    
        //3. check if user still exists
    const currentGuest = await Guest.findById(decoded.id);
    if(!currentGuest){
        return next(new Error("The Guest belongings to this token is no longer exists!"))
    }
        //4. check if user changed password after the token was issued

    //Grant Access to protected Route
    req.guest = currentGuest;
    next();

    }catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ message: err.message });
    }  
}

