const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users (without password)
// @access  Private
router.get('/', auth, userController.getUsers);

// @route   GET api/users/:id
// @desc    Get user by ID (without password)
// @access  Private
router.get('/:id', auth, userController.getUserById);

// @route   PUT api/users/profile
// @desc    Update user profile (username, avatar)
// @access  Private
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
