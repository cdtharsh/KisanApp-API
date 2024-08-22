import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '../services/emailService.js';
import UserModel from '../model/userModel.js';
import path from 'path';

const __dirname = path.resolve();

export async function register(req, res) {
    try {
        const { username, password, email, mobile, ...rest } = req.body;

        const [usernameCheck, emailCheck, mobileCheck] = await Promise.all([
            UserModel.findOne({ username }),
            UserModel.findOne({ email }),
            UserModel.findOne({ mobile })
        ]);

        if (usernameCheck) return res.status(400).send({ error: "Username already taken." });
        if (emailCheck) return res.status(400).send({ error: "Email already taken." });
        if (mobileCheck) return res.status(400).send({ error: "Mobile number already taken." });

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new UserModel({
            username,
            password: hashedPassword,
            email,
            mobile,
            ...rest
        });

        await user.save();

        const verificationLink = `http://api.${process.env.ROOT}/verify-email?token=${user.verificationToken}`;
        await sendVerificationEmail(user.email, verificationLink, user.firstName);

        res.status(201).send({ msg: "User registered successfully. Please verify your email." });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const formattedErrors = Object.values(error.errors)
                .map(err => err.message.replace('Path ', '').replace(/`/g, ''));
            return res.status(400).send({ error: formattedErrors.join(', ') });
        }
        res.status(500).send({ error: "An error occurred. Please try again later." });
        console.error("Registration Error:", error);
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