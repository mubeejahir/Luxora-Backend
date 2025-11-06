const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

// Fixed: call the exported handler name from controllers/exampleController.js
router.get('/example', exampleController.getExample);

module.exports = router;
