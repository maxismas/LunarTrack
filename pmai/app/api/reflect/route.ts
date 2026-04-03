import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { meetingRecordId, reflectionText } = body

    if (!meetingRecordId || !reflectionText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify this meeting belongs to the employee
    const meeting = await prisma.meetingRecord.findUnique({
      where: { id: meetingRecordId },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    if (meeting.employeeId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete existing reflection if any
    await prisma.employeeReflection.deleteMany({
      where: { meetingRecordId },
    })

    // Create new reflection
    const reflection = await prisma.employeeReflection.create({
      data: {
        meetingRecordId,
        employeeId: session.user.id,
        reflectionText,
      },
    })

    return NextResponse.json(reflection, { status: 201 })
  } catch (error) {
    console.error('Error adding reflection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
