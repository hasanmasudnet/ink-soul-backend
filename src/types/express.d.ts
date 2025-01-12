import { Request } from "express"

declare global {
  namespace Express {
    interface Request {
      auth_id?: string
    }
  }
}
