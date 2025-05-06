// email.js
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from './emailTemplates.js';
import { transporter, sender } from "./nodemailer.config.js";

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        });
        console.log("Verification email sent successfully", response);
    } catch (error) {
        console.error("Error sending verification email", error);
        throw new Error("Error sending verification email");
    }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to Our Service",
            html: `<p>Hi ${name},</p><p>Welcome to Auth Company! We’re glad to have you on board.</p>`,
        });
        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.error("Error sending welcome email", error);
        throw new Error("Error sending welcome email");
    }
};

// Send Reset Password Email
export const sendResetPasswordEmail = async (email, resetURL) => {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        });
        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error("Error sending password reset email", error);
        throw new Error("Couldn't send password reset email");
    }
};

// Send Password Reset Success Email
export const sendResetSuccessEmail = async (email) => {
    try {
        const response = await transporter.sendMail({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });
        console.log("Password reset success email sent successfully", response);
    } catch (error) {
        console.error("Error sending reset success email", error);
        throw new Error("Couldn't send reset success email");
    }
};
