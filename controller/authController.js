import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import TokenModel from '../models/tokenModel.js'; // Import TokenModel
import { sendVerificationEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

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

export async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ error: "Username and password are required." });
        }

        // Check if user exists
        const user = await UserModel.findOne({ username });
        if (!user) return res.status(400).send({ error: "Invalid username or password." });

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send({ error: "Invalid username or password." });

        // Check email verification status
        if (!user.emailVerified) {
            // Generate a new verification token
            const verificationToken = jwt.sign(
                { id: user._id, email: user.email },
                JWT_SECRET,
                { expiresIn: '1h' } // Set a reasonable expiration time
            );

            // Update user record with the new verification token
            user.verificationToken = verificationToken;
            await user.save();

            // Construct the verification link
            const verificationLink = `http://api.${process.env.ROOT}/verify-email?token=${verificationToken}`;

            // Resend the verification email
            try {
                await sendVerificationEmail(user.email, verificationLink, user.firstName);

                // Save the token in the database
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in milliseconds
                await TokenModel.create({ userId: user._id, token: verificationToken, expiresAt });

                return res.status(400).send({
                    error: "Email not verified. A new verification email has been sent to your email address."
                });
            } catch (emailError) {
                console.error("Error sending verification email:", emailError);
                return res.status(500).send({ error: "An error occurred while resending the verification email." });
            }
        }

        // Generate JWT token for login
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Decode token to extract expiration time
        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000); // Convert seconds to milliseconds

        // Save the token in the database
        await TokenModel.create({ userId: user._id, token, expiresAt });

        // Send response
        res.status(200).send({
            msg: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send({ error: "An error occurred. Please try again later." });
    }
}



export async function logout(req, res) {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

    if (!token) return res.status(400).send({ error: "No token provided." });

    try {
        // Delete token from database
        await TokenModel.deleteOne({ token });

        res.status(200).send({ msg: "Logout successful." });
    } catch (error) {
        res.status(500).send({ error: "An error occurred during logout." });
        console.error("Logout Error:", error);
    }
}