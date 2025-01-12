import { Router } from 'express';
import { validateCreatePayment } from '../validators/payment.validator';
import { createPayment, getPaymentById, getPayments } from '../controllers/payment.controller';
import { AdminAuthGuard } from '../middlewares/admin.guard';

const router = Router();

router.post('/', AdminAuthGuard, validateCreatePayment, createPayment)
router.get('/', AdminAuthGuard, getPayments)
router.get('/:id', AdminAuthGuard, getPaymentById)

export { router }
