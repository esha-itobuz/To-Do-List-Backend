import Todo from '../models/todoModel.js'

function normalize(todo) {
  const obj = todo.toObject ? todo.toObject() : todo
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

const getAllTodos = async (req, res) => {
  try {
    const userId = req.user.id // Assuming userId is available from the JWT payload
    const todos = await Todo.find({ userId })
    res.json(todos.map(normalize))
  } catch (error) {
    console.error('Error getting todos:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getTodoById = async (req, res) => {
  try {
    const userId = req.user.id
    const todo = await Todo.findOne({ _id: req.params.id, userId })
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    res.json(normalize(todo))
  } catch (error) {
    console.error('Error getting todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const createTodo = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, tags } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const newTodo = await Todo.create({ title, tags, userId })
    res.status(201).json(normalize(newTodo))
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updates = req.body

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    )

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
    const userId = req.user.id

    const updates = req.body

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    )

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
    const userId = req.user.id

    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId })

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
    const userId = req.user.id
    const sort = req.query.sort || req.query.sortFilter || 'default'
    let sortOption = {}

    // Sorting logic remains the same
    if (sort === 'alphabetical') sortOption = { title: 1 }
    else if (sort === 'completed')
      sortOption = { isCompleted: -1, createdAt: -1 }
    else if (sort === 'uncompleted')
      sortOption = { isCompleted: 1, createdAt: -1 }
    else if (sort === 'newest') sortOption = { createdAt: -1 }
    else if (sort === 'oldest') sortOption = { createdAt: 1 }

    const query = Todo.find({ userId })
    if (Object.keys(sortOption).length) query.sort(sortOption)

    const tasks = await query.exec()
    return res.json(tasks.map(normalize))
  } catch (e) {
    next(e)
  }
}

const searchTask = async (req, res, next) => {
  try {
    const userId = req.user.id
    let { searchText, searchFilter } = req.query
    searchText = (searchText || '').trim()

    const regex = { $regex: searchText, $options: 'i' }
    const orClauses = [{ title: regex }, { tags: { $elemMatch: regex } }]

    const query = { $or: orClauses, userId }

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
