const express = require('express'); // Express app
const router = express.Router();    // Router logic
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

// This is where we import the controllers we want to route
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

// Method to authenticate JWT
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    console.log('AUTH HEADER:', authHeader);

    if (!authHeader) {
        console.log('Auth Header Required but NOT PRESENT!');
        return res.sendStatus(401);
    }

    const headers = authHeader.split(' ');

    if (headers.length < 2) {
        console.log('Not enough tokens in Auth Header: ' + headers.length);
        return res.sendStatus(401);
    }

    const token = headers[1];

    console.log('TOKEN RECEIVED:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    if (!token) {
        console.log('Null Bearer Token');
        return res.sendStatus(401);
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log('TOKEN VERIFIED:', verified);
        req.auth = verified;
        next();
    } catch (err) {
        console.log('Token Validation Error:', err.message);
        return res.sendStatus(401);
    }
}

// Define the route for registration endpoint
router.route('/register').post(authController.register);
router.route('/login').post(authController.login);

// Define the route for our trips endpoint
router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

// GET Method routes tripsFindByCode - requires parameter
// PUT Method routes tripsUpdateTrip - requires parameter
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;