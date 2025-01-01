import { fetchData } from "../database/weatherData.js";

export async function weather(req, res) {
    const { lat, lon, date } = req.query;

    if (!lat || !lon) {
        return res.status(400).send('Missing query parameters: lat and lon are required');
    }

    try {
        const data = await fetchData(lat, lon);
        res.json(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}