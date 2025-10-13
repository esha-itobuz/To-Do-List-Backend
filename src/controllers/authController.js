import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import User from '../models/userModel.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASS,
  },
})

const sendOtpNotification = async (userMail, user) => {
  const mailOptions = {
    from: process.env.MAIL_ID,
    to: userMail,
    subject: 'OTP to Reset password',
    text: `Your OTP for password reset is: ${user.resetOtp}. 
        Do not share your OTP with anyone else. Validity 5 Mins`,
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
      const user = new User({ email, password: hashedPass })
      await user.save()
      res.status(201).json({ success: true, user })
    } catch (error) {
      next(error)
    }
  }

  loginUser = async (req, res, next) => {
    try {
      const secretKey = process.env.JWT_SECRET_KEY
      const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY
      const { email, password } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        res.status(404)
        throw new Error('User not found!')
      }

      const passwordMatched = await bcrypt.compare(password, user.password)

      if (!passwordMatched) {
        res.status(401)
        throw new Error('Authentication failed, password not matched')
      }

      const accessToken = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: '1h',
      })

      const refreshToken = jwt.sign({ userId: user._id }, refreshSecretKey, {
        expiresIn: '69d',
      })

      await user.save()

      res.status(200).json({ accessToken, refreshToken, user })
    } catch (error) {
      next(error)
    }
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
      const otp = crypto.randomInt(100000, 999999)
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(200).json({
          message: 'If a user with that email exists, an OTP has been sent.',
        })
      }

      user.resetOtp = otp
      user.otpExpiry = Date.now() + 5 * 60 * 1000 // 5 min expiry
      await user.save()

      await sendOtpNotification(email, user)

      return res.status(200).json({
        message: 'OTP sent to your mail',
        email: email,
      })
    } catch (error) {
      console.error('Error in handleSendOtp:', error)
      res.status(500).json({ message: 'Error sending OTP.' })
    }
  }

  handleVerifyOtpAndResetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmNewPassword } = req.body

    // const hashedNewPass = await bcrypt.hash(newPassword, 10)

    try {
      const user = await User.findOne({ email })

      if (!user) {
        res.json({ message: 'OTP sent', email })
      }

      if (Date.now() > user.otpExpiry) {
        res.json({ message: 'OTP sent', email })
      }

      if (user.resetOtp !== otp) {
        return res.json({
          email: email,
          otpIncorrectMsg: 'Incorrect OTP',
        })
      }

      if (newPassword !== confirmNewPassword) {
        return res.json({
          email: email,
          passwordNotMatchMsg: 'Passwords do not match',
        })
      }

      user.password = newPassword
      user.resetOtp = undefined
      user.otpExpiry = undefined

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
