import UserModel from '../models/userModel.js';
import path from 'path';

const __dirname = path.resolve();

export async function checkEmailVerification(req, res) {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.emailVerified) {
            return res.status(200).json({ message: 'Email is verified.' });
        } else {
            return res.status(200).json({ message: 'Email is not verified.' });
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

        const user = await UserModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).sendFile(path.join(__dirname, 'files', 'error.html'));
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        // Send the success HTML file as the response
        res.status(200).sendFile(path.join(__dirname, 'files', 'verification.html'));

    } catch (error) {
        console.error("Email Verification Error:", error);
        res.status(500).sendFile(path.join(__dirname, 'files', 'error.html'));
    }
}