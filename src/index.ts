import express from 'express'
import cors from "cors"
import { router as admin_routers } from "./routes/admin.router"
import { router as customer_routers } from './routes/customer.router'
import { router as artist_routers } from './routes/artist.router'
import { router as designer_routers } from "./routes/designer.router"
import { router as referral_sources_routers } from "./routes/referral-source.router"
import { router as appointment_routers } from "./routes/appointment.router"
import { router as payment_routers } from "./routes/payment.router"
import { router as widget_routers } from "./routes/widget.router"
import fileUpload from "express-fileupload"

const app = express()

app.use(express.json())
app.use(express.static("uploads"))

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}))

app.use(cors({
  origin: "*"
}))

const PORT = process.env.PORT

declare global {
  namespace Express {
    interface Request {
      auth_id?: string
      auth_role: string
    }
  }
}

app.use("/admins", admin_routers)
app.use("/customers", customer_routers)
app.use("/artists", artist_routers)
app.use("/designers", designer_routers)
app.use("/referral-sources", referral_sources_routers)
app.use("/appointments", appointment_routers)
app.use("/payments", payment_routers)
app.use("/widgets", widget_routers)

app.get('/',(req, res)=>{
  res.json({"message":"Server is running 😊"})
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
