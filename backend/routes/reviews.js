
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: Retrieve all reviews
router.get('/', async (req, res) => {
    try {
        const [reviews] = await db.query(
            'SELECT * FROM REVIEW'
        );

        res.json(reviews);

    } catch (error) {
        console.error('GET REVIEWS ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// GET: Retrieve review statistics
router.get('/stats', async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT
                COUNT(*) AS totalReviews,
                AVG(rating) AS averageRating,
                SUM(rating = 1) AS oneStar,
                SUM(rating = 2) AS twoStars,
                SUM(rating = 3) AS threeStars,
                SUM(rating = 4) AS fourStars,
                SUM(rating = 5) AS fiveStars
            FROM REVIEW
        `);

        res.json(stats[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve review statistics.'
        });
    }
});

// GET: Retrieve one review by ID
router.get('/:id', async (req, res) => {
    try {
        const [reviews] = await db.query(
            'SELECT * FROM REVIEW WHERE reviewID = ?',
            [req.params.id]
        );

        if (reviews.length === 0) {
            return res.status(404).json({
                error: 'Review not found.'
            });
        }

        res.json(reviews[0]);

    } catch (error) {
        console.error('GET REVIEW ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// POST: Add a new review
router.post('/', async (req, res) => {

    try {
        const {
            reviewID,
            rating,
            reviewtext,
            studentID,
            coursesCode,
            sectionNumber,
            term
        } = req.body;

        // Check required fields
        if (
            !Number.isInteger(Number(reviewID)) ||
            Number(reviewID) <= 0 ||
            rating === undefined ||
            rating === null ||
            !reviewtext ||
            !Number.isInteger(Number(studentID)) ||
            Number(studentID) <= 0 ||
            !coursesCode ||
            !Number.isInteger(Number(sectionNumber)) ||
            Number(sectionNumber) <= 0 ||
            !term
        ) {
            return res.status(400).json({
                error: 'Please provide valid review information.'
            });
        }

        // Validate rating
        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                error: 'Rating must be a number between 1 and 5.'
            });
        }

        // Insert review
        const sql = `
            INSERT INTO REVIEW
            (reviewID, rating, reviewtext, studentID,
             coursesCode, sectionNumber, term)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            reviewID,
            Number(rating),
            reviewtext,
            studentID,
            coursesCode,
            sectionNumber,
            term
        ]);

        res.status(201).json({
            message: 'Review added successfully.'
        });

    } catch (error) {
        console.error('POST REVIEW ERROR:', error);

        res.status(500).json({
            error: 'Failed to add review.',
            details: error.message
        });
    }
});

// PUT: Update an existing review
router.put('/:id', async (req, res) => {
    try {
        const { rating, reviewtext } = req.body;

        if (
            rating === undefined ||
            rating === null ||
            typeof reviewtext !== 'string' ||
            !reviewtext.trim()
        ) {
            return res.status(400).json({
                error: 'Rating and review text are required.'
            });
        }

        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5.'
            });
        }

        const [result] = await db.query(
            `UPDATE REVIEW
             SET rating = ?, reviewtext = ?
             WHERE reviewID = ?`,
            [Number(rating), reviewtext, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Review not found.'
            });
        }

        res.json({
            message: 'Review updated successfully.'
        });

    } catch (error) {
        console.error('UPDATE REVIEW ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Delete a review
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM REVIEW WHERE reviewID = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Review not found.'
            });
        }

        res.json({
            message: 'Review deleted successfully.'
        });

    } catch (error) {
        console.error('DELETE REVIEW ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
