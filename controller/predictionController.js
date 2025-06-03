import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export const predictPlantDisease = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), file.originalname);

        const fastApiResponse = await axios.post(
            'http://localhost:8000/predict', // or use the actual IP/domain
            formData,
            { headers: formData.getHeaders() }
        );

        fs.unlinkSync(file.path); // Clean temp file

        res.status(200).json(fastApiResponse.data);
    } catch (err) {
        console.error('Prediction error:', err.message);
        res.status(500).json({ error: 'Prediction service failed' });
    }
};
