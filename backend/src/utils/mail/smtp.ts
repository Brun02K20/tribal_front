import {createTransport} from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.STARTLS_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  secure: false, // true for 465, false for other ports
});

const mailOptions = {
    from: "Tribal Trend <commerce@mail.tribaltrend.com.ar>",
    to: "bvirinni@gmail.com",
    subject: "Test Email from Node.js",
    text: "This is a test email sent from Node.js using Nodemailer.",
}

const sendTestEmail = async () => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}



export {sendTestEmail, transporter};