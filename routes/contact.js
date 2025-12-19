const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching contact submissions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact submissions',
            code: 'FETCH_ERROR'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { full_name, email, mobile, city } = req.body;
        
        if (!full_name || !email || !mobile || !city) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: full_name, email, mobile, city',
                code: 'VALIDATION_ERROR'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
                code: 'VALIDATION_ERROR'
            });
        }

        const [result] = await db.query(
            'INSERT INTO contact_submissions (full_name, email, mobile, city) VALUES (?, ?, ?, ?)',
            [full_name, email, mobile, city]
        );

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: {
                id: result.insertId,
                full_name,
                email,
                mobile,
                city
            }
        });
    } catch (error) {
        console.error('Error creating contact submission:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit contact form',
            code: 'CREATE_ERROR'
        });
    }
});

module.exports = router;
