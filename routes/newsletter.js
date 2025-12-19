const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch newsletter subscribers',
            code: 'FETCH_ERROR'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
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

        try {
            const [result] = await db.query(
                'INSERT INTO newsletter_subscribers (email) VALUES (?)',
                [email]
            );

            res.status(201).json({
                success: true,
                message: 'Successfully subscribed to newsletter',
                data: {
                    id: result.insertId,
                    email
                }
            });
        } catch (dbError) {
            if (dbError.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    error: 'This email is already subscribed',
                    code: 'DUPLICATE_EMAIL'
                });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Error creating newsletter subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to subscribe to newsletter',
            code: 'CREATE_ERROR'
        });
    }
});

module.exports = router;
