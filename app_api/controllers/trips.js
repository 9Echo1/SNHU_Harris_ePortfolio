const mongoose = require('mongoose');
const Trip = require('../models/travlr'); //Register Model
const Model = mongoose.model('trips');

// GET: /trips - lists all the trips
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client.
const tripsList = async (req, res) => {
    try {
        const { resort, sortBy, search, maxPrice } = req.query;

        let query = {};

        // Filter by resort
        if (resort) {
            query.resort = { $regex: resort, $options: "i" };
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by max price
        if (maxPrice) {
            query.perPerson = { $lte: Number(maxPrice) };
        }

        let tripsQuery = Model.find(query);

        // Database-side sorting where possible
        if (sortBy === 'price') {
            tripsQuery.sort({ perPerson: 1 });
        } else if (sortBy === 'name') {
            tripsQuery = tripsQuery.sort({ name: 1});
        }

        const results = await tripsQuery.exec();

        return res.status(200).json(results);

    } catch (err) {
        console.error('Error retrieving trips:', err);
        return res.status(500).json({
            message: 'Error retrieving trips',
            error: err.message
        });
    }
};

// Get: /trips/:tripCode 
// Gets all the trips regardless of the outcome, response must include HTML 
// status code and JSON message to the requesting client.
const tripsFindByCode = async (req, res) => {
    try {
        const q = await Model.findOne({
            code: req.params.tripCode.toUpperCase()
        }).exec();

        if (!q) {
            return res.status(404).json({ message: 'Trip not found '});
        } else {
            return res.status(200).json(q);
        }
    } catch (err) {
        console.error('Error retrieving trip:', err);
        return res.status(500).json({
            message: 'Error retrieving trip',
            error: err.message
        });
    }
};

// PUT: /trips/:tripCode - regardless of the outcome 
// Updates a Trip, response must include HTML status code 
// and JSON message to the requesting client.
const tripsUpdateTrip = async (req, res) => {
    try {
        const q = await Model.findOneAndUpdate(
            { code: req.params.tripCode.toUpperCase() },
            {
                code: req.body.code ? req.body.code.toUpperCase() : undefined,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson !== undefined ? Number(req.body.perPerson) : undefined,
                image: req.body.image,
                description: req.body.description
            },
            {
                new: true,
                runValidators: true
            }
        ).exec();

        if (!q) {
            return res.status(404).json({ message: 'Trip not found' });
        } else {
            return res.status(200).json(q);
        }
    } catch (err) {
        console.error('Error updating trip:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: err.message
            });
        }

        if (err.code === 11000) {
            return res.status(400).json({
                message: 'Trip code must be unique',
                error: err.message
            });
        }

        return res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    }
};

// POST: /trips - regardless of the outcome, 
// Adds a Trip, response must include HTML status code 
// and JSON message to the requesting client.
const tripsAddTrip = async (req, res) => {
    console.log('tripsAddTrip HIT', req.body);
    
    try {
        const newtrip = new Trip({
            code: req.body.code ? req.body.code.toUpperCase() : undefined,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: Number(req.body.perPerson),
            image: req.body.image,
            description: req.body.description
        });

        const q = await newtrip.save();

        return res.status(201).json(q);

    } catch (err) {
        console.error('Error creating trip:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: err.message
            });
        }

        if (err.code === 11000) {
            return res.status(400).json({
                message: 'Trip code must be unique',
                error: err.message
            });
        }

        return res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip,
};