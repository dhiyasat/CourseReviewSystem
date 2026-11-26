
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: Retrieves all courses
router.get('/', async (req, res) => {
    try {
        const [courses] = await db.query('SELECT * FROM COURSES');
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve courses.' });
    }
});

// GET: Retrieves one course by courseCode
router.get('/:id', async (req, res) => {
    try {
        const [courses] = await db.query(
            'SELECT * FROM COURSES WHERE courseCode = ?',
            [req.params.id]
        );

        if (courses.length === 0) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        res.json(courses[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve course.' });
    }
});

// POST: Adds a new course
router.post('/', async (req, res) => {
    try {
        const {
            courseCode,
            courseName,
            courseDescription,
            creditHours,
            sectionNumber
        } = req.body;

        //Checks if POST request is invalid
        if (!courseCode || !courseName || !courseDescription ||
            !Number.isFinite(Number(creditHours)) || Number(creditHours) < 0 ||
            !Number.isInteger(Number(sectionNumber)) || Number(sectionNumber) <= 0) {
            return res.status(400).json({
                error: 'Please provide valid course information.'
            });
        }

        const sql = `
            INSERT INTO COURSES
            (courseCode, courseName, courseDescription, creditHours, sectionNumber)
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            courseCode,
            courseName,
            courseDescription,
            creditHours,
            sectionNumber
        ]);

        res.status(201).json({ message: 'Course added successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add course.' });
    }
});

// PUT: Updates an existing course
router.put('/:id', async (req, res) => {
    try {
        const {
            courseName,
            courseDescription,
            creditHours,
            sectionNumber
        } = req.body;

        // Checks if Put Request is Invalid
        if (!courseName || !courseDescription ||
           !Number.isFinite(Number(creditHours)) || Number(creditHours) < 0 ||
           !Number.isInteger(Number(sectionNumber)) || Number(sectionNumber) <= 0 ) {
            return res.status(400).json({
                error: 'Please provide valid course information.'
            });
        }

        const [result] = await db.query(
            `UPDATE COURSES
             SET courseName = ?, courseDescription = ?,
                 creditHours = ?, sectionNumber = ?
             WHERE courseCode = ?`,
            [
                courseName,
                courseDescription,
                creditHours,
                sectionNumber,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        res.json({ message: 'Course updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update course.' });
    }
});

// DELETE: Deletes a course
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM COURSES WHERE courseCode = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        res.json({ message: 'Course deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete course.' });
    }
});

module.exports = router;
