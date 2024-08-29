import { Router } from 'express';
import * as authController from '../controller/authController.js';
import * as authEmailMiddleware from '../middleware/emailMiddleware.js';
import * as rateLimit from '../security/rateLimit.js';
import * as authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', rateLimit.registrationLimiter, authController.register);
router.get('/verify-email', authEmailMiddleware.verifyEmail);
router.get('/check-email-verification', authEmailMiddleware.checkEmailVerification);

router.post('/login', rateLimit.loginLimiter, authController.login);
router.post('/logout',authMiddleware.verifyToken, authController.logout);

export default router;
