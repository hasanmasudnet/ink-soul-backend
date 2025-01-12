import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { HandleDeleteFiles, HandleFileUploads } from "../lib/file-upload";

const prisma = new PrismaClient()

// Get all customers
async function getCustomers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = (req.query.search as string) || '';
    const skip = (page - 1) * pageSize;
    const whereClause: any = {
      customer_type: 'customer',
    };

    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        appointments: {
          select: {
            totalPrice: true,
            deposit: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: pageSize,
    });

    const transformedCustomers = customers.map((customer) => {
      const total_appointments = customer.appointments.length;
      const deposit = customer.appointments.reduce(
        (acc, appointment) => acc + appointment.deposit,
        0
      );
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        imageUrl: customer.imageUrl,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        appointments: total_appointments,
        totalSpent: deposit,
      };
    });

    res.status(200).json({
      page,
      pageSize,
      totalCustomers: await prisma.customer.count({ where: whereClause }),
      totalPages: Math.ceil(await prisma.customer.count({ where: whereClause }) / pageSize),
      data: transformedCustomers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a single customer by ID
async function getCustomerById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            tattooArtist: true,
            tattooDesigner: true,
            payments: true,
          },
        },
      },
    })

    if (customer) {
      const response = {
        customer,
        appointments: customer.appointments,
        payments: customer.appointments.flatMap(appointment => appointment.payments),
      }

      res.json(response)
    } else {
      res.status(404).json({ message: "Customer not found" })
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Create a new customer
async function createCustomer(req: Request, res: Response) {
  try {
    const { name, email, phone, status } = req.body

    let uploaded_files = await HandleFileUploads(req.files)

    const existingCustomer = await prisma.customer.findFirst({
      where: { email: email }
    })

    if (existingCustomer) {
      res.status(400).json({ message: "Customer with this email already exists" })
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          name,
          email,
          phone,
          status,
          imageUrl: uploaded_files?.image
        }
      })
      res.status(201).json(newCustomer)
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Update an existing customer
async function updateCustomer(req: Request, res: Response) {
  const { id } = req.params
  const { name, email, phone, status } = req.body
  
  let customer = await prisma.customer.findFirst({where:{id: id}})
  let uploaded_files = await HandleFileUploads(req.files)
  await HandleDeleteFiles([`${uploaded_files?.image?`${customer?.imageUrl}`:null}`])

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        status,
        imageUrl: uploaded_files?.image,
        updatedAt: new Date()
      }
    })
    res.json(updatedCustomer)
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

// Delete a customer
async function deleteCustomer(req: Request, res: Response) {
  const { id } = req.params

  try {
    let customer = await prisma.customer.findFirst({where:{id: id}})
    await HandleDeleteFiles([customer?.imageUrl])
    await prisma.customer.delete({
      where: { id }
    })
    res.status(200).json({ message: "Customer deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
}

export { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer }
