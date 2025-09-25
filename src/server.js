const express = require('express')
const app = express()
const port = 3000

// const db = require('../database/db.json')

// let users = db;

// app.use(express.json())

// app.post('/api/data', (req, res) => {
//     const newData = req.body

// })

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
