import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateCreatePayment = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    appointmentId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().required(),
    notes: Joi.string().allow('', null).optional()
  });

  const { error } = schema.validate(req.body)

  if (error) {
    res.status(400).json({ message: error.details[0].message })
  }else{
    next()
  }
}