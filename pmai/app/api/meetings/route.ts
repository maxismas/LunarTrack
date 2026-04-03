import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'MONTHLY'

    let meetings

    if (session.user.role === 'MANAGER' || session.user.role === 'SUPER_ADMIN') {
      meetings = await prisma.meetingRecord.findMany({
        where: {
          managerId: session.user.id,
          type,
        },
        include: {
          employee: true,
          manager: true,
          monthlyMeeting: true,
          quarterlyReview: true,
          reflection: true,
          acknowledgement: true,
        },
        orderBy: { meetingDate: 'desc' },
      })
    } else if (session.user.role === 'EMPLOYEE') {
      meetings = await prisma.meetingRecord.findMany({
        where: {
          employeeId: session.user.id,
          type,
        },
        include: {
          employee: true,
          manager: true,
          monthlyMeeting: true,
          quarterlyReview: true,
          reflection: true,
          acknowledgement: true,
        },
        orderBy: { meetingDate: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(meetings)
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      employeeId,
      meetingDate,
      employeeMITs,
      doneWell,
      doneWellValues,
      doDifferently,
      doDiffValues,
      feedbackExchange,
      supportAlignment,
      nextMITs,
    } = body

    if (!employeeId || !meetingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const meeting = await prisma.meetingRecord.create({
      data: {
        managerId: session.user.id,
        employeeId,
        type: 'MONTHLY',
        meetingDate: new Date(meetingDate),
        status: 'DRAFT',
        monthlyMeeting: {
          create: {
            employeeMITs: employeeMITs || '',
            doneWell: doneWell || '',
            doneWellValues: JSON.stringify(doneWellValues || []),
            doDifferently: doDifferently || '',
            doDiffValues: JSON.stringify(doDiffValues || []),
            feedbackExchange: feedbackExchange || '',
            supportAlignment: supportAlignment || '',
            nextMITs: nextMITs || '',
          },
        },
      },
      include: {
        monthlyMeeting: true,
        employee: true,
      },
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
