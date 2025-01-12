import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create a new referral source
const createReferralSource = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body
    const referralSource = await prisma.referralSource.create({
      data: { name, description },
    })
    res.status(201).json(referralSource)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create referral source' })
  }
}

// Get all referral sources
const getReferralSources = async (req: Request, res: Response) => {
  const { search, page = 1, pageSize = 12 } = req.query;

  const pageInt = parseInt(page as string);
  const pageSizeInt = parseInt(pageSize as string);

  try {
    const whereClause: any = search && search.toString().trim() !== ""
      ? {
          OR: [
            {
              name: {
                contains: search.toString(),
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search.toString(),
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const referralSources = await prisma.referralSource.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (pageInt - 1) * pageSizeInt,
      take: pageSizeInt,
    });

    const totalReferralSources = await prisma.referralSource.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalReferralSources / pageSizeInt);

    res.status(200).json({
      data: referralSources,
      totalPages,
      currentPage: pageInt,
      totalReferralSources,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral sources' });
  }
}

// Get a single referral source by ID
const getReferralSourceById = async (req: Request, res: Response) => {
  try {
    const referralSource = await prisma.referralSource.findUnique({
      where: { id: req.params.id },
    })
    if (referralSource) {
      res.status(200).json(referralSource)
    } else {
      res.status(404).json({ message: 'Referral source not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch referral source' })
  }
}

// Update a referral source by ID
const updateReferralSource = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body
    const updatedReferralSource = await prisma.referralSource.update({
      where: { id: req.params.id },
      data: { name, description },
    })
    res.status(200).json(updatedReferralSource)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update referral source' })
  }
}

// Delete a referral source by ID
const deleteReferralSourceById = async (req: Request, res: Response) => {
  try {
    await prisma.referralSource.delete({
      where: { id: req.params.id },
    })
    res.status(200).json({ message: 'Referral source deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete referral source' })
  }
}

export { createReferralSource, getReferralSources, getReferralSourceById, updateReferralSource, deleteReferralSourceById }