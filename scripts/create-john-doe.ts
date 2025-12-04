import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createJohnDoe() {
  try {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email: 'john@doe.com' }
    })

    if (existing) {
      console.log('✅ User already exists:', existing.email)
      return
    }

    // Create John Doe test user
    const hashedPassword = await bcrypt.hash('johndoe123', 10)
    
    const user = await prisma.user.create({
      data: {
        username: 'john@doe.com',
        email: 'john@doe.com',
        password: hashedPassword,
        name: 'John Doe',
        role: 'player',
        membershipTier: 'athlete',
        membershipStatus: 'active',
        profileComplete: true,
        completedOnboarding: true,
        onboardingStep: 5,
        firstSessionCompleted: false,
      }
    })

    console.log('✅ John Doe test user created successfully!')
    console.log('Email:', user.email)
    console.log('Password: johndoe123')
    console.log('Role:', user.role)
    console.log('Tier:', user.membershipTier)
  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createJohnDoe()
