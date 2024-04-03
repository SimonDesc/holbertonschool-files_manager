const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

// Définition de la route GET /status
router.get('/status', AppController.getStatus);

// Définition de la route GET /stats
router.get('/stats', AppController.getStats);

// Create User route
router.post('/users', UsersController.postNew);

// Définition de la route GET /connect
router.get('/connect', AuthController.getConnect);

// Définition de la route GET /disconnect
router.get('/disconnect', AuthController.getDisconnect);

// Définition de la route GET /users/me
router.get('/users/me', UsersController.getMe);

// Définition de la route POST /files
router.post('/files', FilesController.postUpload);

module.exports = router;
