import express from "express"
import {
  createDesigner,
  getDesigners,
  getDesignerById,
  updateDesigner,
  deleteDesigner
} from "../controllers/designer.controller"
import {
  validateDesigner,
  validateDesignerIdParam
} from "../validators/designer.validator"
import { AdminAuthGuard } from "../middlewares/admin.guard"

const router = express.Router()

router.post("/", AdminAuthGuard, validateDesigner, createDesigner)
router.get("/", AdminAuthGuard, getDesigners)
router.get("/:id", AdminAuthGuard, validateDesignerIdParam, getDesignerById)
router.put("/:id", AdminAuthGuard, validateDesignerIdParam, validateDesigner, updateDesigner)
router.delete("/:id", AdminAuthGuard, validateDesignerIdParam, deleteDesigner)

export { router }