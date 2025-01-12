import Joi, { optional } from "joi"
import { Request, Response, NextFunction } from "express"

// Validation schema for creating an Admin
const adminCreateSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name field is required'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email field is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password field is required'
  }),
  role: Joi.string().valid('SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER').default('ADMINISTRATOR').messages({
    'string.base': 'Role must be a string',
    'any.only': 'Role must be one of SUPER_ADMIN, ADMINISTRATOR, or MANAGER',
    'any.required': 'Role is required'
  }),
  phone: Joi.string().optional().messages({
    'string.base': 'Phone must be a string',
  }),
  address: Joi.string().optional().messages({
    'string.base': 'Address must be a string',
  }),
  avatar: Joi.any().optional()
})

async function validateAdminCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = adminCreateSchema.validate(req.body)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Validation schema for Admin login
const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email field is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password field is required'
  })
})

async function validateAdminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = adminLoginSchema.validate(req.body)
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

// Validation schema for updating an Admin
const adminUpdateSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name field is required'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email field is required'
  }),
  phone: Joi.string().optional().messages({
    'string.base': 'Phone must be a string',
  }),
  address: Joi.string().optional().messages({
    'string.base': 'Address must be a string',
  }),
  avatar: Joi.any().optional()
})

async function validateAdminUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = adminUpdateSchema.validate(req.body)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Validation schema for updating an Admin
const adminPasswordSchema = Joi.object({
  old_password: Joi.string().min(6).required().messages({
    'string.base': 'Old password must be a string',
    'string.empty': 'Old password cannot be empty',
    'string.min': 'Old password must be at least 6 characters long',
    'any.required': 'Old password field is required'
  }),
  new_password: Joi.string().min(6).required().messages({
    'string.base': 'New password must be a string',
    'string.empty': 'New password cannot be empty',
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password field is required'
  })
})

async function validatePasswordUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = adminPasswordSchema.validate(req.body)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// super admin update schema
const SuperadminUpdateSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name field is required'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email field is required'
  }),
  password: Joi.string().allow("").optional(),
  role: Joi.string().valid('SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER').default('ADMINISTRATOR').messages({
    'string.base': 'Role must be a string',
    'any.only': 'Role must be one of SUPER_ADMIN, ADMINISTRATOR, or MANAGER',
    'any.required': 'Role is required'
  }),
  phone: Joi.string().optional().messages({
    'string.base': 'Phone must be a string',
  }),
  address: Joi.string().optional().messages({
    'string.base': 'Address must be a string',
  }),
  avatar: Joi.any().optional()
})

async function validateSuperAdminUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = SuperadminUpdateSchema.validate(req.body)
    if (error) {
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

export { 
  validateAdminCreate, 
  validateAdminLogin, 
  validateAdminUpdate, 
  validatePasswordUpdate, 
  validateSuperAdminUpdate 
}