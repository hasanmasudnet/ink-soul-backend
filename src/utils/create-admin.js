const { PrismaClient } = require("@prisma/client");
const readlineSync = require("readline-sync");
const argon = require("argon2");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const name = readlineSync.question("Enter admin's name: ");
    
    let email;
    let emailExists = true;
    
    while (emailExists) {
      email = readlineSync.question("Enter admin's email: ");
      
      const existingAdmin = await prisma.admin.findUnique({
        where: {
          email: email,
        },
      });
      
      if (existingAdmin) {
        console.log("This email is already in use. Please enter another email.");
      } else {
        emailExists = false;
      }
    }

    const phone = readlineSync.question("Enter admin's phone number: ");
    const address = readlineSync.question("Enter admins's address: ")
    const password = readlineSync.question("Enter admin's password: ", { hideEchoBack: true });
    const confirmPassword = readlineSync.question("Confirm password: ", { hideEchoBack: true });

    if (password !== confirmPassword) {
      console.log("Passwords do not match. Please try again.");
      return;
    }

    const hashedPassword = await argon.hash(password);

    const role = "SUPER_ADMIN";

    const admin = await prisma.admin.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        address: address,
        password: hashedPassword,
        role: role,
      },
    });

    console.log("Admin created successfully!");
    console.log(`Admin Email: ${admin.email}`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
