import jwt from 'jsonwebtoken';
import UserModel from './models/UserModel'; // Replace with the actual path to your User model
import { JWT_SECRET } from './config'; // Import your secret key from config

// Middleware to check if the user is an admin
const isAdminMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]; // Assuming the token is passed in the Authorization header

        if (!token) {
            return res.status(401).send({ error: 'No token provided.' });
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if the token has expired or is invalid
        if (!decoded) {
            return res.status(403).send({ error: 'Invalid or expired token.' });
        }

        // Check if the user is an admin
        const user = await UserModel.findById(decoded.id); // Assuming 'id' is stored in the token

        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }

        // Check if the user has the admin role in the database
        if (user.isAdmin == false) {
            return res.status(403).send({ error: 'You are not authorized to access this resource.' });
        }

        // If the user is an admin, proceed with the next middleware or route handler
        req.user = user; // Optionally attach user data to the request object
        next();
    } catch (err) {
        console.error("Admin Middleware Error:", err);
        res.status(500).send({ error: 'An error occurred while verifying admin status.' });
    }
};

export default isAdminMiddleware;
