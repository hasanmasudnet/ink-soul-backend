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

const router = express.Router()

router.post("/", validateDesigner, createDesigner)
router.get("/", getDesigners)
router.get("/:id", validateDesignerIdParam, getDesignerById)
router.put("/:id", validateDesignerIdParam, validateDesigner, updateDesigner)
router.delete("/:id", validateDesignerIdParam, deleteDesigner)

export { router }