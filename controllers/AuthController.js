const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const Guest = require('../models/GuestModel');
const AdminUser = require('../models/AdminUserModel');


const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRES_IN 
        });
}

//guest cookie 
const createSendToken =   (guest, statusCode, res) => {
  const token =  signToken(guest._id);
  
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax", 
    secure: isProduction, 
  };


  res.cookie("jwt", token, cookieOptions);
  
  guest.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    role: 'guest',
    data: { guest },
  });
};

//admin cookie
const createAdminSendToken = (admin, statusCode, res)=> {
    const token = signToken(admin); 
const cookieOptions  = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
}
if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
res.cookie('jwt', token, cookieOptions)


admin.password = undefined;

res.status(statusCode).json({
    status: 'success',
    token,
    role: "admin",
    data:admin
    
})
}

//GUEST AUTH

//create a new user signup
exports.registerGuest = async (req, res) => { 
    try {
        const { fullName, email, phone, password } = req.body;  
        const existingGuest = await Guest.findOne({ email });
        if (existingGuest) {
            return res.status(400).json({ error: 'Email already in use' });
        }   
        const newGuest = await Guest.create({ fullName, email, phone, password });
   
        createSendToken(newGuest, 201, res)
       
    } catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ message: err.message });
    }       
};
 
//login guest
exports.loginGuest = async (req,res,next)=>{
    try{
        const { email, password } = req.body;  
      
        if(!email || !password){
            return next( new Error("please provide email and password!"))
        }

        const guest = await Guest.findOne({email}).select('+password');

        console.log(guest)
        if(!guest || !(await guest.correctPassword(password, guest.password))){
            return next(new Error ("Incorrect email or password!"))
        }
    
         createSendToken(guest, 201, res)
    }catch (err) {
        console.error('registerGuest error:', err);
        res.status(500).json({ message: err.message });
    }    
}

//Protect
exports.protect = async (req, res, next) => {
  console.log("Protected Route");

  try {
    let token;
console.log(req.cookies)
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in. Please log in to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

   
    let user =
      (await Guest.findById(decoded.id)) ||
      (await AdminUser.findById(decoded.id));

    if (!user) {
      return res
        .status(401)
        .json({ message: "The user belonging to this token no longer exists." });
    }

 
    if (user instanceof Guest) {
      req.guest = user;
      req.role = "guest";
    } else if (user instanceof AdminUser) {
      req.admin = user;
      req.role = "admin";
    }

   
    next();
  } catch (err) {
    console.error("Protect route error:", err);
    res.status(500).json({ message: err.message });
  }
};

//ADMIN AUTH

//new admin signup(create)
exports.registerAdmin = async (req, res) => { 
    try {
        const { userName, email, password, hotelName, hotelAddress } = req.body;  
        const existingAdmin = await AdminUser.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already in use' });
        }   
        const newAdmin = await AdminUser.create({ userName, email, password, hotelName, hotelAddress });
      
        createAdminSendToken(newAdmin, 201, res);
    } catch (err) {
        console.error('registerAdmin error:', err);
        res.status(500).json({ message: err.message });
    }       
};

//login Admin 
exports.loginAdmin = async (req,res,next)=>{
  try{
    const { email, password } = req.body;  

    if(!email || !password){
      return next(new Error("please provide email and password!"));
    }
  
    const admin = await AdminUser.findOne({email}).select('+password');


    if(!admin){
      return res.status(401).json({ message: "Admin is not valid" });
    }

    const correct = await admin.correctPassword(password, admin.password);

    if(!correct){
      return next(new Error("Incorrect email or password!"));
    }

    createAdminSendToken(admin,201,res);
  }
  catch (err) {
    console.error('loginAdmin error:', err);
    res.status(500).json({ message: err.message });
  }
}

