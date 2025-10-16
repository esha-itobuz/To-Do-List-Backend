import express from 'express'
import AuthController from '../controllers/authController.js'

const authRoutes = express.Router()
const authentication = new AuthController()

authRoutes.post('/register', authentication.registerUser)
authRoutes.post('/login', authentication.loginUser)
authRoutes.post('/refresh', authentication.refreshAccessToken)
// OTP routes are now handled by otpRoutes.js

export default authRoutes
