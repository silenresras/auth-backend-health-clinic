import express from 'express'
import { signUp, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

router.get('/check-auth', checkAuth)

//signup
router.post('/signup', signUp)

//verifyEmail
router.post('/verify-email', verifyEmail)

//login
router.post('/login', login)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

//logout
router.post('/logout', logout)

export default router