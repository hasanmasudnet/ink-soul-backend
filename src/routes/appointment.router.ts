import { Router } from 'express'
import { 
    createAppointment, 
    getAppointments, 
    getAppointment, 
    updateAppointment, 
    deleteAppointment, 
    getCustomers, 
    getArtists,
    getDesigners,
    getReferrals
} from '../controllers/appointment.controller'
import { validateAppointment, validateAppointmentIdParam } from '../validators/appointment.validator'
import { AdminAuthGuard } from '../middlewares/admin.guard'

const router = Router()

router.get('/customers', AdminAuthGuard, getCustomers)
router.get('/artists', AdminAuthGuard, getArtists)
router.get('/designers', AdminAuthGuard, getDesigners)
router.get('/referrals', AdminAuthGuard, getReferrals)

router.post('/', validateAppointment, createAppointment)
router.get('/', AdminAuthGuard, getAppointments)
router.get('/:id', AdminAuthGuard, validateAppointmentIdParam, getAppointment)
router.put('/:id', AdminAuthGuard, validateAppointment, validateAppointmentIdParam, updateAppointment)
router.delete('/:id', AdminAuthGuard, validateAppointmentIdParam, deleteAppointment)

export { router }
