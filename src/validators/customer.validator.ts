import Joi from "joi"
import { Request, Response, NextFunction } from "express"

// Validation schema for creating or updating a customer with custom error messages
const customerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name field must be a string',
    'string.empty': 'Name field cannot be empty',
    'any.required': 'Name field is required'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email',
    'any.required': 'Email field is required'
  }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      'string.base': 'Phone must be a string',
      'string.pattern.base': 'Phone must be a valid phone number (7 to 15 digits)',
      'any.required': 'Phone is required'
  }),
  image: Joi.any().optional(),
  status: Joi.string()
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be either "Active" or "Inactive"'
  })
})
  
  // Validation schema for customer ID parameter (using cuid) with a custom error message
const idParamSchema = Joi.object({
  id: Joi.string().length(25).required().messages({
    'string.base': 'Id must be a string',
    'string.length': 'Please provide a valid id',
    'any.required': 'Id is required'
  })
})

// Middleware for validating request body
async function validateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = customerSchema.validate(req.body)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Middleware for validating customer ID parameter
async function validateCustomerIdParam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = idParamSchema.validate(req.params)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

export { validateCustomer, validateCustomerIdParam }
