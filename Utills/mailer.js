import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateVerificationCode, hashString } from "./index.js";
import PasswordReset from "../Models/passwordResetModel.js";

dotenv.config();

const code = generateVerificationCode()

const { AUTH_EMAIL, APP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    port: 587,
    secure: false, // Use true for secure connections (TLS/SSL)
    auth: {
        user: "haryor785@gmail.com",
        pass: "kweropyvufqpyspr", // Use the generated App Password here
    },
});

export const sendMail = async (email, code) => {
    const mailOptions = {
        from: "haryor785@gmail.com",
        to: email,
        subject: "Verification Code",
        text: `Your verification code is: ${code}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const sendForgotPasswordMail = async (user, res)=>{
    const {email, _id}= user
    const token = _id + code
    const link = `http://localhost:5173/auth/reset-password/${_id}/${token}`
    const mailOptions = {
        from: "haryor785@gmail.com",
        to: email,
        subject: "Reset Password",
        text: `Click the link below to reset your password, it expires in 10minutes: ${link}`,
    };

    try {
        const hashToken = await hashString(token)
        const passwordReset = await PasswordReset.create({
            userId: _id,
            email: email,
            token: hashToken,
            createdAt: Date.now(),
            expiredAt: Date.now() + 600000,
        })
        if(passwordReset){
            transporter.sendMail(mailOptions)
            .then(()=>{
                res.status(200).json({
                    success: true,
                    message: "Password reset link sent to your email"
                })
            })
            .catch((error)=>{
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: error.message
                })
            })
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}
