import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let reviews

    if (session.user.role === 'MANAGER' || session.user.role === 'SUPER_ADMIN') {
      reviews = await prisma.meetingRecord.findMany({
        where: {
          managerId: session.user.id,
          type: 'QUARTERLY',
        },
        include: {
          employee: true,
          manager: true,
          quarterlyReview: true,
          reflection: true,
          acknowledgement: true,
        },
        orderBy: { meetingDate: 'desc' },
      })
    } else if (session.user.role === 'EMPLOYEE') {
      reviews = await prisma.meetingRecord.findMany({
        where: {
          employeeId: session.user.id,
          type: 'QUARTERLY',
        },
        include: {
          employee: true,
          manager: true,
          quarterlyReview: true,
          reflection: true,
          acknowledgement: true,
        },
        orderBy: { meetingDate: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching quarterly reviews:', error)
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
      masteryRating,
      masteryDoneWell,
      masteryDoBetter,
      objectivesRating,
      objectivesDoneWell,
      objectivesDoBetter,
      behavioursRating,
      behavioursValues,
      behavioursDoneWell,
      behavioursDoBetter,
      overallRating,
      overallRatingOverride,
      overallRatingJustification,
      finalComments,
      followUpDate,
      nextQuarterGoals,
      developmentPlan,
      compensationFlag,
      compensationNotes,
    } = body

    if (!employeeId || !meetingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const review = await prisma.meetingRecord.create({
      data: {
        managerId: session.user.id,
        employeeId,
        type: 'QUARTERLY',
        meetingDate: new Date(meetingDate),
        status: 'DRAFT',
        quarterlyReview: {
          create: {
            masteryRating: masteryRating || 3,
            masteryDoneWell: masteryDoneWell || '',
            masteryDoBetter: masteryDoBetter || '',
            objectivesRating: objectivesRating || 3,
            objectivesDoneWell: objectivesDoneWell || '',
            objectivesDoBetter: objectivesDoBetter || '',
            behavioursRating: behavioursRating || 3,
            behavioursValues: JSON.stringify(behavioursValues || []),
            behavioursDoneWell: behavioursDoneWell || '',
            behavioursDoBetter: behavioursDoBetter || '',
            overallRating: overallRating || 3,
            overallRatingOverride: overallRatingOverride || false,
            overallRatingJustification: overallRatingJustification || '',
            finalComments: finalComments || '',
            followUpDate: followUpDate || '',
            nextQuarterGoals: nextQuarterGoals || '',
            developmentPlan: developmentPlan || '',
            compensationFlag: compensationFlag || false,
            compensationNotes: compensationNotes || '',
          },
        },
      },
      include: {
        quarterlyReview: true,
        employee: true,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating quarterly review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
