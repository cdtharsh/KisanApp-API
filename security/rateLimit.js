import rateLimit from 'express-rate-limit';

export const registrationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    message: 'Too many registration attempts, please try again after 24 hours',
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes',
});

export const emailVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many requests, please try again after 15 minutes',
});
