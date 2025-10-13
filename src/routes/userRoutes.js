import express from 'express'
import AuthenticationController from '../controllers/authController.js'

const authRoutes = express.Router()
const authentication = new AuthenticationController()

authRoutes.use((req, res, next) => {
  console.log(`Route middleware: ${req.method} ${req.url}`)
  next()
})

authRoutes.post('/register', authentication.registerUser)
authRoutes.post('/login', authentication.loginUser)
authRoutes.post('/logout', authentication.logoutUser)
authRoutes.post('/send-otp', authentication.handleSendOtp)
authRoutes.post('/verify-otp', authentication.handleVerifyOtpAndResetPassword)

export default authRoutes
