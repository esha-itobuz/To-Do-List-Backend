import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'database', 'db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { todos: [] };
  }
};

const writeDB = (content) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(content, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

const getAllTodos = () => {
  const db = readDB();
  return db.todos;
};

const getTodoById = (id) => {
  const db = readDB();
  return db.todos.find(t => t.id === parseInt(id));
};

const createTodo = (todoData) => {
  const db = readDB();
  const newTodo = {
    id: db.todos.length > 0 ? db.todos[db.todos.length - 1].id + 1 : 1,
    title: todoData.title,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    tags: todoData.tags || [],
  };
  db.todos.push(newTodo);
  writeDB(db);
  return newTodo;
};

const updateTodo = (id, updates) => {
  const db = readDB();
  const todoIndex = db.todos.findIndex(t => t.id === parseInt(id));

  if (todoIndex === -1) {
    return null;
  }

  const todo = db.todos[todoIndex];

  if (updates.title !== undefined) todo.title = updates.title;
  if (updates.isCompleted !== undefined) todo.isCompleted = updates.isCompleted;
  if (updates.tags !== undefined) todo.tags = updates.tags;

  db.todos[todoIndex] = todo;
  writeDB(db);
  return todo;
};

const deleteTodo = (id) => {
  const db = readDB();
  const todoIndex = db.todos.findIndex(t => t.id === parseInt(id));

  if (todoIndex === -1) {
    return null;
  }

  const deleted = db.todos.splice(todoIndex, 1);
  writeDB(db);
  return deleted[0];
};

export {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};
