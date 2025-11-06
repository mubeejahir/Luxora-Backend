// Sample model
const mongoose = require('mongoose');

const SampleSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

module.exports = mongoose.model('Sample', SampleSchema);
