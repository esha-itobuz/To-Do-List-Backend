import * as dbService from '../services/dbService.js';

const getAllTodos = async (req, res) => {
  try {
    const todos = dbService.getAllTodos();
    res.json(todos);
  } catch (error) {
    console.error('Error getting todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTodoById = async (req, res) => {
  try {
    const todo = dbService.getTodoById(req.params.id);

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error getting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = dbService.createTodo({ title, tags });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { title, isCompleted, tags } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (tags !== undefined) updates.tags = tags;

    const updatedTodo = dbService.updateTodo(req.params.id, updates);

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const patchTodo = async (req, res) => {
  try {
    const { title, isCompleted, tags } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (tags !== undefined) updates.tags = tags;

    const updatedTodo = dbService.updateTodo(req.params.id, updates);

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error patching todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const deleted = dbService.deleteTodo(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo
};
