import express from "express"
import { 
  getArtists, 
  getArtistById, 
  createArtist, 
  updateArtist, 
  deleteArtist 
} from "../controllers/artist.controller"
import { validateArtist, validateArtistIdParam } from "../validators/artist.validator"
import { AdminAuthGuard } from "../middlewares/admin.guard"

const router = express.Router()

router.get("/", AdminAuthGuard, getArtists)
router.get("/:id", AdminAuthGuard, validateArtistIdParam, getArtistById)
router.post("/", AdminAuthGuard, validateArtist, createArtist)
router.put("/:id", AdminAuthGuard, validateArtistIdParam, validateArtist, updateArtist)
router.delete("/:id", AdminAuthGuard, validateArtistIdParam, deleteArtist)

export { router }
