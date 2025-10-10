import express from 'express'
import * as todoController from '../controllers/todoController.js'
// import validate from '../middleware/validate.js'

const router = express.Router()

router.get('/', todoController.getAllTodos)
router.get('/:id', todoController.getTodoById)
router.post('/', todoController.createTodo)
router.put('/:id', todoController.updateTodo)
router.patch('/:id', todoController.patchTodo)
router.delete('/:id', todoController.deleteTodo)

export default router
