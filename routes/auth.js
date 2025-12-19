const express = require('express');
const router = express.Router();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function generateToken() {
    return 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const activeTokens = new Set();

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password are required'
        });
    }
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = generateToken();
        activeTokens.add(token);
        
        res.json({
            success: true,
            token: token,
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid username or password'
        });
    }
});

router.post('/verify', (req, res) => {
    const { token } = req.body;
    
    if (activeTokens.has(token)) {
        res.json({
            success: true,
            valid: true
        });
    } else {
        res.status(401).json({
            success: false,
            valid: false,
            error: 'Invalid or expired token'
        });
    }
});

router.post('/logout', (req, res) => {
    const { token } = req.body;
    
    activeTokens.delete(token);
    
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

function requireAuth(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized. Please login.'
        });
    }
    
    next();
}

module.exports = router;
module.exports.requireAuth = requireAuth;
