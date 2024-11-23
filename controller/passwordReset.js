import crypto from 'crypto';
import bcrypt from 'bcrypt';
import TokenModel from '../models/tokenModel.js';
import UserModel from '../models/userModel.js';
import { sendOtpEmail } from '../services/emailService.js'; // Assuming you have a service for sending OTPs

export async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ error: "Email is required." });
    }

    try {
        // Check if the user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: "No user found with this email." });
        }

        // Delete any existing password reset tokens for this user
        await TokenModel.deleteMany({ userId: user._id, tokenType: 'passwordReset' });

        // Generate and hash a new OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Store the new OTP in the database
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        await TokenModel.create({
            userId: user._id,
            token: hashedOtp,
            tokenType: 'passwordReset',
            expiresAt,
        });

        // Send the OTP to the user's email
        await sendOtpEmail(user.email, otp);

        res.status(200).send({ msg: "Password reset OTP has been sent to your email." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).send({ error: "An error occurred. Please try again later." });
    }
}


export async function resetPasswordWithOtp(req, res) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).send({ error: "Email, OTP, and new password are required." });
    }

    try {
        // Find the OTP record in the TokenModel
        const tokenEntry = await TokenModel.findOne({
            tokenType: 'passwordReset',
            expiresAt: { $gt: Date.now() }, // Ensure the OTP hasn't expired
        }).populate('userId');

        if (!tokenEntry || !(await bcrypt.compare(otp, tokenEntry.token)) || tokenEntry.userId.email !== email) {
            return res.status(400).send({ error: "Invalid or expired OTP." });
        }

        // Find the user associated with the OTP
        const user = tokenEntry.userId;

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Delete all password reset tokens for this user
        await TokenModel.deleteMany({ userId: user._id, tokenType: 'passwordReset' });

        res.status(200).send({ msg: "Password has been reset successfully." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).send({ error: "An error occurred. Please try again later." });
    }
}
