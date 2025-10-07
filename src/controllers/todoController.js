import * as dbService from '../services/dbService.js'

const getAllTodos = async (req, res) => {
  try {
    const todos = await dbService.getAllTodos()
    res.json(todos)
  } catch (error) {
    console.error('Error getting todos:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getTodoById = async (req, res) => {
  try {
    const todo = await dbService.getTodoById(req.params.id)
    if (!todo) return res.status(404).json({ error: 'Todo not found' })
    res.json(todo)
  } catch (error) {
    console.error('Error getting todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const createTodo = async (req, res) => {
  try {
    const { title, tags } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })

    const newTodo = await dbService.createTodo({ title, tags })
    res.status(201).json(newTodo)
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateTodo = async (req, res) => {
  try {
    const updates = req.body
    const updatedTodo = await dbService.updateTodo(req.params.id, updates)
    if (!updatedTodo) return res.status(404).json({ error: 'Todo not found' })
    res.json(updatedTodo)
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const patchTodo = async (req, res) => {
  try {
    const updates = req.body
    const updatedTodo = await dbService.updateTodo(req.params.id, updates)
    if (!updatedTodo) return res.status(404).json({ error: 'Todo not found' })
    res.json(updatedTodo)
  } catch (error) {
    console.error('Error patching todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteTodo = async (req, res) => {
  try {
    const deleted = await dbService.deleteTodo(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Todo not found' })
    res.json({ success: true, deleted })
  } catch (error) {
    console.error('Error deleting todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo,
}
