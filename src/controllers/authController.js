import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import User from '../models/userModel.js'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASS,
  },
})

const sendOtpNotification = async (userMail, otp, purpose = 'reset') => {
  const subject =
    purpose === 'verify' ? 'Verify your email' : 'OTP to Reset password'
  const text =
    purpose === 'verify'
      ? `Your OTP for email verification is: ${otp}. Do not share your OTP with anyone else. Validity 5 Minutes.`
      : `Your OTP for password reset is: ${otp}. Do not share your OTP with anyone else. Validity 5 Minutes.`

  const mailOptions = {
    from: process.env.MAIL_ID,
    to: userMail,
    subject,
    text,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log('OTP email sent to:', userMail)
  } catch (error) {
    console.error('Error sending OTP email:', error)
  }
}

export default class AuthenticationController {
  registerUser = async (req, res, next) => {
    try {
      const { email, password } = req.body
      const hashedPass = await bcrypt.hash(password, 10)
      const user = new User({ email, password: hashedPass, isVerified: false })

      const otp = crypto.randomInt(100000, 999999).toString()
      const otpHash = await bcrypt.hash(otp, 10)
      const expiry = Date.now() + 5 * 60 * 1000

      user.emailVerificationOtps.push({ otpHash, expiry })

      await user.save()

      try {
        await sendOtpNotification(email, otp, 'verify')
      } catch (err) {
        console.error('Failed sending verification email:', err)
      }

      const safeUser = {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      }
      return res.status(201).json({
        success: true,
        user: safeUser,
        message: 'Registered. Please verify your email with the OTP sent.',
      })
    } catch (error) {
      next(error)
    }
  }

  loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        res.status(404)
        throw new Error('User not found!')
      }

      if (!user.isVerified) {
        return res.status(403).json({
          message:
            'Email not verified. Please verify your email before logging in.',
        })
      }

      const passwordMatched = await bcrypt.compare(password, user.password)

      if (!passwordMatched) {
        res.status(401)
        throw new Error('Authentication failed, password not matched')
      }

      const accessToken = this._generateAccessToken({ userId: user._id })
      const refreshToken = this._generateRefreshToken({ userId: user._id })
      return res.status(200).json({ accessToken, refreshToken, user })
    } catch (error) {
      next(error)
    }
  }

  refreshAccessToken = async (req, res) => {
    const authHeader = req.headers['authorization']
    const refreshToken = authHeader && authHeader.split(' ')[1]
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY

    if (!refreshToken)
      return res.status(401).json({ message: 'No refresh token provided' })

    try {
      const payload = jwt.verify(refreshToken, refreshSecretKey)

      const user = await User.findById(payload.userId)
      if (!user) return res.status(404).json({ message: 'User not found' })

      const newAccessToken = this._generateAccessToken({
        userId: payload.userId,
      })
      return res.status(200).json({ accessToken: newAccessToken })
    } catch (err) {
      console.error('Error refreshing token:', err)
      return res
        .status(403)
        .json({ message: 'Invalid or expired refresh token' })
    }
  }

  _generateAccessToken(payload) {
    const secretKey = process.env.JWT_SECRET_KEY
    const ttl = process.env.ACCESS_TOKEN_TTL
    return jwt.sign(payload, secretKey, { expiresIn: '1m' })
  }

  _generateRefreshToken(payload) {
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY
    const ttl = process.env.REFRESH_TOKEN_TTL
    return jwt.sign(payload, refreshSecretKey, { expiresIn: ttl })
  }

  logoutUser = async (req, res, next) => {
    try {
      const { userId } = req.body

      const user = await User.findById(userId)

      if (!user) {
        res.status(404)
        throw new Error('User not found')
      }

      await user.save()

      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
      next(error)
    }
  }

  handleSendOtp = async (req, res) => {
    const { email } = req.body

    try {
      const otp = crypto.randomInt(100000, 999999).toString()
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(200).json({
          message: 'If a user with that email exists, an OTP has been sent.',
        })
      }

      const otpHash = await bcrypt.hash(otp, 10)
      const expiry = Date.now() + 5 * 60 * 1000

      user.resetOtps.push({ otpHash, expiry })
      await user.save()

      await sendOtpNotification(email, otp, 'reset')

      return res.status(200).json({
        message: 'OTP sent to your mail',
        email: email,
      })
    } catch (error) {
      console.error('Error in handleSendOtp:', error)
      res.status(500).json({ message: 'Error sending OTP.' })
    }
  }

  handleVerifyEmail = async (req, res) => {
    const { email, otp } = req.body
    try {
      const user = await User.findOne({ email })
      if (!user)
        return res.status(400).json({ message: 'Invalid email or OTP' })
      const now = Date.now()
      const matchingIndex = user.emailVerificationOtps.findIndex((entry) => {
        if (entry.used) return false
        if (now > new Date(entry.expiry).getTime()) return false
        return bcrypt.compareSync(otp.toString(), entry.otpHash)
      })

      if (matchingIndex === -1) {
        return res.status(400).json({ message: 'Invalid or expired OTP' })
      }

      user.emailVerificationOtps[matchingIndex].used = true
      user.isVerified = true
      await user.save()

      return res.status(200).json({ message: 'Email verified successfully' })
    } catch (error) {
      console.error('Error verifying email OTP:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  handleResendVerificationOtp = async (req, res) => {
    const { email } = req.body
    try {
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(200).json({
          message:
            'If an account with that email exists, a verification OTP has been sent.',
        })
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified.' })
      }

      const otp = crypto.randomInt(100000, 999999).toString()
      const otpHash = await bcrypt.hash(otp, 10)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      user.emailVerificationOtps.push({
        otpHash,
        expiry: Date.now() + sevenDays,
      })
      await user.save()

      try {
        await sendOtpNotification(email, otp, 'verify')
      } catch (err) {
        console.error('Failed sending verification email (resend):', err)
      }

      return res.status(200).json({
        message:
          'If an account with that email exists, a verification OTP has been sent.',
      })
    } catch (error) {
      console.error('Error in handleResendVerificationOtp:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  handleVerifyOtpAndResetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmNewPassword } = req.body

    try {
      const user = await User.findOne({ email })

      if (!user) {
        return res.json({ message: 'OTP sent', email })
      }

      const now = Date.now()
      const matchingIndex = user.resetOtps.findIndex((entry) => {
        if (entry.used) return false
        if (now > new Date(entry.expiry).getTime()) return false
        return bcrypt.compareSync(otp.toString(), entry.otpHash)
      })

      if (matchingIndex === -1) {
        return res.json({
          email: email,
          otpIncorrectMsg: 'Incorrect or expired OTP',
        })
      }

      if (!newPassword && !confirmNewPassword) {
        return res.json({ email })
      }

      if (newPassword !== confirmNewPassword) {
        return res.json({
          email: email,
          passwordNotMatchMsg: 'Passwords do not match',
        })
      }

      const hashedNewPass = await bcrypt.hash(newPassword, 10)
      user.password = hashedNewPass
      user.resetOtps[matchingIndex].used = true

      await user.save()
      res.json({
        passwordResetSuccessMsg:
          'Password reset successfully. You can login now.',
      })
    } catch (error) {
      console.log(error)
      res.json({
        passwordResetErrorMsg: 'Error resetting password.',
      })
    }
  }
}
