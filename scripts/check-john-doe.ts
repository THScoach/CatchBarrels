import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'john@doe.com' }
    })
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        hasPassword: !!user.password
      })
    } else {
      console.log('❌ User not found with email: john@doe.com')
      
      // Check all users to see what's available
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true
        },
        take: 10
      })
      console.log('\nAvailable users:', allUsers)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
