const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');

// Définition de la route GET /status
router.get('/status', AppController.getStatus);

// Définition de la route GET /stats
router.get('/stats', AppController.getStats);

module.exports = router;
