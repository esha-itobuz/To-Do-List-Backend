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
authRoutes.post('/refresh', authentication.refreshAccessToken)
authRoutes.post('/send-otp', authentication.handleSendOtp)
authRoutes.post(
  '/reset-password',
  authentication.handleVerifyOtpAndResetPassword
)
authRoutes.post('/verify-email', authentication.handleVerifyEmail) //for isVerified field
authRoutes.post(
  '/resend-verification',
  authentication.handleResendVerificationOtp
) 

export default authRoutes
