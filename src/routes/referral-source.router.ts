import { Router } from 'express'
import { createReferralSource, getReferralSources, getReferralSourceById , updateReferralSource, deleteReferralSourceById } from '../controllers/referral-source.controller'
import { validateReferralSource, validateReferralSourceIdParam } from '../validators/referral-source.validator'
import { AdminAuthGuard } from '../middlewares/admin.guard'

const router = Router()

router.post('/', AdminAuthGuard, validateReferralSource, createReferralSource)
router.get('/', AdminAuthGuard, getReferralSources)
router.get('/:id', AdminAuthGuard, validateReferralSourceIdParam, getReferralSourceById)
router.put('/:id', AdminAuthGuard, validateReferralSource, validateReferralSourceIdParam, updateReferralSource)
router.delete('/:id', AdminAuthGuard, validateReferralSourceIdParam, deleteReferralSourceById)

export { router }
