import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meeting = await prisma.meetingRecord.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
        manager: true,
        monthlyMeeting: true,
        quarterlyReview: true,
        reflection: true,
        acknowledgement: true,
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      session.user.id !== meeting.managerId &&
      session.user.id !== meeting.employeeId &&
      session.user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Error fetching meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meeting = await prisma.meetingRecord.findUnique({
      where: { id: params.id },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    if (session.user.id !== meeting.managerId && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      status,
      employeeMITs,
      doneWell,
      doneWellValues,
      doDifferently,
      doDiffValues,
      feedbackExchange,
      supportAlignment,
      nextMITs,
    } = body

    if (meeting.type === 'MONTHLY' && meeting.monthlyMeeting) {
      await prisma.monthlyMeeting.update({
        where: { id: meeting.monthlyMeeting.id },
        data: {
          employeeMITs: employeeMITs !== undefined ? employeeMITs : undefined,
          doneWell: doneWell !== undefined ? doneWell : undefined,
          doneWellValues: doneWellValues !== undefined ? JSON.stringify(doneWellValues) : undefined,
          doDifferently: doDifferently !== undefined ? doDifferently : undefined,
          doDiffValues: doDiffValues !== undefined ? JSON.stringify(doDiffValues) : undefined,
          feedbackExchange: feedbackExchange !== undefined ? feedbackExchange : undefined,
          supportAlignment: supportAlignment !== undefined ? supportAlignment : undefined,
          nextMITs: nextMITs !== undefined ? nextMITs : undefined,
        },
      })
    }

    const updated = await prisma.meetingRecord.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
      },
      include: {
        employee: true,
        manager: true,
        monthlyMeeting: true,
        quarterlyReview: true,
        reflection: true,
        acknowledgement: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
