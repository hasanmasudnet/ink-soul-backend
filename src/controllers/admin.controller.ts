import { Request, Response } from "express";
import * as argon from "argon2"
import { PrismaClient } from "@prisma/client";
import * as JWT from "jsonwebtoken"
import { HandleFileUploads } from "../lib/file-upload";

const prisma = new PrismaClient()

// create admin only for superuser
async function CreateAdmin(req: Request, res: Response){
  try{
    const {name, email, password, role, phone, address } = req.body

    let uploaded_files = await HandleFileUploads(req.files)

    let encrypted_password = await argon.hash(password)

    let email_exist = await prisma.admin.findFirst({where:{email: email}})
    if(email_exist){
      res.status(400).json({message:"A admin with this email address already exist"})
    }else{
      const new_admin = await prisma.admin.create({
        data:{
          name,
          email,
          avatar: uploaded_files?.avatar,
          password: encrypted_password,
          role,
          phone,
          address
        }
      })
  
      res.status(200).json(new_admin)
    }
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

// update admin
async function UpdateAdmin(req: Request, res: Response){
  try{
    const {name, email, password, role, phone, address } = req.body

    let uploaded_files = await HandleFileUploads(req.files)

    if(password && password!==""){
      let encrypted_password = await argon.hash(password)

      const updated_admin = await prisma.admin.update({
        where:{id: req.params.id},
        data:{
          name,
          email,
          avatar: uploaded_files?.avatar,
          password: encrypted_password,
          role,
          phone,
          address
        }
      })
  
      res.status(200).json(updated_admin)
    }else{
      const updated_admin = await prisma.admin.update({
        where:{id: req.params.id},
        data:{
          name,
          email,
          avatar: uploaded_files?.avatar,
          role,
          phone,
          address
        }
      })
  
      res.status(200).json(updated_admin)
    }
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

// admin login
async function AdminLogin(req: Request, res: Response){
  try{
    const { email, password } = req.body
    
    let user_exist = await prisma.admin.findFirst({where:{email: email}})
    if(user_exist){
      let password_matched = await argon.verify(`${user_exist?.password}`, password)
      if(password_matched){
        let token = await JWT.sign({data:{id: user_exist.id, role: user_exist.role}}, `${process.env.JWT_ADMIN_SECRET}`, {expiresIn:'7d'})
        res.status(200).json({token: token})
      }else{
        res.status(401).json({message:"Invalid credentials"})
      }
    }else{
      res.status(401).json({message:"Invalid credentials"})
    }
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

// update admin profile
async function UpdateProfile(req: Request, res: Response){
  try{
    const { name, email, phone, address } = req.body
    
    let uploaded_files = await HandleFileUploads(req.files)
    
    let updated_admin = await prisma.admin.update({
      where: {id: req.params.id},
      data: {
        name,
        email,
        phone,
        address,
        avatar: uploaded_files.avatar
      }
    })

    res.status(200).json({
      name: updated_admin.name,
      email: updated_admin.email,
      phone: updated_admin.phone,
      address: updated_admin.address,
      avatar: updated_admin.avatar
    })
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

// update password
async function UpdateAdminPassword(req: Request, res: Response){
  try{
    const { old_password, new_password } = req.body
    
    let admin = await prisma.admin.findFirst({where: {id: req.params.id}})
    
    let password_matched = await argon.verify(`${admin?.password}`, old_password)

    if(password_matched){
      if(admin?.role === req.auth_role){
        let encrypted_password = await argon.hash(new_password)
        await prisma.admin.update({
          where:{id: req.params.id},
          data: {
            password: encrypted_password
          }
        })
        res.status(200).json({message:"Password Updated"})
      }else{
        res.status(400).json({message:"Your are unauthorize to perform this action"})
      }
    }else{
      res.status(400).json({message:"Old password was incorrect"})
    }
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

// get admins
async function GetAdmins(req: Request, res: Response) {
  try {
    const { search, page = 1, pageSize = 10 } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string)
    const take = parseInt(pageSize as string)
    const searchFilter: any = search
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
            { phone: { contains: search as string, mode: 'insensitive' } },
            { address: { contains: search as string, mode: 'insensitive' } },
          ],
        }
      : {}
    const admins = await prisma.admin.findMany({
      where: searchFilter,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    const totalAdmins = await prisma.admin.count({
      where: searchFilter,
    })
    const totalPages = Math.ceil(totalAdmins / take)
    res.status(200).json({
      data: admins,
      pagination: {
        totalAdmins,
        totalPages,
        currentPage: page,
        pageSize: take,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

// get admin auth details
async function AdminAuth(req: Request, res: Response){
  try{
    let auth = await prisma.admin.findFirst({where:{id: req.auth_id}})

    res.status(200).json({
      id: auth?.id,
      avatar: auth?.avatar,
      name: auth?.name,
      email: auth?.email,
      role: auth?.role,
      phone: auth?.phone,
      address: auth?.address
    })
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

// delete admin
async function DeleteAdmin(req: Request, res: Response){
  try{
    await prisma.admin.delete({where:{id: req.params.id}})
    res.status(200).json({message:"Admin Deleted"})
  }catch(err){
    res.status(500).json({message:"Internal server error"})
  }
}

export { 
  CreateAdmin,
  UpdateAdmin,
  AdminLogin,
  UpdateProfile,
  UpdateAdminPassword,
  GetAdmins,
  AdminAuth,
  DeleteAdmin
}