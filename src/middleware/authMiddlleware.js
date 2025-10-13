import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export default function verifyToken(req, res, next) {
  const secretKey = process.env.JWT_SECRET_KEY
  const authHeader = req.header('Authorization')
  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401)
    res.json({ success: false, message: 'No token found, access denied' })
  }

  try {
    const decoded = jwt.verify(token, secretKey)
    req.userId = decoded.userId
    next()
  } catch (error) {
    next(error)
  }
}
