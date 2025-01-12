import { Router } from "express";
import { Dashboard, PaymentReports, Reports } from "../controllers/widget.controller";
import { AdminAuthGuard } from "../middlewares/admin.guard";

const router = Router()

router.get('/dashboard',AdminAuthGuard,Dashboard)
router.get('/reports',AdminAuthGuard,Reports)
router.get('/payments',AdminAuthGuard,PaymentReports)

export { router }