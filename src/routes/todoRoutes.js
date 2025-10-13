import express from 'express'
import * as todoController from '../controllers/todoController.js'
import toDoValidations from '../middleware/validationMiddleware.js'

const validationInstance = new toDoValidations()

const router = express.Router()

router.get('/', todoController.getAllTodos)
// router.get(
//   '/:id',
//   validationInstance.validateRequest,
//   todoController.getTodoById
// )
router.post('/', validationInstance.validateRequest, todoController.createTodo)
router.put('/:id', validationInstance.updateRequest, todoController.updateTodo)
router.patch('/:id', todoController.patchTodo)
router.delete('/:id', todoController.deleteTodo)
router.get('/search', todoController.searchTask)
router.get('/sort', todoController.sortTask)

export default router
