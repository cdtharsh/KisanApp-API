import { Router } from 'express';
import * as authController from '../controller/authController.js';
import * as authEmailMiddleware from '../middleware/emailMiddleware.js';
import * as rateLimit from '../security/rateLimit.js';
import RateLimit from 'express-rate-limit';
import * as authMiddleware from '../middleware/authMiddleware.js';
import * as passController from '../controller/passwordReset.js';

const router = Router();

router.post('/register', rateLimit.registrationLimiter, authController.register);
const verifyEmailLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});
router.get('/verify-email', verifyEmailLimiter, authEmailMiddleware.verifyEmail);
router.get('/check-email-verification', authEmailMiddleware.checkEmailVerification);
router.post('/resend-verification-email', authEmailMiddleware.resendEmailVerification);
router.post('/forget-password-email', passController.forgotPassword);
router.post('/reset-with-email', passController.resetPasswordWithOtp);

router.post('/login', rateLimit.loginLimiter, authController.login);
router.post('/logout',authMiddleware.verifyToken, authController.logout);

export default router;
