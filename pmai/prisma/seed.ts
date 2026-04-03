import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.meetingAcknowledgement.deleteMany()
  await prisma.employeeReflection.deleteMany()
  await prisma.quarterlyReview.deleteMany()
  await prisma.monthlyMeeting.deleteMany()
  await prisma.meetingRecord.deleteMany()
  await prisma.user.deleteMany()
  await prisma.appConfig.deleteMany()

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const hrPassword = await bcrypt.hash('hr123', 10)
  const employeePassword = await bcrypt.hash('employee123', 10)

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@lunarrails.io',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Create Managers
  const manager1 = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah.manager@lunarrails.io',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  const manager2 = await prisma.user.create({
    data: {
      name: 'James Wright',
      email: 'james.manager@lunarrails.io',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  // Create HR Admin
  const hrAdmin = await prisma.user.create({
    data: {
      name: 'Emma HR',
      email: 'hr@lunarrails.io',
      password: hrPassword,
      role: 'HR_ADMIN',
    },
  })

  // Create Employees under Sarah
  const employee1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@lunarrails.io',
      password: employeePassword,
      role: 'EMPLOYEE',
      managerId: manager1.id,
    },
  })

  const employee2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@lunarrails.io',
      password: employeePassword,
      role: 'EMPLOYEE',
      managerId: manager1.id,
    },
  })

  // Create Employees under James
  const employee3 = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@lunarrails.io',
      password: employeePassword,
      role: 'EMPLOYEE',
      managerId: manager2.id,
    },
  })

  const employee4 = await prisma.user.create({
    data: {
      name: 'David Lee',
      email: 'david@lunarrails.io',
      password: employeePassword,
      role: 'EMPLOYEE',
      managerId: manager2.id,
    },
  })

  // Create sample monthly meetings
  const meeting1 = await prisma.meetingRecord.create({
    data: {
      managerId: manager1.id,
      employeeId: employee1.id,
      type: 'MONTHLY',
      meetingDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      status: 'SUBMITTED',
      monthlyMeeting: {
        create: {
          employeeMITs: 'Complete project Alpha design phase',
          doneWell: 'Alice demonstrated strong attention to detail in the design reviews',
          doneWellValues: '["truth_over_comfort", "ship_great_things"]',
          doDifferently: 'Could improve communication in team meetings',
          doDiffValues: '["say_hard_things"]',
          feedbackExchange: 'Good progress on Q1 objectives. Needs more initiative in proposing solutions.',
          supportAlignment: 'Alignment excellent with team goals. Recommend design system training.',
          nextMITs: 'Lead design system documentation, mentor junior designer',
        },
      },
    },
  })

  // Create reflection for meeting1
  await prisma.employeeReflection.create({
    data: {
      meetingRecordId: meeting1.id,
      employeeId: employee1.id,
      reflectionText:
        "I appreciated the feedback on communication. I'll work on speaking up more in team meetings. The design system training is exciting and I'm ready to get started!",
    },
  })

  // Create acknowledgement for meeting1
  await prisma.meetingAcknowledgement.create({
    data: {
      meetingRecordId: meeting1.id,
      employeeId: employee1.id,
    },
  })

  // Create second monthly meeting
  const meeting2 = await prisma.meetingRecord.create({
    data: {
      managerId: manager1.id,
      employeeId: employee1.id,
      type: 'MONTHLY',
      meetingDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      status: 'SUBMITTED',
      monthlyMeeting: {
        create: {
          employeeMITs: 'Finalize Q1 roadmap, interview new designers',
          doneWell: 'Excellent coordination with product team. Shipping features on time.',
          doneWellValues: '["ship_great_things", "focus_on_future"]',
          doDifferently: 'Request clarification earlier in projects',
          doDiffValues: '["act_with_agency"]',
          feedbackExchange: 'Outstanding work on customer feedback integration. Keep up the momentum.',
          supportAlignment: 'Team fully aligned. Consider mentoring program participation.',
          nextMITs: 'Implement new design patterns, start mentoring program',
        },
      },
    },
  })

  // Create quarterly review
  const quarterlyMeeting = await prisma.meetingRecord.create({
    data: {
      managerId: manager1.id,
      employeeId: employee1.id,
      type: 'QUARTERLY',
      meetingDate: new Date(new Date().getFullYear(), 2, 31),
      status: 'SUBMITTED',
      quarterlyReview: {
        create: {
          masteryRating: 4,
          masteryDoneWell: 'Exceptional technical growth. Deep expertise in design systems.',
          masteryDoBetter: 'Explore emerging design patterns and tools.',
          objectivesRating: 4,
          objectivesDoneWell: 'Exceeded all Q1 objectives. Shipped ahead of schedule.',
          objectivesDoBetter: 'Set even more ambitious goals for Q2.',
          behavioursRating: 3,
          behavioursValues: '["truth_over_comfort", "ship_great_things", "one_team_one_system"]',
          behavioursDoneWell: 'Lives values through excellent delivery and team collaboration.',
          behavioursDoBetter: 'Work on proactive feedback sharing.',
          overallRating: 4,
          overallRatingOverride: false,
          overallRatingJustification: '',
          finalComments:
            'Alice is a strong performer with significant growth potential. Recommend development plan for senior designer track.',
          followUpDate: '2026-07-15',
          nextQuarterGoals: 'Lead design system initiative, mentor junior team members',
          developmentPlan:
            '1. Design leadership training (Q2)\n2. Cross-functional mentoring (ongoing)\n3. Advanced component architecture workshop (Q2)',
          compensationFlag: true,
          compensationNotes: 'Strong performance warrants merit consideration.',
        },
      },
    },
  })

  // Create AppConfig
  await prisma.appConfig.create({
    data: {
      year: 2026,
      quarterlyMonths: '[3,6,9,12]',
      organisationName: 'LunarTrack',
    },
  })

  console.log('Database seeded successfully!')
  console.log('Created:')
  console.log(`- Super Admin: admin@lunarrails.io / admin123`)
  console.log(`- Manager 1: sarah.manager@lunarrails.io / manager123`)
  console.log(`- Manager 2: james.manager@lunarrails.io / manager123`)
  console.log(`- HR Admin: hr@lunarrails.io / hr123`)
  console.log(`- 4 Employees with password: employee123`)
  console.log(`- Sample meetings and reviews`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
