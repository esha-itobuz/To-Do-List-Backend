import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'

export default class AuthController {
  registerUser = async (req, res, next) => {
    try {
      const { email, password } = req.body
      const hashedPass = await bcrypt.hash(password, 10)
      const user = new User({ email, password: hashedPass, isVerified: false })
      await user.save()
      const safeUser = {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      }
      return res.status(201).json({
        success: true,
        user: safeUser,
        message: 'Registered. Please verify your email.',
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
    return jwt.sign(payload, secretKey, { expiresIn: '1m' })
  }

  _generateRefreshToken(payload) {
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY
    const ttl = process.env.REFRESH_TOKEN_TTL
    return jwt.sign(payload, refreshSecretKey, { expiresIn: ttl })
  }
}
