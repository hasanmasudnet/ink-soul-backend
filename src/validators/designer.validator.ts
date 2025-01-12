import Joi from "joi"
import { Request, Response, NextFunction } from "express"

// Validation schema for creating or updating a designer
const designerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name field cannot be empty',
    'any.required': 'Name field is required'
  }),
  email: Joi.string().email().allow('', null).optional().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email'
  }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'Phone must be a string',
      'string.pattern.base': 'Phone must be a valid phone number (7 to 15 digits)',
    }),
  specialties: Joi.string().optional().messages({
    'array.base': 'Specialties must be an array of strings',
  }),
  image: Joi.any().optional(),
  status: Joi.string()
    .valid('active', 'on_leave', 'inactive')
    .default('active')
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be either "active", "on_leave", or "inactive"'
    }),
  joinDate: Joi.date().iso().optional().messages({
    'date.base': 'Join Date must be a valid ISO date'
  }),
  totalDesigns: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total Designs must be a number',
    'number.min': 'Total Designs cannot be less than 0'
  })
})

// Validation schema for designer ID parameter (using cuid)
const idParamSchema = Joi.object({
  id: Joi.string().length(25).required().messages({
    'string.base': 'Id must be a string',
    'string.length': 'Please provide a valid id',
    'any.required': 'Id is required'
  })
})

// Middleware for validating request body
async function validateDesigner(req: Request, res: Response, next: NextFunction) {
  try {
    const { error } = designerSchema.validate(req.body)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Middleware for validating designer ID parameter
async function validateDesignerIdParam(req: Request, res: Response, next: NextFunction) {
  try {
    const { error } = idParamSchema.validate(req.params)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

export { validateDesigner, validateDesignerIdParam }