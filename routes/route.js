import { Router } from 'express';
import * as authController from '../controller/authController.js';
import * as authEmailMiddleware from '../middleware/emailMiddleware.js';
import * as rateLimit from '../security/rateLimit.js';
import * as passport from '../config/passport-setup.js'

const router = Router();

router.post('/register', rateLimit.registrationLimiter, authController.register);
router.get('/verify-email', authEmailMiddleware.verifyEmail);
router.get('/check-email-verification', authEmailMiddleware.checkEmailVerification);

router.post('/login', rateLimit.loginLimiter, authController.login);

// Start OAuth flow
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// OAuth callback
router.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/profile'); // Redirect to a logged-in user's profile or home
});

export default router;
