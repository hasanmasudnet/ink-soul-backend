import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { HandleDeleteFiles, HandleFileUploads } from "../lib/file-upload";

const prisma = new PrismaClient()

// Get all designers
async function getDesigners(req: Request, res: Response) {
  try {
    const { page = 1, pageSize = 6, search = "", status = "" } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const searchCondition: any = {
      AND: []
    }

    if (search) {
      searchCondition.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { specialties: { has: search } }
        ]
      });
    }

    if (status) {
      searchCondition.AND.push({ status: { equals: status } });
    }

    const designers = await prisma.designer.findMany({
      where: searchCondition.AND.length > 0 ? searchCondition : undefined,
      skip,
      take,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const totalDesigners = await prisma.designer.count({
      where: searchCondition.AND.length > 0 ? searchCondition : undefined,
    });

    res.json({
      data: designers,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalDesigners,
        totalPages: Math.ceil(totalDesigners / Number(pageSize)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a single designer by ID
async function getDesignerById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const designer = await prisma.designer.findUnique({ where: { id } })
    if (!designer) {
      res.status(404).json({ message: "Designer not found" })
    } else {
      res.json(designer)
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Create a new designer
async function createDesigner(req: Request, res: Response) {
  const { name, email, phone, specialties, status, totalDesigns, joinDate } = req.body

  try {
    const existingDesigner = await prisma.designer.findFirst({ where: { email: email } })
    if (existingDesigner) {
      res.status(400).json({ message: "A designer with this email already exists" })
    } else {
      let uploaded_files = await HandleFileUploads(req.files)

      const newDesigner = await prisma.designer.create({
        data: {
          name,
          email,
          phone,
          specialties: JSON.parse(specialties),
          imageUrl: uploaded_files?.image,
          status,
          totalDesigns,
          joinDate
        }
      })
      res.status(201).json(newDesigner)
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Update an existing designer
async function updateDesigner(req: Request, res: Response) {
  const { id } = req.params
  const { name, email, phone, specialties, status } = req.body

  try {
    let designer = await prisma.designer.findFirst({where:{id: id}})
    let uploaded_files = await HandleFileUploads(req.files)
    await HandleDeleteFiles([`${uploaded_files?.image?`${designer?.imageUrl}`:null}`])

    const updatedDesigner = await prisma.designer.update({
      where: { id },
      data: { 
        name, 
        email, 
        phone, 
        specialties: JSON.parse(specialties), 
        imageUrl: uploaded_files?.image, 
        status, 
        updatedAt: new Date() 
      }
    })
    res.json(updatedDesigner)
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Delete a designer
async function deleteDesigner(req: Request, res: Response) {
  const { id } = req.params

  try {
    let designer = await prisma.designer.findFirst({where:{id: id}})
    HandleDeleteFiles([designer?.imageUrl])
    await prisma.designer.delete({ where: { id } })
    res.status(200).json({ message: "Designer deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

export { getDesigners, getDesignerById, createDesigner, updateDesigner, deleteDesigner }