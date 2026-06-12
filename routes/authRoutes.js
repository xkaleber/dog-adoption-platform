const { Router } = require('express');
const authController = require('../controllers/authController');
const router = Router();

// Authentication Views
router.get('/signup', authController.signup_get);
router.get('/login', authController.login_get);

// Authentication Logic
router.post('/signup', authController.signup_post);
router.post('/login', authController.login_post);

// Security Fix: Handle logout via POST to prevent CSRF logout attacks
router.post('/logout', authController.logout_post);

module.exports = router;
