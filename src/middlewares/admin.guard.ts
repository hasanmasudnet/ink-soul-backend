import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken"

async function SuperAdminAuthGuard(req: Request, res: Response, next: NextFunction){
  try{
    let token = req.headers.authorization?.split(" ")[1]
    
    let decode: any = await JWT.verify(`${token}`, `${process.env.JWT_ADMIN_SECRET}`)
    
    if(decode.data?.role==="SUPER_ADMIN"){
      req.auth_id = decode.data?.id
      req.auth_role = decode.data?.role

      next()
    }else{
      res.status(401).json({message:"Unauthorize"})
    }
  }catch(err){
    res.status(401).json({message:"Unauthorize"})
  }
}

async function AdminAuthGuard(req: Request, res: Response, next: NextFunction){
  try{
    let token = req.headers.authorization?.split(" ")[1]
    
    let decode: any = await JWT.verify(`${token}`, `${process.env.JWT_ADMIN_SECRET}`)
    
    req.auth_id = decode.data?.id
    req.auth_role = decode.data?.role

    next()
  }catch(err){
    res.status(401).json({message:"Unauthorize"})
  }
}

export {
  SuperAdminAuthGuard,
  AdminAuthGuard
}