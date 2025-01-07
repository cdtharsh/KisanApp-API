import { Router } from 'express';
import * as authController from '../controller/authController.js';
import * as authEmailMiddleware from '../middleware/emailMiddleware.js';
import * as rateLimit from '../security/rateLimit.js';
import * as authMiddleware from '../middleware/authMiddleware.js';
import * as passController from '../controller/passwordReset.js';
import { weather } from '../services/weatherService.js';
import { createPoster, getAllPosters, getPosterById, updatePoster, deletePoster } from '../controller/posterController.js';

const router = Router();

//GET route for reading data

//email verification
router.get('/verify-email', rateLimit.verifyEmailLimiter, authEmailMiddleware.verifyEmail);
router.get('/check-email-verification', rateLimit.checkEmailVerificationLimiter, authEmailMiddleware.checkEmailVerification);
//weather
router.get('/weather', rateLimit.weatherLimiter, authMiddleware.verifyToken, weather);
//posters
router.get('/posters', getAllPosters);
router.get('/posters/:id', getPosterById);



//POST route for creating data

//user
router.post('/register', rateLimit.registrationLimiter, authController.register);
router.post('/login', rateLimit.loginLimiter, authController.login);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
//email verification
router.post('/resend-verification-email', rateLimit.resendEmailVerificationLimiter, authEmailMiddleware.resendEmailVerification);
//password reset
router.post('/forget-password-email', rateLimit.forgotPasswordLimiter, passController.forgotPassword);
router.post('/reset-with-email', rateLimit.resetPasswordWithOtpLimiter, passController.resetPasswordWithOtp);
//posters
router.post('/posters/create', createPoster);



//DELETE route for deleting data

//posters
router.delete('/posters/:id', deletePoster);



//PUT route for updating data

//posters
router.put('/posters/:id', updatePoster);

export default router;
