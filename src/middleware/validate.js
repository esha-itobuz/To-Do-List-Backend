import todoSchema from '../schemas/todoSchema.js'

const validate = async (req, res, next) => {
  try {
    await todoSchema.validate(req.body, { abortEarly: false })
    next()
  } catch (error) {
    return res.status(400).json({ errors: error.errors })
  }
}

export default validate
