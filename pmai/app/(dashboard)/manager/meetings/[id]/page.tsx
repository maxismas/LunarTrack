'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { LUNAR_RAILS_VALUES } from '@/lib/constants'
import { ArrowLeft } from 'lucide-react'

interface Meeting {
  id: string
  type: string
  meetingDate: string
  status: string
  manager: { name: string }
  employee: { name: string }
  monthlyMeeting?: {
    employeeMITs: string
    doneWell: string
    doneWellValues: string
    doDifferently: string
    doDiffValues: string
    feedbackExchange: string
    supportAlignment: string
    nextMITs: string
  }
  reflection?: {
    reflectionText: string
    submittedAt: string
  }
  acknowledgement?: {
    acknowledgedAt: string
  }
}

export default function MeetingDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const meetingId = params.id as string

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`)
        if (res.ok) {
          const data = await res.json()
          setMeeting(data)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load meeting',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()
  }, [meetingId, toast])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!meeting) {
    return <div className="text-center py-12">Meeting not found</div>
  }

  const doneWellValues = JSON.parse(meeting.monthlyMeeting?.doneWellValues || '[]')
  const doDiffValues = JSON.parse(meeting.monthlyMeeting?.doDiffValues || '[]')

  const getValueLabel = (key: string) => {
    return LUNAR_RAILS_VALUES.find((v) => v.key === key)?.label || key
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
        title={`Monthly Meeting: ${meeting.employee.name}`}
        description={`Conducted by ${meeting.manager.name} on ${formatDate(meeting.meetingDate)}`}
      />

      <div className="space-y-6 max-w-4xl">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {meeting.status === 'DRAFT' ? 'Draft' : meeting.status === 'SUBMITTED' ? 'Submitted' : 'Acknowledged'}
            </Badge>
            {meeting.acknowledgement && (
              <p className="text-sm text-muted-foreground mt-2">
                Acknowledged on {formatDate(meeting.acknowledgement.acknowledgedAt)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Employee MITs */}
        {meeting.monthlyMeeting?.employeeMITs && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee MITs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.employeeMITs}</p>
            </CardContent>
          </Card>
        )}

        {/* Done Well */}
        {meeting.monthlyMeeting?.doneWell && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What They Did Well</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.doneWell}</p>
              {doneWellValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {doneWellValues.map((value: string) => (
                    <Badge key={value} variant="secondary">
                      {getValueLabel(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Do Differently */}
        {meeting.monthlyMeeting?.doDifferently && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What To Do Differently</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.doDifferently}</p>
              {doDiffValues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {doDiffValues.map((value: string) => (
                    <Badge key={value} variant="secondary">
                      {getValueLabel(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feedback Exchange */}
        {meeting.monthlyMeeting?.feedbackExchange && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback Exchange</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.feedbackExchange}</p>
            </CardContent>
          </Card>
        )}

        {/* Support & Alignment */}
        {meeting.monthlyMeeting?.supportAlignment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support & Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.supportAlignment}</p>
            </CardContent>
          </Card>
        )}

        {/* Next MITs */}
        {meeting.monthlyMeeting?.nextMITs && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next MITs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.nextMITs}</p>
            </CardContent>
          </Card>
        )}

        {/* Employee Reflection */}
        {meeting.reflection && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Employee Reflection</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted on {formatDate(meeting.reflection.submittedAt)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{meeting.reflection.reflectionText}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
