import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create a new payment for an appointment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { appointmentId, amount, paymentMethod, notes } = req.body;

    let cu_appoint: any = await prisma.appointment.findFirst({where:{id: appointmentId}})

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        remainingBalance: cu_appoint.remainingBalance - amount,
        status: cu_appoint.remainingBalance - amount === 0?"completed":"pending"
      },
    });

    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amount,
        paymentMethod,
        notes,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all payments for an appointment
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      startDate, 
      endDate, 
      customerId, 
      tattooArtistId, 
      tattooDesignerId, 
      referralSourceId, 
      appointmentId,
      payment_method,
      status
    } = req.query

    const pageNumber = parseInt(page as string, 10)
    const pageLimit = parseInt(limit as string, 10)

    const skip = (pageNumber - 1) * pageLimit

    const searchFilter: any = {
      AND: []
    }

    if (search) {
      searchFilter.AND.push({
        OR: [
          {
            notes: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            appointment: {
              customer: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            appointment: {
              tattooArtist: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      })
    }

    if (startDate || endDate) {
      const dateFilter: any = {}
      if (startDate) {
        const start = new Date(startDate as string)
        if (!isNaN(start.getTime())) {
          dateFilter.gte = start
        }
      }
      if (endDate) {
        const end = new Date(endDate as string)
        if (!isNaN(end.getTime())) {
          dateFilter.lte = end
        }
      }
      if (Object.keys(dateFilter).length > 0) {
        searchFilter.AND.push({
          appointment: {
            date: dateFilter
          }
        })
      }
    }

    if (customerId) {searchFilter.AND.push({appointment: {customerId}})}
    if (tattooArtistId) {searchFilter.AND.push({appointment: {tattooArtistId}})}
    if (tattooDesignerId) {searchFilter.AND.push({appointment: {tattooDesignerId}})}
    if (referralSourceId) {searchFilter.AND.push({appointment: {referralSourceId}})}
    if (payment_method) {searchFilter.AND.push({paymentMethod: payment_method})}
    if (status) {searchFilter.AND.push({status})}
    if (appointmentId) {searchFilter.AND.push({appointmentId})}

    const payments = await prisma.payment.findMany({
      where: searchFilter,
      skip,
      take: pageLimit,
      include: {
        appointment: {
          include: {
            customer: true,
            tattooArtist: true,
            tattooDesigner: true,
            referralSource: true
          }
        }
      }
    })

    const totalCount = await prisma.payment.count({
      where: searchFilter
    })

    const totalPages = Math.ceil(totalCount / pageLimit)

    res.status(200).json({
      data: payments,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get a specific payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' })
    } else {
      res.json(payment)
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}