import { error } from 'console';
import UserModel from '../models/userModel.js';
import path from 'path';
import { sendVerificationEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import TokenModel from '../models/tokenModel.js';

dotenv.config();

const __dirname = path.resolve();
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

export async function checkEmailVerification(req, res) {
    const { username } = req.query; // Extract username from the query

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    try {
        // Find user by username in the database
        const user = await UserModel.findOne({ username });

        // If no user is found
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check verification status and return the response
        if (user.emailVerified) {
            return res.status(200).json({
                msg: 'Email is verified.',
                isEmailVerified: true
            });
        } else {
            return res.status(200).json({
                msg: 'Email is not verified.',
                isEmailVerified: false
            });
        }
    } catch (error) {
        console.error('Error checking email verification:', error);
        return res.status(500).json({ error: 'Server error.' });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).sendFile(path.join(__dirname, 'files', 'error.html'));
        }

        // Find the email verification token in the TokenModel and ensure it's valid and not expired
        const emailToken = await TokenModel.findOne({
            tokenType: "emailVerification",
            token: { $eq: token },
            expiresAt: { $gt: Date.now() }, // Ensure the token is not expired
        });

        if (!emailToken) {
            return res.status(400).sendFile(path.join(__dirname, 'files', 'error.html'));
        }

        // Find the corresponding user using the userId from the token
        const user = await UserModel.findById(emailToken.userId);
        if (!user) {
            return res.status(400).sendFile(path.join(__dirname, 'files', 'error.html'));
        }

        // Mark the user's email as verified
        user.emailVerified = true;
        await user.save();

        // Remove the used email verification token
        await TokenModel.deleteOne({ _id: emailToken._id });

        // Send the success HTML file as the response
        res.status(200).sendFile(path.join(__dirname, 'files', 'verification.html'));
    } catch (error) {
        console.error("Email Verification Error:", error);
        res.status(500).sendFile(path.join(__dirname, 'files', 'error.html'));
    }
}

export async function resendEmailVerification(req, res) {
    const { username } = req.query;

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Invalid username.' });
    }

    try {
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ msg: 'Email is already verified.' });
        }

        // Generate a new email verification token
        const verificationToken = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create the token in TokenModel (not in UserModel)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await TokenModel.create({
            userId: user._id,
            token: verificationToken,
            tokenType: 'emailVerification',
            expiresAt,
        });

        const verificationLink = `http://api.${process.env.ROOT}/verify-email?token=${verificationToken}`;

        // Send the verification email
        await sendVerificationEmail(user.email, verificationLink, user.firstName);

        return res.status(200).json({ msg: 'Verification email sent successfully.' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        return res.status(500).json({ error: 'An error occurred while resending the verification email.' });
    }
}
