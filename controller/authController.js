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
        const { username, password, email, mobile, firstName, lastName, address, ...rest } = req.body;

        // Check for existing username, email, or mobile number
        const [usernameCheck, emailCheck, mobileCheck] = await Promise.all([
            UserModel.findOne({ username: { $eq: username } }),
            UserModel.findOne({ email: { $eq: email } }),
            UserModel.findOne({ mobile: { $eq: mobile } })
        ]);

        if (usernameCheck) return res.status(400).send({ error: "Username already taken." });
        if (emailCheck) return res.status(400).send({ error: "Email already taken." });
        if (mobileCheck) return res.status(400).send({ error: "Mobile number already taken." });

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user object
        const user = new UserModel({
            username,
            password: hashedPassword,
            email,
            mobile,
            firstName,
            lastName,
            address,
            ...rest
        });

        // Save the user to the database
        await user.save();

        // Generate email verification token
        const verificationToken = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

        // Store the verification token
        await TokenModel.create({
            userId: user._id,
            token: verificationToken,
            tokenType: 'emailVerification',
            expiresAt
        });

        const verificationLink = `http://api.${process.env.ROOT}/verify-email?token=${verificationToken}`;
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

        const user = await UserModel.findOne({ username : {$eq: username }});
        if (!user) return res.status(400).send({ error: "Invalid username or password." });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send({ error: "Invalid username or password." });

        if (!user.emailVerified) {
            const emailVerificationToken = jwt.sign(
                { id: user._id, email: user.email },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            await TokenModel.updateOne(
                { userId: user._id, tokenType: 'emailVerification' },
                { token: emailVerificationToken, expiresAt },
                { upsert: true }
            );

            const verificationLink = `http://api.${process.env.ROOT}/verify-email?token=${emailVerificationToken}`;
            await sendVerificationEmail(user.email, verificationLink, user.firstName);

            return res.status(401).send({
                isEmailVerified: false,
                error: "Email is not verified. A new verification email has been sent."
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);

        await TokenModel.updateOne(
            { userId: user._id, tokenType: 'login' },
            { token, expiresAt },
            { upsert: true }
        );

        // Update lastLogin timestamp
        user.lastLogin = new Date();
        await user.save();

        res.status(200).send({
            msg: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                lastLogin: user.lastLogin
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
