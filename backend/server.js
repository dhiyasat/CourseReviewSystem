
const express = require('express');
const reviewRoutes = require('./routes/reviews');
const courseRoutes = require('./routes/courses');
const weatherRoutes = require('./routes/weather');
const db = require('./db');


const app = express();
const PORT = 3000;

app.use(express.json());

// Register review routes
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
});

app.use('/reviews', reviewRoutes);
app.use('/courses', courseRoutes);
app.use('/weather', weatherRoutes);

// Homepage
app.get('/', (req, res) => {
    res.send('Course Review API is running!');
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.send('MySQL connection successful!');
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({ error: 'Database connection failed.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
