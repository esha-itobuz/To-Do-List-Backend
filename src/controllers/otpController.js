import User from '../models/userModel.js'
import {
  generateOtp,
  hashOtp,
  compareOtp,
  sendOtpNotification,
} from '../utils/otpUtils.js'

export const handleSendOtp = async (req, res) => {
  const { email, type } = req.body
  if (!email || !type || (type !== 'verify' && type !== 'reset')) {
    return res
      .status(400)
      .json({ message: 'Invalid request. Email and valid type are required.' })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this email does not exist.' })
    }
    if (type === 'verify' && user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.' })
    }
    const otp = generateOtp()
    const otpHash = await hashOtp(otp)
    const expiry =
      Date.now() + (type === 'verify' ? 7 * 24 * 60 * 60 * 1000 : 5 * 60 * 1000)
    if (type === 'verify') {
      user.emailVerificationOtps.push({ otpHash, expiry })
    } else {
      user.resetOtps.push({ otpHash, expiry })
    }
    await user.save()
    await sendOtpNotification(email, otp, type)
    return res.status(200).json({ message: 'OTP sent to your email address.' })
  } catch (error) {
    console.error('Error in handleSendOtp:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

export const handleVerifyOtp = async (req, res) => {
  const { email, otp, type, newPassword, confirmNewPassword } = req.body
  if (!email || !otp || !type || (type !== 'verify' && type !== 'reset')) {
    return res
      .status(400)
      .json({
        message: 'Invalid request. Email, OTP, and valid type are required.',
      })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this email does not exist.' })
    }
    const now = Date.now()
    let otps
    if (type === 'verify') {
      otps = user.emailVerificationOtps
    } else {
      otps = user.resetOtps
    }
    const matchingIndex = otps.findIndex((entry) => {
      if (entry.used) return false
      if (now > new Date(entry.expiry).getTime()) return false
      return compareOtp(otp, entry.otpHash)
    })
    if (matchingIndex === -1) {
      return res.status(400).json({ message: 'Incorrect or expired OTP.' })
    }
    otps[matchingIndex].used = true
    if (type === 'verify') {
      user.isVerified = true
      await user.save()
      return res.status(200).json({ message: 'Email verified successfully.' })
    } else {
      if (!newPassword || !confirmNewPassword) {
        return res
          .status(400)
          .json({ message: 'New password and confirmation are required.' })
      }
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' })
      }
      user.password = await hashOtp(newPassword)
      await user.save()
      return res
        .status(200)
        .json({ message: 'Password reset successfully. You can login now.' })
    }
  } catch (error) {
    console.error('Error in handleVerifyOtp:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}
