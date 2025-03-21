const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Register a new user
exports.register = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({
                errors: [{ msg: 'User already exists' }]
            });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        // Save user to DB
        await user.save();

        // Create JWT payload
        const payload = {
            id: user.id
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login user
exports.login = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid credentials' }]
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid credentials' }]
            });
        }

        // Update user to online
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        // Create JWT payload
        const payload = {
            id: user.id
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar,
                        isOnline: user.isOnline
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        // Update user to offline
        await User.findByIdAndUpdate(req.user.id, {
            isOnline: false,
            lastSeen: new Date()
        });

        res.json({ msg: 'User logged out' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.refreshToken = async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });
  
      // Verify refresh token
      jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });
  
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });
  
        // Generate a new access token
        const newAccessToken = jwt.sign(
          { id: user._id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "15m" } // Shorter expiry for security
        );
  
        res.json({ accessToken: newAccessToken });
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };