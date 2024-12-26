import NodeCache from "node-cache";
import axios from "axios";

const myCache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

export async function fetchData(lat, lon, date) {
    const cacheKey = `${lat}_${lon}_${date}`;

    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
        console.log('Returning cached data');
        return cachedData;
    }

    try {
        const url = `https://mausamgram.imd.gov.in/test4_mme.php?lat_gfs=${lat}&lon_gfs=${lon}&date=${date}_3hr_0p125`;
        const response = await axios.get(url);

        myCache.set(cacheKey, response.data);
        console.log('Data fetched and cached');
        return response.data;
    } catch (error) {
        console.error('Error fetching data', error);
        throw new Error("Failed t fetch data");
    }
}