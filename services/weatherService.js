import { fetchData } from "../database/weatherData.js";

export async function weather(req, res) {
    const { lat, lon, date } = req.query;

    if (!lat || !lon || !date) {
        return res.status(400).send('Missing query parameters: lat, lon, and date are required');
    }

    try {
        const data = await fetchData(lat, lon, date);
        res.json(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}