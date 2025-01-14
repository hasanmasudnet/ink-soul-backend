import express from "express"
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  getCustomerById
} from "../controllers/customer.controller"
import { validateCustomer, validateCustomerIdParam } from "../validators/customer.validator"
import { AdminAuthGuard } from "../middlewares/admin.guard"

const router = express.Router()

router.get("/", AdminAuthGuard, getCustomers)
router.get("/:id", AdminAuthGuard, validateCustomerIdParam, getCustomerById)
router.post("/", validateCustomer, createCustomer)
router.put("/:id", AdminAuthGuard, validateCustomerIdParam, validateCustomer, updateCustomer)
router.delete("/:id", AdminAuthGuard, validateCustomerIdParam, deleteCustomer)

export { router }