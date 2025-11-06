// Use the Mongoose model for persistent data
const Sample = require('../models/sample');

// GET /api/sample
exports.getSample = async (req, res) => {
    try {
        const samples = await Sample.find().lean();
        res.json(samples);
    } catch (err) {
        console.error('getSample error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/sample  (optional helper used by consumers/tests)
exports.createSample = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const created = await Sample.create({ name });
        res.status(201).json(created);
    } catch (err) {
        console.error('createSample error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
