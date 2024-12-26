import { Router } from 'express';
import * as authController from '../controller/authController.js';
import * as authEmailMiddleware from '../middleware/emailMiddleware.js';
import * as rateLimit from '../security/rateLimit.js';
import * as authMiddleware from '../middleware/authMiddleware.js';
import * as passController from '../controller/passwordReset.js';
import { weather } from '../services/weatherService.js';

const router = Router();

router.post('/register', rateLimit.registrationLimiter, authController.register);
router.get('/verify-email', rateLimit.verifyEmailLimiter, authEmailMiddleware.verifyEmail);
router.get('/check-email-verification', rateLimit.checkEmailVerificationLimiter, authEmailMiddleware.checkEmailVerification);
router.post('/resend-verification-email', rateLimit.resendEmailVerificationLimiter, authEmailMiddleware.resendEmailVerification);
router.post('/forget-password-email', rateLimit.forgotPasswordLimiter, passController.forgotPassword);
router.post('/reset-with-email', rateLimit.resetPasswordWithOtpLimiter, passController.resetPasswordWithOtp);
router.post('/login', rateLimit.loginLimiter, authController.login);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.get('/weather', rateLimit.weatherLimiter, weather);

export default router;
