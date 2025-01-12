import { Router } from "express";
import { validateAdminCreate, validateAdminLogin, validateAdminUpdate, validatePasswordUpdate, validateSuperAdminUpdate } from "../validators/admin.validator";
import { AdminAuth, AdminLogin, CreateAdmin, DeleteAdmin, GetAdmins, UpdateAdmin, UpdateAdminPassword, UpdateProfile } from "../controllers/admin.controller";
import { AdminAuthGuard, SuperAdminAuthGuard } from "../middlewares/admin.guard";

const router = Router()

router.post('/', SuperAdminAuthGuard, validateAdminCreate, CreateAdmin)
router.put('/update/:id', SuperAdminAuthGuard, validateSuperAdminUpdate, UpdateAdmin)
router.post('/login',validateAdminLogin, AdminLogin)
router.put('/:id', AdminAuthGuard, validateAdminUpdate, UpdateProfile)
router.put('/password/:id', AdminAuthGuard, validatePasswordUpdate, UpdateAdminPassword)
router.get('/all',SuperAdminAuthGuard, GetAdmins)
router.get('/',AdminAuthGuard, AdminAuth)
router.delete('/:id',AdminAuthGuard, DeleteAdmin)

export { router }