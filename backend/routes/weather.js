
const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// POST: Fetchs weather from OpenWeatherMap and save it
router.post('/:city', async (req, res) => {
    try {
        const city = req.params.city;

        // Fetchs weather from OpenWeatherMap
        const url = 'https://api.openweathermap.org/data/2.5/forecast';

        const response = await axios.get(url, {
            params: {
                q: city,
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        const weather = response.data.list[0];

        const temperature = weather.main.temp;
        const description = weather.weather[0].description;

        // Saves weather data to MySQL
        await db.query(
            `INSERT INTO WEATHER (city, temperature, description)
             VALUES (?, ?, ?)`,
            [response.data.city.name, temperature, description]
        );

        res.status(201).json({
            message: 'Weather fetched and saved successfully.',
            city: response.data.city.name,
            temperature,
            description
        });

    } catch (error) {
        console.error('WEATHER ERROR:', error.response?.data || error.message);

        res.status(500).json({
            error: 'Failed to fetch or save weather data.'
        });
    }
});

// GET: Retrieves saved weather records
router.get('/', async (req, res) => {
    try {
        const [weather] = await db.query(
            'SELECT * FROM WEATHER ORDER BY recordedAt DESC'
        );

        res.json(weather);

    } catch (error) {
        console.error('GET WEATHER ERROR:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve weather records.'
        });
    }
});

// DELETE: Deletes a weather record by ID
router.delete('/:id', async (req, res) => {
    try {

        const [result] = await db.query(
            'DELETE FROM WEATHER WHERE weatherID = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Weather record not found.'
            });
        }

        res.json({
            message: 'Weather record deleted successfully.'
        });

    } catch (error) {
        console.error('DELETE WEATHER ERROR:', error.message);
        res.status(500).json({
            error: 'Failed to delete weather record.'
        });
    }
});

module.exports = router;
