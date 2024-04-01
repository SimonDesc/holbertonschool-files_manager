const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

// Définition de la route GET /status
router.get('/status', AppController.getStatus);

// Définition de la route GET /stats
router.get('/stats', AppController.getStats);

// Create User route
router.post('/users', UsersController.postNew);

module.exports = router;
