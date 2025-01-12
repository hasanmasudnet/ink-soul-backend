import Joi from "joi"
import { Request, Response, NextFunction } from "express"

// Validation schema for creating or updating an artist
const artistSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name field cannot be empty',
    'any.required': 'Name field is required'
  }),
  email: Joi.string().email().allow('', null).optional().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email'
  }),
  phone: Joi.string().allow('', null).optional().messages({
    'string.base': 'Phone must be a string'
  }),
  specialties: Joi.string().required().messages({
    'string.base': 'Specialties must be a string',
    'any.required': 'Specialties are required'
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
  })
})

// Validation schema for artist ID parameter (using cuid)
const idParamSchema = Joi.object({
  id: Joi.string().length(25).required().messages({
    'string.base': 'Id must be a string',
    'string.length': 'Please provide a valid id',
    'any.required': 'Id is required'
  })
})

// Middleware for validating request body
async function validateArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = artistSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Middleware for validating artist ID parameter
async function validateArtistIdParam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { validateArtist, validateArtistIdParam }
