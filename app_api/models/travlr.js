const mongoose = require('mongoose');

// Define the trip schema
const tripSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Trip code is required'],
        unique: true,
        trim: true, 
        uppercase: true
    }, 
    name: {
        type: String, 
        required: [true, 'Trip name is required'],
        trim: true
    }, 
    length: {
        type: String, 
        required: [true, 'Trip name is required'],
        trim: true
    }, 
    start: {
        type: Date, 
        required: [true, 'Start date is required']
    }, 
    resort: {
        type: String, 
        required: [true, 'Resort is required'],
        trim: true
    },
    perPerson: {
        type: Number, 
        required: [true, 'Price per person is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: 'default-trip.jpg',
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    }
}, {
    timestamps: true
});

tripSchema.index({ perPerson: 1});

const Trip = mongoose.model('trips', tripSchema);
module.exports = Trip;