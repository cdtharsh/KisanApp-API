import { Router } from 'express';
import * as authController from '../controller/authController.js';
import * as rateLimit from '../security/rateLimit.js';

const router = Router();

router.post('/register', rateLimit.registrationLimiter, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.get('/check-email-verification', authController.checkEmailVerification); // Add this line

export default router;
