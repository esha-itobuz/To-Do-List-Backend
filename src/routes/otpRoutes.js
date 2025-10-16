import express from 'express'
import { handleSendOtp, handleVerifyOtp } from '../controllers/otpController.js'

const otpRoutes = express.Router()
otpRoutes.post('/send', handleSendOtp)
otpRoutes.post('/verify', handleVerifyOtp)

export default otpRoutes
