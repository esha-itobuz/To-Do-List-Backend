import * as yup from 'yup'

export const taskCreateSchema = yup.object({
  title: yup.string().required('Title is required'),
  tags: yup.array().of(yup.string()).default([]),
  isCompleted: yup.boolean().default(false),
})

export const taskUpdateSchema = yup.object({
  title: yup.string(),
  tags: yup.array().of(yup.string()),
  isCompleted: yup.boolean(),
})
