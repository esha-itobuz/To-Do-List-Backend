import Todo from '../models/schema.js'
import mongoose from 'mongoose'

function normalize(todo) {
  const obj = todo.toObject ? todo.toObject() : todo
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find()
    res.json(todos.map(normalize))
  } catch (error) {
    console.error('Error getting todos:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    res.json(todo.map(normalize))
  } catch (error) {
    console.error('Error getting todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const createTodo = async (req, res) => {
  try {
    const { title, tags } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const newTodo = await Todo.create({ title, tags })
    res.status(201).json(normalize(newTodo))
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    console.log('Received updates:', updates)

    const updatedTodo = await Todo.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    res.json(normalize(updatedTodo))
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const patchTodo = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    const updates = req.body

    const updatedTodo = await Todo.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    res.json(normalize(updatedTodo))
  } catch (error) {
    console.error('Error patching todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params

    const deletedTodo = await Todo.findByIdAndDelete(id)

    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    res.json({ success: true, message: 'Todo deleted successfully' })
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
