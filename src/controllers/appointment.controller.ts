import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { HandleDeleteFiles, HandleFileUploads } from '../lib/file-upload'
import { CombineDateWithTime } from '../lib/func'

const prisma = new PrismaClient()

export const getCustomers = async (req: Request, res: Response)=>{
  try{
    let customers = await prisma.customer.findMany({
      orderBy:{
        updatedAt:'desc'
      }
    })
    res.status(200).json(customers)
  }catch(err){
    res.status(500).json({"message":"Internal server error"})
  }
}

export const getArtists = async (req: Request, res: Response)=>{
  try{
    let customers = await prisma.artist.findMany({
      orderBy:{
        updatedAt:'desc'
      }
    })
    res.status(200).json(customers)
  }catch(err){
    res.status(500).json({"message":"Internal server error"})
  }
}

export const getDesigners = async (req: Request, res: Response)=>{
  try{
    let customers = await prisma.designer.findMany({
      orderBy:{
        updatedAt:'desc'
      }
    })
    res.status(200).json(customers)
  }catch(err){
    res.status(500).json({"message":"Internal server error"})
  }
}

export const getReferrals = async (req: Request, res: Response)=>{
  try{
    let customers = await prisma.referralSource.findMany({
      orderBy:{
        updatedAt:'desc'
      }
    })
    res.status(200).json(customers)
  }catch(err){
    res.status(500).json({"message":"Internal server error"})
  }
}

// ===================

// Create a new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { customerId, customerType, tattooArtistId, tattooDesignerId, referralSourceId, date, time, totalPrice, payments, status } = req.body
    let payment_data = JSON.parse(payments)
    let total_price = parseFloat(totalPrice)
    let total_deposit = payment_data.reduce((sum: number, item: {amount: number}) => sum + item.amount, 0)

    let uploaded_files = await HandleFileUploads(req.files)
    
    const appointmentTime = CombineDateWithTime(date, time)

    await prisma.customer.update({where:{id: customerId},data:{customer_type: customerType}})

    const appointment = await prisma.appointment.create({
      data: {
        customerId: customerId,
        tattooArtistId: tattooArtistId,
        tattooDesignerId: tattooDesignerId,
        referralSourceId: referralSourceId,
        date: new Date(date),
        time: appointmentTime,
        totalPrice: total_price,
        deposit: total_deposit,
        remainingBalance: total_price - total_deposit,
        status: (total_price - total_deposit) === 0?"completed":"pending",
        paymentType: payment_data.length > 0? payment_data[0]?.paymentMethod:"",
        photoId: uploaded_files?.photoId,
        tattooDesign: uploaded_files?.tattooDesign,
        tattooConsent: uploaded_files?.tattooConsent,
        creditCardAuth: uploaded_files?.creditCardAuth
      }
    })

    if(total_deposit > 0){
      payment_data.forEach((payment: any)=>{payment.appointmentId = appointment.id})

      await prisma.payment.createMany({
        data: payment_data
      })
      
      res.status(201).json(appointment)
    }else{
      res.status(201).json(appointment)
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
  const { search, customerId, tattooArtistId, tattooDesignerId, referralSourceId, status, startDate, endDate, page = 1, pageSize = 10 } = req.query
  
  try {
    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    const searchFilters: any = {}

    let startDateParsed = startDate ? new Date(String(startDate)) : null
    let endDateParsed = endDate ? new Date(String(endDate)) : null

    if (startDateParsed && endDateParsed) {
      searchFilters.date = {
        gte: startDateParsed,
        lte: endDateParsed,
      }
    } else if (startDateParsed) {
      searchFilters.date = {
        gte: startDateParsed,
      }
    } else if (endDateParsed) {
      searchFilters.date = {
        lte: endDateParsed,
      }
    }

    if (search) {
      searchFilters.OR = [
        { customer: { name: { contains: String(search), mode: 'insensitive' } } },
        { tattooArtist: { name: { contains: String(search), mode: 'insensitive' } } },
        { tattooDesigner: { name: { contains: String(search), mode: 'insensitive' } } },
        { referralSource: { name: { contains: String(search), mode: 'insensitive' } } }
      ]
    }

    if (customerId) searchFilters.customerId = String(customerId)
    if (tattooArtistId) searchFilters.tattooArtistId = String(tattooArtistId)
    if (tattooDesignerId) searchFilters.tattooDesignerId = String(tattooDesignerId)
    if (referralSourceId) searchFilters.referralSourceId = String(referralSourceId)
    if (status) searchFilters.status = String(status)

    const appointments = await prisma.appointment.findMany({
      where: Object.keys(searchFilters).length ? searchFilters : undefined,
      include: {
        customer: true,
        tattooArtist: true,
        tattooDesigner: true,
        referralSource: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take,
    })

    const totalAppointments = await prisma.appointment.count({
      where: Object.keys(searchFilters).length ? searchFilters : undefined
    })

    res.status(200).json({
      appointments,
      pagination: {
        totalAppointments,
        totalPages: Math.ceil(totalAppointments / Number(pageSize)),
        currentPage: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Get a single appointment by ID
export const getAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        tattooArtist: true,
        tattooDesigner: true,
        referralSource: true,
        payments: true
      }
    })
    if (appointment) {
      res.status(200).json(appointment)
    } else {
      res.status(404).json({ error: 'Appointment not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' })
  }
}

// Update an appointment by ID
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { customerId, customerType, tattooArtistId, tattooDesignerId, referralSourceId, date, time, totalPrice, payments, status } = req.body
    let appointment = await prisma.appointment.findFirst({where:{id: req.params.id}})
    let uploaded_files = await HandleFileUploads(req.files)

    let payment_data = JSON.parse(payments)
    let total_price = parseFloat(totalPrice)
    let total_deposit = payment_data.reduce((sum: number, item: {amount: number}) => sum + item.amount, 0)

    const appointmentTime = CombineDateWithTime(date, time)

    await HandleDeleteFiles([
      `${uploaded_files?.photoId?`${appointment?.photoId}`:null}`, 
      `${uploaded_files?.tattooDesign?`${appointment?.tattooDesign}`:null}`,
      `${uploaded_files?.tattooConsent?`${appointment?.tattooConsent}`:null}`,
      `${uploaded_files?.creditCardAuth?`${appointment?.creditCardAuth}`:null}`,
    ])

    await prisma.customer.update({where:{id: customerId},data:{customer_type: customerType}})
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        customerId: customerId,
        tattooArtistId: tattooArtistId,
        tattooDesignerId: tattooDesignerId,
        referralSourceId: referralSourceId,
        date: new Date(date),
        time: appointmentTime,
        totalPrice: total_price,
        deposit: total_deposit,
        remainingBalance: total_price - total_deposit,
        status: (total_price - total_deposit) === 0?"completed":"pending",
        paymentType: payment_data.length > 0? payment_data[0]?.paymentMethod:"",
        photoId: uploaded_files?.photoId,
        tattooDesign: uploaded_files?.tattooDesign,
        tattooConsent: uploaded_files?.tattooConsent,
        creditCardAuth: uploaded_files?.creditCardAuth
      }
    })

    await prisma.payment.deleteMany({where: {appointmentId: req.params.id}})

    if(total_deposit > 0){
      payment_data.forEach((payment: any)=>{payment.appointmentId = req.params.id})

      await prisma.payment.createMany({
        data: payment_data
      })
      
      res.status(201).json(updatedAppointment)
    }else{
      res.status(201).json(updatedAppointment)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' })
  }
}

// Delete an appointment by ID
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    let appointment = await prisma.appointment.findFirst({where:{ id: req.params.id }})
    if(appointment){
      await prisma.appointment.delete({
        where: { id: req.params.id }
      })

      await HandleDeleteFiles([appointment.photoId, appointment.tattooDesign, appointment.tattooConsent, appointment.creditCardAuth])

      res.status(200).json({ message: "Appointment deleted" })
    }else{
      res.status(404).json({ message: "Appointment not found" })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' })
  }
}