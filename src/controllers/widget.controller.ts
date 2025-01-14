import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function Dashboard(req: Request, res: Response) {
  try {
    const currentDate = new Date()

    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0))
    const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999))

    const startOfLastWeek = new Date(currentDate)
    startOfLastWeek.setDate(currentDate.getDate() - 7)

    const startOfLastMonth = new Date(currentDate)
    startOfLastMonth.setDate(currentDate.getDate() - 30)

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    })

    const lastWeekAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfLastWeek,
          lte: endOfToday,
        },
      },
    })

    const lastMonthAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfLastMonth,
          lte: endOfToday,
        },
      },
    })

    const totalRevenueToday = todayAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    const totalRevenueLastWeek = lastWeekAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    const totalRevenueLastMonth = lastMonthAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    res.status(200).json({
      today_revenue: totalRevenueToday,
      weekly_revenue: totalRevenueLastWeek,
      monthly_revenue: totalRevenueLastMonth,
    })
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// ================ get widget data
export async function Reports(req: Request, res: Response) {
  try {
    const { tattooArtistId, tattooDesignerId, referralSourceId } = req.query

    const currentDate = new Date()

    const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59)

    const whereConditions: any = {
      date: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    }

    if (tattooArtistId) {
      whereConditions.tattooArtistId = tattooArtistId
    }

    if (tattooDesignerId) {
      whereConditions.tattooDesignerId = tattooDesignerId
    }

    if (referralSourceId) {
      whereConditions.referralSourceId = referralSourceId
    }

    const currentMonthAppointments = await prisma.appointment.findMany({
      where: whereConditions,
    })

    const lastMonthAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        ...whereConditions,
      },
    })

    const totalRevenueCurrentMonth = currentMonthAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    const totalRevenueLastMonth = lastMonthAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    let revenuePercentageChange = null

    if (totalRevenueLastMonth !== 0) {
      const revenueDifference = totalRevenueCurrentMonth - totalRevenueLastMonth
      revenuePercentageChange = (revenueDifference / totalRevenueLastMonth) * 100
    }

    const totalAppointmentsCurrentMonth = currentMonthAppointments.length
    const totalAppointmentsLastMonth = lastMonthAppointments.length

    let appointmentPercentageChange = null

    if (totalAppointmentsLastMonth !== 0) {
      const appointmentDifference = totalAppointmentsCurrentMonth - totalAppointmentsLastMonth
      appointmentPercentageChange = (appointmentDifference / totalAppointmentsLastMonth) * 100
    }

    const activeArtists = await prisma.artist.count({
      where: {
        status: "active",
      },
    })

    res.status(200).json({
      total_revenue: totalRevenueCurrentMonth,
      total_appointments: totalAppointmentsCurrentMonth,
      active_artists: activeArtists,
      revenue_percentage_change: revenuePercentageChange,
      appointment_percentage_change: appointmentPercentageChange,
    })
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// payment reports
export async function PaymentReports(req: Request, res: Response) {
  try {
    const { tattooArtistId, tattooDesignerId, referralSourceId } = req.query

    const currentDate = new Date()

    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0))
    const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999))

    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6))
    endOfWeek.setHours(23, 59, 59, 999)

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const whereConditions: any = {}

    if (tattooArtistId) {
      whereConditions.tattooArtistId = tattooArtistId
    }

    if (tattooDesignerId) {
      whereConditions.tattooDesignerId = tattooDesignerId
    }

    if (referralSourceId) {
      whereConditions.referralSourceId = referralSourceId
    }

    // Total Revenue Calculation
    const totalRevenueTodayAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday
        },
        ...whereConditions,
      },
    })

    const totalRevenueWeekAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        ...whereConditions,
      },
    })

    const totalRevenueMonthAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        ...whereConditions,
      },
    })

    // Calculate total revenue for each period
    const totalRevenueToday = totalRevenueTodayAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    const totalRevenueWeek = totalRevenueWeekAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    const totalRevenueMonth = totalRevenueMonthAppointments.reduce((sum, appointment) => {
      return sum + (appointment.totalPrice - appointment.remainingBalance)
    }, 0)

    res.json({
      total_revenue_today: totalRevenueToday || 0,
      total_revenue_week: totalRevenueWeek || 0,
      total_revenue_month: totalRevenueMonth || 0
    })
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}
