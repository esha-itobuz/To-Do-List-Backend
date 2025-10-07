import * as yup from 'yup'

const todoSchema = yup.object({
  title: yup.string().required('Title is required'),
  completed: yup.boolean().default(false),
})

export default todoSchema
