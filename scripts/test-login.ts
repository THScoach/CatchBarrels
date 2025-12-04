import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'john@doe.com' }
    })

    if (!user || !user.password) {
      console.log('❌ User not found or no password set')
      return
    }

    // Test password
    const isValid = await bcrypt.compare('johndoe123', user.password)
    
    if (isValid) {
      console.log('✅ Login credentials are valid!')
      console.log('\n📝 Test Account Details:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Email:    john@doe.com')
      console.log('Password: johndoe123')
      console.log('Role:     player')
      console.log('Tier:     athlete')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else {
      console.log('❌ Password is incorrect')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
