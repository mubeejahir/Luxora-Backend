const AdminUser = require('../models/AdminUserModel');

// //post admin user (registration)
// exports.registerAdminUser = async (req, res) => {
//     try {                                       
//         const { userName, email, password, hotelName, hotelAddress } = req.body;  
//         const existingAdmin = await AdminUser.findOne({ email });
//         if (existingAdmin) {
//             return res.status(400).json({ error: 'Email already in use' });
//         }       
//         const newAdmin = await AdminUser.create({ userName, email, password, hotelName, hotelAddress });
//         res.status(201).json({ message: 'Admin user registered successfully', adminId: newAdmin._id });
//     } catch (err) {
//         console.error('registerAdminUser error:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }               
// };

// //get admin user (login)    
// exports.loginAdminUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;  
//         const adminUser = await AdminUser.findOne({ email, password });
//         if (!adminUser) {
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }   
//         res.json({ message: 'Login successful', adminId: adminUser._id });
//     } catch (err) {
//         console.error('loginAdminUser error:', err);
//         res.status(500).json({ error: err.message });
//     }
// };