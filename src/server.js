import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import todoRoutes from './routes/todoRoutes.js'

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI

const app = express()

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
)
app.use(express.json())

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' })
})
app.use('/todos', todoRoutes)

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
