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

    const review = await prisma.meetingRecord.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
        manager: true,
        quarterlyReview: true,
        reflection: true,
        acknowledgement: true,
      },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (
      session.user.id !== review.managerId &&
      session.user.id !== review.employeeId &&
      session.user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
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

    const review = await prisma.meetingRecord.findUnique({
      where: { id: params.id },
      include: { quarterlyReview: true },
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    if (session.user.id !== review.managerId && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    if (review.quarterlyReview) {
      await prisma.quarterlyReview.update({
        where: { id: review.quarterlyReview.id },
        data: {
          masteryRating: body.masteryRating !== undefined ? body.masteryRating : undefined,
          masteryDoneWell: body.masteryDoneWell !== undefined ? body.masteryDoneWell : undefined,
          masteryDoBetter: body.masteryDoBetter !== undefined ? body.masteryDoBetter : undefined,
          objectivesRating: body.objectivesRating !== undefined ? body.objectivesRating : undefined,
          objectivesDoneWell: body.objectivesDoneWell !== undefined ? body.objectivesDoneWell : undefined,
          objectivesDoBetter: body.objectivesDoBetter !== undefined ? body.objectivesDoBetter : undefined,
          behavioursRating: body.behavioursRating !== undefined ? body.behavioursRating : undefined,
          behavioursValues: body.behavioursValues !== undefined ? JSON.stringify(body.behavioursValues) : undefined,
          behavioursDoneWell: body.behavioursDoneWell !== undefined ? body.behavioursDoneWell : undefined,
          behavioursDoBetter: body.behavioursDoBetter !== undefined ? body.behavioursDoBetter : undefined,
          overallRating: body.overallRating !== undefined ? body.overallRating : undefined,
          overallRatingOverride: body.overallRatingOverride !== undefined ? body.overallRatingOverride : undefined,
          overallRatingJustification: body.overallRatingJustification !== undefined ? body.overallRatingJustification : undefined,
          finalComments: body.finalComments !== undefined ? body.finalComments : undefined,
          followUpDate: body.followUpDate !== undefined ? body.followUpDate : undefined,
          nextQuarterGoals: body.nextQuarterGoals !== undefined ? body.nextQuarterGoals : undefined,
          developmentPlan: body.developmentPlan !== undefined ? body.developmentPlan : undefined,
          compensationFlag: body.compensationFlag !== undefined ? body.compensationFlag : undefined,
          compensationNotes: body.compensationNotes !== undefined ? body.compensationNotes : undefined,
        },
      })
    }

    const updated = await prisma.meetingRecord.update({
      where: { id: params.id },
      data: {
        status: body.status || undefined,
      },
      include: {
        employee: true,
        manager: true,
        quarterlyReview: true,
        reflection: true,
        acknowledgement: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
