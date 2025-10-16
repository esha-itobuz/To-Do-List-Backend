import crypto from 'crypto'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASS,
  },
})

export const generateOtp = () => crypto.randomInt(100000, 999999).toString()

export const hashOtp = async (otp) => await bcrypt.hash(otp, 10)

export const compareOtp = (otp, hash) =>
  bcrypt.compareSync(otp.toString(), hash)

export const sendOtpNotification = async (userMail, otp, purpose = 'reset') => {
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
