import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import todoRoutes from './routes/todoRoutes.js'
import authRoutes from './routes/userRoutes.js'
import protectedRoute from './routes/protectedRoutes.js'
import loggerMiddleware from './middleware/loggerMiddleware.js'

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' })
})
app.use(loggerMiddleware)
app.use('/todos', todoRoutes)
app.use('/auth', authRoutes)
app.use('/protected', protectedRoute)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`)
      console.log(`API endpoints available at http://localhost:${PORT}/todos`)
    })
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err)
    process.exit(1)
  })
