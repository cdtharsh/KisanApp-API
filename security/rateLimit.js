import rateLimit from 'express-rate-limit';

// Create a rate limiter for the registration endpoint
export const registrationLimiter = rateLimit({
    windowMs: 24* 60 * 60 * 1000, // 24 HRS
    max: 5, // Limit each IP to 5 registration requests per windowMs
    message: 'Too many registration attempts, please try again after 24 hours',
});
