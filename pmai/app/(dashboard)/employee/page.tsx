'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RatingBadge } from '@/components/rating-badge'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { AlertCircle, Calendar, FileText } from 'lucide-react'

interface Meeting {
  id: string
  type: string
  meetingDate: string
  status: string
  manager: { name: string }
  quarterlyReview?: { overallRating: number }
  reflection?: { reflectionText: string }
  acknowledgement?: { acknowledgedAt: string }
}

export default function EmployeePortalPage() {
  const { data: session } = useSession()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const [monthlyRes, quarterlyRes] = await Promise.all([
          fetch('/api/meetings?type=MONTHLY'),
          fetch('/api/quarterly'),
        ])

        if (monthlyRes.ok && quarterlyRes.ok) {
          const monthlyData = await monthlyRes.json()
          const quarterlyData = await quarterlyRes.json()

          const combined = [...monthlyData, ...quarterlyData].sort(
            (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
          )

          setMeetings(combined)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load meetings',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [toast])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const pendingMeetings = meetings.filter((m) => m.status !== 'ACKNOWLEDGED')

  return (
    <div>
      <PageHeader
        title="My Performance Meetings"
        description="View and reflect on your performance discussions"
      />

      {pendingMeetings.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <CardTitle className="text-base text-blue-900">Action Required</CardTitle>
                <p className="text-sm text-blue-800 mt-1">
                  You have {pendingMeetings.length} meeting{pendingMeetings.length !== 1 ? 's' : ''} awaiting your reflection and sign-off
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map((meeting) => {
            const isPending = meeting.status !== 'ACKNOWLEDGED'

            return (
              <Card
                key={meeting.id}
                className={isPending ? 'border-l-4 border-l-blue-500' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {meeting.type === 'MONTHLY' ? (
                        <Calendar className="w-5 h-5 text-blue-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-500" />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {meeting.type === 'MONTHLY' ? 'Monthly Meeting' : 'Quarterly Review'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          with {meeting.manager.name} • {formatDate(meeting.meetingDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      {meeting.quarterlyReview?.overallRating && (
                        <RatingBadge rating={meeting.quarterlyReview.overallRating} size="sm" />
                      )}
                      {isPending ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">Action Required</Badge>
                      ) : (
                        <Badge variant="outline">Signed Off</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {meeting.reflection && (
                    <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                      <p className="font-semibold text-green-900 text-xs">You reflected on this meeting</p>
                    </div>
                  )}
                  {meeting.acknowledgement && (
                    <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                      <p className="font-semibold text-green-900 text-xs">
                        You signed off on this meeting
                      </p>
                    </div>
                  )}
                  <Link href={`/employee/meetings/${meeting.id}`}>
                    <Button variant="outline" size="sm">
                      View {meeting.type === 'MONTHLY' ? 'Meeting' : 'Review'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground">No meetings yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
