import type { User } from '@prisma/client'

export interface SessionUser extends User {
  role: string
  managerId: string | null
}

export interface ExtendedSession {
  user: {
    id: string
    email: string
    name: string
    role: string
    managerId: string | null
  }
  expires: string
}

export interface MeetingWithRelations {
  id: string
  managerId: string
  employeeId: string
  type: string
  meetingDate: Date
  status: string
  createdAt: Date
  updatedAt: Date
  manager?: User
  employee?: User
  monthlyMeeting?: any
  quarterlyReview?: any
  reflection?: any
  acknowledgement?: any
}

export interface MonthlyMeetingData {
  employeeMITs: string
  doneWell: string
  doneWellValues: string[]
  doDifferently: string
  doDiffValues: string[]
  feedbackExchange: string
  supportAlignment: string
  nextMITs: string
}

export interface QuarterlyReviewData {
  masteryRating: number
  masteryDoneWell: string
  masteryDoBetter: string
  objectivesRating: number
  objectivesDoneWell: string
  objectivesDoBetter: string
  behavioursRating: number
  behavioursValues: string[]
  behavioursDoneWell: string
  behavioursDoBetter: string
  overallRating: number
  overallRatingOverride: boolean
  overallRatingJustification: string
  finalComments: string
  followUpDate: string
  nextQuarterGoals: string
  developmentPlan: string
  compensationFlag: boolean
  compensationNotes: string
}
