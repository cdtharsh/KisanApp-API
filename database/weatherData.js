import NodeCache from "node-cache";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const myCache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

export async function fetchData(lat, lon) {
    const cacheKey = `${lat}_${lon}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        console.log('Returning cached data');
        return cachedData;
    }

    try {
        const apiKey = process.env.WEATHER_API_KEY; // Access API key from .env
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&aqi=no&alerts=no`;

        const response = await axios.get(url);

        myCache.set(cacheKey, response.data);
        console.log('Data fetched and cached');
        return response.data;
    } catch (error) {
        console.error('Error fetching data', error);
        throw new Error("Failed to fetch data");
    }
}
