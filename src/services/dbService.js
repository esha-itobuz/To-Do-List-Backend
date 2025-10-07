import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '..', '..', 'database', 'db.json')

const readDB = async () => {
  try {
    const data = await readFile(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Database file not found. Returning empty array.')
      return { todos: [] }
    }
    console.error('Error reading database:', error)
    throw error
  }
}

const writeDB = async (content) => {
  try {
    const dataToWrite = JSON.stringify(content, null, 2)
    await writeFile(dbPath, dataToWrite, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing to database:', error)
    return false
  }
}

const getAllTodos = async () => {
  const db = await readDB()
  return db.todos
}

const getTodoById = async (id) => {
  const db = await readDB()
  return db.todos.find((t) => t.id === parseInt(id))
}

const createTodo = async (todoData) => {
  if (!todoData || !todoData.title) {
    return null
  }

  const db = await readDB()
  const newTodo = {
    id: db.todos.length > 0 ? db.todos[db.todos.length - 1].id + 1 : 1,
    title: todoData.title,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    tags: todoData.tags || [],
  }
  db.todos.push(newTodo)
  await writeDB(db)
  return newTodo
}

const updateTodo = async (id, updates) => {
  const db = await readDB()
  const todoIndex = db.todos.findIndex((t) => t.id === parseInt(id))
  if (todoIndex === -1) {
    return null
  }

  const todo = db.todos[todoIndex]

  if (updates.title !== undefined) {
    todo.title = updates.title
  }
  if (updates.isCompleted !== undefined) {
    todo.isCompleted = updates.isCompleted
  }
  if (updates.tags !== undefined) {
    todo.tags = updates.tags
  }

  db.todos[todoIndex] = todo
  await writeDB(db)
  return todo
}

const deleteTodo = async (id) => {
  const db = await readDB()
  const todoIndex = db.todos.findIndex((t) => t.id === parseInt(id))
  if (todoIndex === -1) {
    return null
  }

  const deleted = db.todos.splice(todoIndex, 1)
  await writeDB(db)
  return deleted[0]
}

export { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo }
