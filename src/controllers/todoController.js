import Todo from '../models/todoModel.js'
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
    // normalize single document
    res.json(normalize(todo))
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

const sortTask = async (req, res, next) => {
  try {
    console.log('inside backend sorting')
    const sort = req.query.sort || req.query.sortFilter || 'default'
    console.log('sort:', sort)

    let sortOption = {}
    if (sort === 'alphabetical') {
      sortOption = { title: 1 }
    } else if (sort === 'completed') {
      sortOption = { isCompleted: -1, createdAt: -1 }
    } else if (sort === 'uncompleted') {
      sortOption = { isCompleted: 1, createdAt: -1 }
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 }
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 }
    } else {
      sortOption = {}
    }

    const query = Todo.find()
    if (Object.keys(sortOption).length) query.sort(sortOption)

    const tasks = await query.exec()
    return res.json(tasks.map(normalize))
  } catch (e) {
    next(e)
  }
}

const searchTask = async (req, res, next) => {
  try {
    let { searchText, searchFilter } = req.query
    searchText = (searchText || '').trim()

    console.log('searchFilter:', searchFilter, 'searchText:', searchText)

    if (!searchText) {
      const all = await Todo.find()
      return res.json(all.map(normalize))
    }

    const regex = { $regex: searchText, $options: 'i' }
    const orClauses = [{ title: regex }, { tags: { $elemMatch: regex } }]

    const query = { $or: orClauses }

    if (searchFilter === 'completed') query.isCompleted = true
    if (searchFilter === 'uncompleted') query.isCompleted = false

    const filteredTasks = await Todo.find(query)

    return res.json(filteredTasks.map(normalize))
  } catch (e) {
    next(e)
  }
}

export {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo,
  sortTask,
  searchTask,
}
