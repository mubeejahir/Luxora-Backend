const multer = require("multer");

const storage = multer.memoryStorage();

const uploadMemory = multer({ storage });

module.exports = uploadMemory;
