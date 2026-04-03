'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingBadge } from '@/components/rating-badge'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Calendar, FileText } from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
}

interface MeetingStats {
  [employeeId: string]: {
    monthlyCount: number
    quarterlyCount: number
    lastRating?: number
  }
}

export default function ManagerDashboard() {
  const { data: session } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<MeetingStats>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, meetingsRes, quarterlyRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/meetings?type=MONTHLY'),
          fetch('/api/quarterly'),
        ])

        if (empRes.ok) {
          const empData = await empRes.json()
          setEmployees(empData)

          // Aggregate stats
          const meetingsData = await meetingsRes.json()
          const quarterlyData = await quarterlyRes.json()

          const newStats: MeetingStats = {}
          empData.forEach((emp: Employee) => {
            newStats[emp.id] = { monthlyCount: 0, quarterlyCount: 0 }
          })

          meetingsData.forEach((m: any) => {
            if (newStats[m.employeeId]) {
              newStats[m.employeeId].monthlyCount++
            }
          })

          quarterlyData.forEach((q: any) => {
            if (newStats[q.employeeId]) {
              newStats[q.employeeId].quarterlyCount++
              if (!newStats[q.employeeId].lastRating && q.quarterlyReview?.overallRating) {
                newStats[q.employeeId].lastRating = q.quarterlyReview.overallRating
              }
            }
          })

          setStats(newStats)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <PageHeader
        title="Manager Dashboard"
        description="Manage performance reviews for your team"
      >
        <Link href="/manager/meetings/new">
          <Button className="bg-lunar-navy hover:bg-lunar-navy-dark">
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6">
        {employees.map((employee) => {
          const empStats = stats[employee.id] || { monthlyCount: 0, quarterlyCount: 0 }

          return (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{employee.email}</p>
                  </div>
                  {empStats.lastRating && (
                    <RatingBadge rating={empStats.lastRating} size="md" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {empStats.monthlyCount} monthly meeting{empStats.monthlyCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {empStats.quarterlyCount} quarterly review{empStats.quarterlyCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link href={`/manager/employees/${employee.id}`}>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </Link>
                  <Link href={`/manager/meetings/new?employeeId=${employee.id}`}>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      Monthly
                    </Button>
                  </Link>
                  <Link href={`/manager/quarterly/new?employeeId=${employee.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="w-3 h-3 mr-1" />
                      Quarterly
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {employees.length === 0 && (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground">No employees assigned yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
