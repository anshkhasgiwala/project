const express = require('express');
const db = require('../db');
const { requireAuth } = require('./auth');

module.exports = function(upload) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch projects',
                code: 'FETCH_ERROR'
            });
        }
    });

    router.post('/', requireAuth, upload.single('image'), async (req, res) => {
        try {
            const { name, description } = req.body;
            
            if (!name || !description) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and description are required',
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
                'INSERT INTO projects (name, description, image_url) VALUES (?, ?, ?)',
                [name, description, imageUrl]
            );

            res.status(201).json({
                success: true,
                data: {
                    id: result.insertId,
                    name,
                    description,
                    image_url: imageUrl
                }
            });
        } catch (error) {
            console.error('Error creating project:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create project',
                code: 'CREATE_ERROR'
            });
        }
    });

    return router;
};
