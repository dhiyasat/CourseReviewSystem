
const API_URL = '';

// Fetch weather for a city
async function fetchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const result = document.getElementById('weatherResult');

    if (!city) {
        result.textContent = 'Please enter a city.';
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/weather/${encodeURIComponent(city)}`,
            { method: 'POST' }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather.');
        }

        result.innerHTML = `
            <h3>${data.city}</h3>
            <p>Temperature: ${data.temperature}°C</p>
            <p>Description: ${data.description}</p>
        `;

        loadWeatherRecords();

    } catch (error) {
        result.textContent = error.message;
    }
}

// Retrieve saved weather records
async function loadWeatherRecords() {
    const container = document.getElementById('weatherRecords');

    try {
        const response = await fetch(`${API_URL}/weather`);
        const records = await response.json();

        if (!response.ok) {
            throw new Error('Failed to retrieve weather records.');
        }

        container.innerHTML = '';

        records.forEach(record => {
            const item = document.createElement('div');

            item.innerHTML = `
                <h4>${record.city}</h4>
                <p>${record.temperature}°C - ${record.description}</p>
                <p>${new Date(record.recordedAt).toLocaleString()}</p>
                <button onclick="deleteWeather(${record.weatherID})">
                    Delete
                </button>
            `;

            container.appendChild(item);
        });

    } catch (error) {
        container.textContent = error.message;
    }
}

// Delete a saved weather record
async function deleteWeather(id) {
    try {
        const response = await fetch(`${API_URL}/weather/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete record.');
        }

        loadWeatherRecords();

    } catch (error) {
        alert(error.message);
    }
}

// Connect button to function
document.getElementById('fetchWeatherBtn')
    .addEventListener('click', fetchWeather);

// Load saved records when webpage opens
loadWeatherRecords();
