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

export const verifyEmailLimiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // max 20 requests per windowMs
    message: 'Too many verification attempts, please try again after 15 minutes',
});

export const checkEmailVerificationLimiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many verification attempts, please try again after 15 minutes',
});

export const resendEmailVerificationLimiter = RateLimit(
    {
        windowMs: 15 * 60 * 1000,
        max: 3,
        message: 'Too many requests, please try again after 15 minutes',
    }
);

export const forgotPasswordLimiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Too many requests, please try again after 15 minutes',
});

export const resetPasswordWithOtpLimiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Too many requests, please try again after 15 minutes',
});

export const emailVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many requests, please try again after 15 minutes',
});
