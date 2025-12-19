const express = require('express');
const db = require('../db');
const { requireAuth } = require('./auth');

module.exports = function(upload) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch clients',
                code: 'FETCH_ERROR'
            });
        }
    });

    router.post('/', requireAuth, upload.single('image'), async (req, res) => {
        try {
            const { name, description, designation } = req.body;
            
            if (!name || !description || !designation) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, description, and designation are required',
                    code: 'VALIDATION_ERROR'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Image is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            const imageUrl = `/uploads/${req.file.filename}`;

            const [result] = await db.query(
                'INSERT INTO clients (name, description, designation, image_url) VALUES (?, ?, ?, ?)',
                [name, description, designation, imageUrl]
            );

            res.status(201).json({
                success: true,
                data: {
                    id: result.insertId,
                    name,
                    description,
                    designation,
                    image_url: imageUrl
                }
            });
        } catch (error) {
            console.error('Error creating client:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create client',
                code: 'CREATE_ERROR'
            });
        }
    });

    return router;
};
