import Joi from "joi"
import { Request, Response, NextFunction } from "express"

// Validation schema for creating or updating a referral source with custom error messages
const referralSourceSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name field is required'
  }),
  description: Joi.string().optional().messages({
    'string.base': 'Description must be a string',
  })
})

// Validation schema for referral source ID parameter (using cuid) with a custom error message
const idParamSchema = Joi.object({
  id: Joi.string().length(25).required().messages({
    'string.base': 'ID must be a string',
    'string.length': 'Please provide a valid ID',
    'any.required': 'ID is required'
  })
})

// Middleware for validating request body
async function validateReferralSource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = referralSourceSchema.validate(req.body)
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

// Middleware for validating referral source ID parameter
async function validateReferralSourceIdParam(req: Request, res: Response, next: NextFunction): Promise<void> {
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

export { validateReferralSource, validateReferralSourceIdParam }
