const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let windowPrevState = [];
let windowCurrState = [];

// Helper function to fetch numbers from a third-party API
const fetchNumberFromAPI = async (id) => {
    try {
        const response = await axios.get(`http://localhost:9876/numbers/e${id}`, { timeout: 500 });
        return response.data.number; // Assuming API returns a JSON object with a 'number' field
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
};

// Helper function to calculate average
const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

// REST API endpoint
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    // Fetch number based on ID
    const newNumber = await fetchNumberFromAPI(numberid);

    if (newNumber !== null) {
        // Ensure number is unique
        if (!windowCurrState.includes(newNumber)) {
            windowPrevState = [...windowCurrState]; // Store previous state

            // Maintain window size
            if (windowCurrState.length >= WINDOW_SIZE) {
                windowCurrState.shift(); // Remove the oldest number
            }
            windowCurrState.push(newNumber); // Add new number
        }

        const average = calculateAverage(windowCurrState);

        // Respond with the required data
        return res.json({
            windowPrevState,
            windowCurrState,
            numbers: windowCurrState,
            avg: average.toFixed(2),
        });
    } else {
        return res.status(500).json({ error: 'Failed to fetch number from third-party API' });
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:9876/numbers/e${PORT}`);
});
