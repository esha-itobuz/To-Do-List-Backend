import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default function verifyToken(req, res, next) {
  const secretKey = process.env.JWT_SECRET_KEY
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token found, access denied' })
  }

  try {
      const decoded = jwt.verify(token, secretKey)
      req.user = { id: decoded.userId }
    next()
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' })
  }
}
