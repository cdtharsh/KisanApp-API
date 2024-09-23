import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // service: 'gmail',
    // auth: {
    //     user: process.env.EMAIL, // Your Gmail address
    //     pass: process.env.PASSWORD, // Your Gmail app password or account password
    // }

    host: 'smtp.gmail.com', // e.g., smtp.gmail.com
    port: 465, // or 465 for secure
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // your email address
        pass: process.env.PASSWORD, // your email password or application-specific password
    },
});

export async function sendVerificationEmail(email, verificationLink, firstName) {
    const mailOptions = {
        from: 'admin@kisanwale.in',
        to: email,
        subject: 'Email Verification',
        html: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Email Verification</title>

    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">

    <style>
        /* CSS Reset */
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background-color: #f1f1f1;
            font-family: 'Lato', sans-serif;
            color: rgba(0, 0, 0, 0.6);
        }
        table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
            margin: auto;
        }
        td {
            padding: 0;
        }
        img {
            max-width: 100%;
            height: auto;
            -ms-interpolation-mode: bicubic;
        }
        a {
            text-decoration: none;
            color: #30e3ca;
        }
        .btn {
            padding: 10px 20px;
            display: inline-block;
            border-radius: 5px;
            background: #30e3ca;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
        }
        .footer {
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.5);
            text-align: center;
            padding: 20px;
        }
        .footer a {
            color: rgba(0, 0, 0, 0.8);
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #30e3ca;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            border-radius: 8px 8px 0 0;
        }
        .hero {
            padding: 20px;
            text-align: center;
        }
        .hero img {
            width: 100px;
            margin: 20px 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h2 {
            font-size: 24px;
            margin: 20px 0;
            color: #333;
        }
        .content p {
            font-size: 16px;
            margin: 20px 0;
        }
        .content .btn {
            margin-top: 20px;
        }
        .footer-content {
            padding: 20px;
            text-align: center;
        }
        .footer-content ul {
            list-style-type: none;
            padding: 0;
        }
        .footer-content ul li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <center style="width: 100%; background-color: #f1f1f1;">
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1>KisanWale.in</h1>
            </div>

            <!-- Main Content -->
            <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>Thank you for registering with KisanWale.in! To complete your registration, please verify your email address by clicking the button below:</p>
                <a href="${verificationLink}" class="btn">Verify Account</a>
                <p>If you did not create this account, you can ignore this email.</p>
                <p>For any assistance, please contact our support team at <a href="mailto:support@kisanwale.in">support@kisanwale.in</a>.</p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-content">
                    <ul>
                        <li><strong>About Us:</strong> We are committed to providing the best services for farmers since 1998</li>
                        <li><strong>Contact Info:</strong> Loni Road, Talegaon Dighe, Sangamnear, Ahamednagar, Maharashtra, IN, 422611.</li>
                        <li><strong>Phone:</strong> +91 98812 26471</li>
                        <li><strong><a href="https://kisanwale.in">Visit our website</a></strong></li>
                    </ul>
                    <p>&copy; 2024 KisanWale. All rights reserved.</p>
                </div>
            </div>
        </div>
    </center>
</body>
</html>
`
    };

    return transporter.sendMail(mailOptions);
}
