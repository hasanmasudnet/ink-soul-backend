import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'

// Validation schema for creating or updating an appointment with custom error messages
const appointmentSchema = Joi.object({
  customerId: Joi.string().length(25).required().messages({
    'string.base': 'Customer ID must be a string',
    'string.length': 'Customer ID must be 25 characters long',
    'any.required': 'Customer ID is required'
  }),
  customerType: Joi.string().required().messages({
    'string.base': 'Select a customer type'
  }),
  tattooArtistId: Joi.string().length(25).optional().messages({
    'string.base': 'Tattoo Artist ID must be a string',
    'string.length': 'Tattoo Artist ID must be 25 characters long',
    'any.required': 'Tattoo Artist ID is required'
  }),
  tattooDesignerId: Joi.string().length(25).optional().messages({
    'string.base': 'Tattoo Designer ID must be a string',
    'string.length': 'Tattoo Designer ID must be 25 characters long',
    'any.required': 'Tattoo Designer ID is required'
  }),
  referralSourceId: Joi.string().optional().messages({
    'string.base': 'Referral Source ID must be a string'
  }),
  date: Joi.string().optional().messages({
    'string.base': 'Date must be a string',
    'any.required': 'Date field is required'
  }),
  time: Joi.string().allow('').optional().messages({
    'string.base': 'Time must be a string',
    'any.required': 'Time field is required'
  }),
  totalPrice: Joi.number().min(0).allow('').optional().messages({
    'number.base': 'Total Price must be a number',
    'number.min': 'Total Price must be greater than or equal to 0',
    'any.required': 'Total Price field is required'
  }),
  payments: Joi.string().optional().messages({
    'array.base': 'Payments must be an array of strings',
  }),
  status: Joi.string().default('pending').optional().messages({
    'string.base': 'Status must be a string',
    'any.only': 'Status must be one of "pending", "confirmed", "completed", "cancelled"'
  }),
  photoId: Joi.any().optional().messages({
    'any.required': 'Photo ID is required if uploading'
  }),
  tattooDesign: Joi.any().optional().messages({
    'any.required': 'Tattoo Design is required if uploading'
  }),
  creditCardAuth: Joi.any().optional().messages({
    'any.required': 'Credit Card Authorization is required if uploading'
  }),
  tattooConsent: Joi.any().optional().messages({
    'any.required': 'Tattoo Consent is required if uploading'
  })
})

// Middleware for validating appointment creation and updates
async function validateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = appointmentSchema.validate(req.body)
    if (error) {
      console.log(error)
      res.status(400).json({ message: error.details[0].message })
    } else {
      next()
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Middleware for validating appointment ID parameter
async function validateAppointmentIdParam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = Joi.string().length(25).validate(req.params.id)
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

export { validateAppointment, validateAppointmentIdParam }