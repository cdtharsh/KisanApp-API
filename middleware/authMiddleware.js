import jwt from 'jsonwebtoken';
import TokenModel from '../models/tokenModel.js'; // Import TokenModel
import dotenv from 'dotenv';

dotenv.config();

const { JWT_SECRET } = process.env;

export function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

    if (!token) return res.status(401).send({ error: "No token provided." });

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).send({ error: "Invalid or expired token." });

        // Check if token exists in the database
        const tokenRecord = await TokenModel.findOne({ token });
        if (!tokenRecord) return res.status(401).send({ error: "Invalid token." });

        req.user = decoded;
        next();
    });
}
