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
    const { meetingRecordId } = body

    if (!meetingRecordId) {
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

    // Delete existing acknowledgement if any
    await prisma.meetingAcknowledgement.deleteMany({
      where: { meetingRecordId },
    })

    // Create new acknowledgement
    const acknowledgement = await prisma.meetingAcknowledgement.create({
      data: {
        meetingRecordId,
        employeeId: session.user.id,
      },
    })

    // Update meeting status to ACKNOWLEDGED
    await prisma.meetingRecord.update({
      where: { id: meetingRecordId },
      data: { status: 'ACKNOWLEDGED' },
    })

    return NextResponse.json(acknowledgement, { status: 201 })
  } catch (error) {
    console.error('Error acknowledging meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
