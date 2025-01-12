import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { HandleDeleteFiles, HandleFileUploads } from "../lib/file-upload";

const prisma = new PrismaClient()

// Get all artists
async function getArtists(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, pageSize = 6, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const searchCondition: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { specialties: { has: search } }
          ]
        }
      : {};

    const artists = await prisma.artist.findMany({
      where: searchCondition,
      skip,
      take,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const totalArtists = await prisma.artist.count({
      where: searchCondition,
    });

    res.json({
      data: artists,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalArtists,
        totalPages: Math.ceil(totalArtists / Number(pageSize)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Get a single artist by ID
async function getArtistById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const artist = await prisma.artist.findUnique({
      where: { id }
    });
    if (!artist) {
      res.status(404).json({ message: "Artist not found" });
      return;
    }
    res.json(artist);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Create a new artist
async function createArtist(req: Request, res: Response): Promise<void> {
  
  const { name, email, phone, specialties, status, joinDate } = req.body;
  try {
    // Only check for existing email if email is provided and not empty
    if (email && email.trim() !== '') {
      const existingArtist = await prisma.artist.findFirst({ where: { email } });
      if (existingArtist) {
        res.status(400).json({ message: "An artist with this email already exists" });
        return;
      }
    }

    let uploaded_files = await HandleFileUploads(req.files);

    const artistData: any = {
      name,
      specialties: Array.isArray(specialties) ? specialties : JSON.parse(specialties),
    };

    // Only add optional fields if they have values
    if (email && email.trim() !== '') {
      artistData.email = email;
    }
    if (phone && phone.trim() !== '') {
      artistData.phone = phone;
    }
    if (uploaded_files?.image) {
      artistData.imageUrl = uploaded_files.image;
    }
    if (status) {
      artistData.status = status;
    }
    if (joinDate) {
      artistData.joinDate = joinDate;
    }

    const newArtist = await prisma.artist.create({
      data: artistData
    });

    res.status(201).json(newArtist);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Update an existing artist
async function updateArtist(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, email, phone, specialties, status, joinDate } = req.body;
  try {
    let artist = await prisma.artist.findFirst({ where: { id } });
    if (!artist) {
      res.status(404).json({ message: "Artist not found" });
      return;
    }

    let uploaded_files = await HandleFileUploads(req.files);

    const updatedArtist = await prisma.artist.update({
      where: { id },
      data: {
        name,
        ...(email && email.trim() !== '' && { email }),
        ...(phone && phone.trim() !== '' && { phone }),
        specialties: Array.isArray(specialties) ? specialties : JSON.parse(specialties),
        ...(uploaded_files?.image && { imageUrl: uploaded_files.image }),
        ...(status && { status }),
        ...(joinDate && { joinDate })
      }
    });
    res.json(updatedArtist);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Delete an artist
async function deleteArtist(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    await prisma.artist.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

export { getArtists, getArtistById, createArtist, updateArtist, deleteArtist }
