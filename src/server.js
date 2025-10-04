const express = require('express')
const fs = require('fs')
const path = require('path')

const cors = require('cors');

const app = express()

app.use(cors({
  origin: "*",      
  methods: ["GET","POST","PUT","PATCH","DELETE"],
  allowedHeaders: ["Content-Type"]
}));
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

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' })
})

app.post('/todos', (req, res) => {
  const { title, tags } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const db = readDB()
  const newToDo = {
    id: db.todos.length > 0 ? db.todos[db.todos.length - 1].id + 1 : 1,
    title,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    tags: tags || [],
  }
  db.todos.push(newToDo)
  writeDB(db)

  res.status(201).json(newToDo)
})

app.get('/todos', (req, res) => {
  const db = readDB()
  res.json(db.todos)
})

app.get('/todos/:id', (req, res) => {
  const db = readDB()
  const todo = db.todos.find(t => t.id === parseInt(req.params.id))

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  res.json(todo)
})

app.put('/todos/:id', (req, res) => {
  const { title, isCompleted, tags } = req.body
  const db = readDB()
  const todoIndex = db.todos.findIndex(t => t.id === parseInt(req.params.id))

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  db.todos[todoIndex] = {
    ...db.todos[todoIndex],
    title: title || db.todos[todoIndex].title,
    isCompleted: isCompleted !== undefined ? isCompleted : db.todos[todoIndex].isCompleted,
    tags: tags || db.todos[todoIndex].tags,
  }

  writeDB(db)
  res.json(db.todos[todoIndex])
})

app.patch('/todos/:id', (req, res) => {
  const { title, isCompleted, tags } = req.body
  const db = readDB()
  const todo = db.todos.find(t => t.id === parseInt(req.params.id))

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  if (title !== undefined) todo.title = title
  if (isCompleted !== undefined) todo.isCompleted = isCompleted
  if (tags !== undefined) todo.tags = tags

  writeDB(db)
  res.json(todo)
})

app.delete('/todos/:id', (req, res) => {
  const db = readDB()
  const todoIndex = db.todos.findIndex(t => t.id === parseInt(req.params.id))

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  const deleted = db.todos.splice(todoIndex, 1)
  writeDB(db)

  res.json({ success: true, deleted: deleted[0] })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
