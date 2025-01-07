import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import connect from './database/mongoDB.js';
import router from './routes/route.js';
import { cleanUpExpiredTokens } from './services/deleteToken.js';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// Middleware for parsing JSON requests
app.use(express.json());

setInterval(cleanUpExpiredTokens, 3600000)
// Middleware for logging HTTP requests
app.use(morgan('combined'));

// Middleware for security headers
app.use(helmet());

// Middleware to disable 'x-powered-by' header for security
app.disable('x-powered-by');

// Middleware for enabling CORS
// app.use(cors({
//     origin: `https://api.${process.env.ROOT}`, // Update with your client's domain
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true // Allow credentials (e.g., cookies, authorization headers)
// }));

app.use('/image/posters', express.static(path.join(__dirname, 'public', 'posters')));

const port = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
    res.status(200).json("Home GET Request");
});

// Use the router for other routes
app.use('/', router);

// Connect to the database and start the server
connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Worker ${process.pid} is running on port ${port}`);
        });

    } catch (error) {
        console.error('Cannot connect to the server');
    }
}).catch(error => console.error("Invalid database connection!"));
