import express from 'express'
import * as todoController from '../controllers/todoController.js'
import toDoValidations from '../middleware/validationMiddleware.js'
import verifyToken from '../middleware/authMiddlleware.js'

const validationInstance = new toDoValidations()

const router = express.Router()

router.get('/', verifyToken, todoController.getAllTodos)
router.post(
  '/',
  verifyToken,
  validationInstance.validateRequest,
  todoController.createTodo
)
router.put(
  '/:id',
  verifyToken,
  validationInstance.updateRequest,
  todoController.updateTodo
)
router.patch('/:id', verifyToken, todoController.patchTodo)
router.delete('/:id', verifyToken, todoController.deleteTodo)
router.get('/search', verifyToken, todoController.searchTask)
router.get('/sort', verifyToken, todoController.sortTask)

export default router
