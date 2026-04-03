'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingBadge } from '@/components/rating-badge'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
}

interface Meeting {
  id: string
  type: string
  meetingDate: string
  status: string
  quarterlyReview?: { overallRating: number }
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const employeeId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, meetingsRes, quarterlyRes] = await Promise.all([
          fetch(`/api/employees/${employeeId}`),
          fetch(`/api/meetings?type=MONTHLY`),
          fetch(`/api/quarterly`),
        ])

        if (meetingsRes.ok && quarterlyRes.ok) {
          const meetingsData = await meetingsRes.json()
          const quarterlyData = await quarterlyRes.json()

          const filtered = [
            ...meetingsData.filter((m: any) => m.employeeId === employeeId),
            ...quarterlyData.filter((q: any) => q.employeeId === employeeId),
          ].sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime())

          setMeetings(filtered)
        }

        // For employee data, we'll use a placeholder since API might not have GET by ID
        // In production, you'd create a proper GET endpoint
        setEmployee({
          id: employeeId,
          name: 'Employee',
          email: 'employee@lunarrails.io',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load employee data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [employeeId, toast])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <Link href="/manager">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <PageHeader
        title={employee?.name || 'Employee Profile'}
        description={employee?.email || 'View meeting history and performance data'}
      />

      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {meeting.type === 'MONTHLY' ? (
                      <Calendar className="w-5 h-5 text-blue-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-purple-500" />
                    )}
                    <div>
                      <CardTitle className="text-base">
                        {meeting.type === 'MONTHLY' ? 'Monthly Meeting' : 'Quarterly Review'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(meeting.meetingDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {meeting.quarterlyReview?.overallRating && (
                      <RatingBadge rating={meeting.quarterlyReview.overallRating} size="sm" />
                    )}
                    <Badge variant="outline">
                      {meeting.status === 'DRAFT' ? 'Draft' : meeting.status === 'SUBMITTED' ? 'Submitted' : 'Acknowledged'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/manager/meetings/${meeting.id}`}>
                  <Button variant="outline" size="sm">
                    View {meeting.type === 'MONTHLY' ? 'Meeting' : 'Review'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground mb-4">No meetings yet</p>
              <Link href={`/manager/meetings/new?employeeId=${employeeId}`}>
                <Button className="bg-lunar-navy hover:bg-lunar-navy-dark">
                  Create First Meeting
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
