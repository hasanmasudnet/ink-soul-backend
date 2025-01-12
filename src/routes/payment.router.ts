import { Router } from 'express';
import { validateCreatePayment } from '../validators/payment.validator';
import { createPayment, getPaymentById, getPayments } from '../controllers/payment.controller';

const router = Router();

router.post('/', validateCreatePayment, createPayment)
router.get('/', getPayments)
router.get('/:id', getPaymentById)

export { router }
