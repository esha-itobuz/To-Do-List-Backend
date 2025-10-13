import express from 'express'
const protectedRoute = express.Router()
import verifyToken from '../middleware/authMiddlleware.js'
// Protected route
protectedRoute.get('/', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed' })
})

export default protectedRoute
