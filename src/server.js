import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import todoRoutes from './routes/todoRoutes.js'

dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
)

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' })
})

app.use('/todos', todoRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
  next()
})

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
  console.log(`API endpoints available at http://localhost:${PORT}/todos`)
})

export default app
