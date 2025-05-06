import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetSuccessEmail } from '../mailtrap/email.js'


export const signUp = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        if (!firstName || !lastName || !email || !password) {
            throw new Error("All fields are required")
        }

        // Email validation (basic regex for format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        const userAlreadyExists = await User.findOne({ email })

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'User already exists' })
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 //24hrs
        })

        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' })
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({
            success: true, message: 'Email verified successfully', user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("error in verifying email", error)
        res.status(500).json({ success: false, message: "server error" })
    }

}
export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email: email })

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' })
        }

        const isPasswordMatch = await bcryptjs.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect password' })
        }

        //jwt
        const token = generateTokenAndSetCookie(res, user._id)

        //update login date
        user.lastLogin = new Date()

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user: {
                ...user._doc,
                password: undefined,
            },
            token: token,
        })


    } catch (error) {
        console.log("Error logging in the user", error)
        res.status(500).json({ success: false, message: "server error" })
    }
}



export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "logged out successfully" });
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' })
        }

        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 //1 hour

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        //send email
        await sendResetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({ success: true, message: 'Reset password link sent to your email' })

    } catch (error) {
        console.log("Error fetching user for forgot password", error)
        res.status(500).json({ success: false, message: "server error" })
    }

}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } })

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset password token or expired' })
        }

        //update password
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()

        await sendResetSuccessEmail(user.email)

        res.status(200).json({ success: true, message: 'Password reset successfully' })
    } catch (error) {
        console.log("Error resetting password", error)
        res.status(500).json({ success: false, message: "server error" })
    }
}

export const checkAuth = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ isAuthenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = { userId: decoded.userId }; // Retrieve user details if necessary
        res.json({ isAuthenticated: true, user });
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ isAuthenticated: false });
    }
};
  