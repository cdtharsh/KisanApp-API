import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Use the current working directory to resolve file paths
const emailVerificationTemplate = fs.readFileSync(path.join(process.cwd(), 'files', 'emailVerification.html'), 'utf-8');
const otpEmailTemplate = fs.readFileSync(path.join(process.cwd(), 'files', 'otpEmail.html'), 'utf-8');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // e.g., smtp.gmail.com
    port: 465, // or 465 for secure
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // your email address
        pass: process.env.PASSWORD, // your email password or application-specific password
    },
});

// Send Email Verification
export async function sendVerificationEmail(email, verificationLink, firstName) {
    const mailOptions = {
        from: 'admin@kisanwale.in',
        to: email,
        subject: 'Email Verification',
        html: emailVerificationTemplate.replace('${firstName}', firstName).replace('${verificationLink}', verificationLink),
    };

    return transporter.sendMail(mailOptions);
}

// Send OTP Email
export async function sendOtpEmail(email, otp, firstName) {
    const mailOptions = {
        from: 'admin@kisanwale.in',
        to: email,
        subject: 'Password Reset OTP',
        html: otpEmailTemplate.replace('${firstName}', firstName).replace('${otp}', otp),
    };

    return transporter.sendMail(mailOptions);
}
