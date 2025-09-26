const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, '..', 'database', 'db.json')
const port = 3000

function readDB() {
  const data = fs.readFileSync(dbPath)
  return JSON.parse(data)
}

function writeDB(content) {
  fs.writeFileSync(dbPath, JSON.stringify(content, null, 2))
}

app.post('/', (req, res) => {
  const { title, tags } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }
  const db = readDB()
  const newToDo = {
    id: db.todos.length + 1,
    title,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    tags: tags || [],
  }
  db.todos.push(newToDo)
  writeDB(db)

  res.status(201).json(newToDo)
})

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
