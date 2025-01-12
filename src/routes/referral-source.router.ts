import { Router } from 'express'
import { createReferralSource, getReferralSources, getReferralSourceById , updateReferralSource, deleteReferralSourceById } from '../controllers/referral-source.controller'
import { validateReferralSource, validateReferralSourceIdParam } from '../validators/referral-source.validator'

const router = Router()

router.post('/', validateReferralSource, createReferralSource)
router.get('/', getReferralSources)
router.get('/:id', validateReferralSourceIdParam, getReferralSourceById)
router.put('/:id', validateReferralSource, validateReferralSourceIdParam, updateReferralSource)
router.delete('/:id', validateReferralSourceIdParam, deleteReferralSourceById)

export { router }
