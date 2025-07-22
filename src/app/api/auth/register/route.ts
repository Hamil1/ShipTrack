import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/utils/auth'
import { ApiResponse, AuthResponse } from '@/types'

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: validationResult.error.errors[0].message
      }, { status: 400 })
    }
    
    const { name, email, password } = validationResult.data
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      }, { status: 409 })
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // Generate JWT token
    const token = generateToken(user)
    
    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during registration'
    }, { status: 500 })
  }
} 