'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RatingBadge } from '@/components/rating-badge'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { LUNAR_RAILS_VALUES } from '@/lib/constants'
import { ArrowLeft, CheckCircle } from 'lucide-react'

interface Meeting {
  id: string
  type: string
  meetingDate: string
  status: string
  manager: { name: string }
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
  quarterlyReview?: {
    masteryRating: number
    masteryDoneWell: string
    masteryDoBetter: string
    objectivesRating: number
    objectivesDoneWell: string
    objectivesDoBetter: string
    behavioursRating: number
    behavioursValues: string
    behavioursDoneWell: string
    behavioursDoBetter: string
    overallRating: number
    finalComments: string
    developmentPlan: string
  }
  reflection?: {
    reflectionText: string
  }
  acknowledgement?: {
    acknowledgedAt: string
  }
}

export default function MeetingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [reflection, setReflection] = useState('')
  const [submittingReflection, setSubmittingReflection] = useState(false)
  const [submittingAcknowledgement, setSubmittingAcknowledgement] = useState(false)
  const { toast } = useToast()
  const meetingId = params.id as string

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`)
        if (!res.ok) {
          // Try quarterly
          const qRes = await fetch(`/api/quarterly/${meetingId}`)
          if (qRes.ok) {
            const data = await qRes.json()
            setMeeting(data)
          }
        } else {
          const data = await res.json()
          setMeeting(data)
          if (data.reflection) {
            setReflection(data.reflection.reflectionText)
          }
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

  const handleSubmitReflection = async () => {
    if (!reflection.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your reflection',
        variant: 'destructive',
      })
      return
    }

    setSubmittingReflection(true)
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingRecordId: meetingId,
          reflectionText: reflection,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Your reflection has been submitted',
        })
        setMeeting((prev) =>
          prev
            ? {
                ...prev,
                reflection: { reflectionText: reflection },
              }
            : null
        )
      } else {
        throw new Error('Failed to submit reflection')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit reflection',
        variant: 'destructive',
      })
    } finally {
      setSubmittingReflection(false)
    }
  }

  const handleAcknowledge = async () => {
    setSubmittingAcknowledgement(true)
    try {
      const res = await fetch('/api/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingRecordId: meetingId,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'You have signed off on this meeting',
        })
        setMeeting((prev) =>
          prev
            ? {
                ...prev,
                status: 'ACKNOWLEDGED',
                acknowledgement: { acknowledgedAt: new Date().toISOString() },
              }
            : null
        )
      } else {
        throw new Error('Failed to acknowledge')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign off on meeting',
        variant: 'destructive',
      })
    } finally {
      setSubmittingAcknowledgement(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!meeting) {
    return <div className="text-center py-12">Meeting not found</div>
  }

  const getValueLabel = (key: string) => {
    return LUNAR_RAILS_VALUES.find((v) => v.key === key)?.label || key
  }

  return (
    <div>
      <Link href="/employee">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Meetings
        </Button>
      </Link>

      <PageHeader
        title={`${meeting.type === 'MONTHLY' ? 'Monthly Meeting' : 'Quarterly Review'}: ${formatDate(meeting.meetingDate)}`}
        description={`with ${meeting.manager.name}`}
      />

      <div className="space-y-6 max-w-4xl">
        {/* Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Status</CardTitle>
              <Badge variant="outline">
                {meeting.status === 'ACKNOWLEDGED' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Signed Off
                  </span>
                ) : (
                  'Action Required'
                )}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Monthly Meeting Details */}
        {meeting.monthlyMeeting && (
          <>
            {meeting.monthlyMeeting.employeeMITs && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your MITs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.employeeMITs}</p>
                </CardContent>
              </Card>
            )}

            {meeting.monthlyMeeting.doneWell && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What You Did Well</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.doneWell}</p>
                  {JSON.parse(meeting.monthlyMeeting.doneWellValues || '[]').length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(meeting.monthlyMeeting.doneWellValues).map((value: string) => (
                        <Badge key={value} variant="secondary">
                          {getValueLabel(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {meeting.monthlyMeeting.doDifferently && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What To Do Differently</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.doDifferently}</p>
                  {JSON.parse(meeting.monthlyMeeting.doDiffValues || '[]').length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(meeting.monthlyMeeting.doDiffValues).map((value: string) => (
                        <Badge key={value} variant="secondary">
                          {getValueLabel(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {meeting.monthlyMeeting.feedbackExchange && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Exchange</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.feedbackExchange}</p>
                </CardContent>
              </Card>
            )}

            {meeting.monthlyMeeting.supportAlignment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support & Alignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.supportAlignment}</p>
                </CardContent>
              </Card>
            )}

            {meeting.monthlyMeeting.nextMITs && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next MITs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.monthlyMeeting.nextMITs}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quarterly Review Details */}
        {meeting.quarterlyReview && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Overall Rating</CardTitle>
                  <RatingBadge rating={meeting.quarterlyReview.overallRating} size="lg" />
                </div>
              </CardHeader>
            </Card>

            {meeting.quarterlyReview.masteryDoneWell && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Mastery: Done Well</CardTitle>
                    <RatingBadge rating={meeting.quarterlyReview.masteryRating} size="sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.quarterlyReview.masteryDoneWell}</p>
                </CardContent>
              </Card>
            )}

            {meeting.quarterlyReview.objectivesDoneWell && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Objectives: Done Well</CardTitle>
                    <RatingBadge rating={meeting.quarterlyReview.objectivesRating} size="sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.quarterlyReview.objectivesDoneWell}</p>
                </CardContent>
              </Card>
            )}

            {meeting.quarterlyReview.behavioursDoneWell && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Behaviours & Values: Done Well</CardTitle>
                    <RatingBadge rating={meeting.quarterlyReview.behavioursRating} size="sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.quarterlyReview.behavioursDoneWell}</p>
                </CardContent>
              </Card>
            )}

            {meeting.quarterlyReview.developmentPlan && (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-lg">Development Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.quarterlyReview.developmentPlan}</p>
                </CardContent>
              </Card>
            )}

            {meeting.quarterlyReview.finalComments && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Final Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{meeting.quarterlyReview.finalComments}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Employee Reflection Section */}
        {meeting.status !== 'ACKNOWLEDGED' && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Your Reflection</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Share your thoughts on this meeting and feedback you received
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {meeting.reflection ? (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-900 font-semibold mb-2">You have reflected on this meeting</p>
                  <p className="text-sm whitespace-pre-wrap">{meeting.reflection.reflectionText}</p>
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder="Share your thoughts, how you're feeling about the feedback, and any questions you have..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="min-h-32"
                  />
                  <Button
                    onClick={handleSubmitReflection}
                    className="bg-lunar-navy hover:bg-lunar-navy-dark"
                    disabled={submittingReflection || !reflection.trim()}
                  >
                    {submittingReflection ? 'Submitting...' : 'Submit Reflection'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sign-off Section */}
        {meeting.status !== 'ACKNOWLEDGED' && (
          <Card className="border-l-4 border-l-green-500 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Sign Off on Meeting</CardTitle>
              <p className="text-sm text-green-800 mt-1">
                By signing off, you acknowledge that you have reviewed the notes and understand the feedback provided
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleAcknowledge}
                className="bg-green-600 hover:bg-green-700"
                disabled={submittingAcknowledgement}
              >
                {submittingAcknowledgement ? 'Signing off...' : 'Sign Off on Meeting'}
              </Button>
            </CardContent>
          </Card>
        )}

        {meeting.acknowledgement && (
          <Card className="border-l-4 border-l-green-500 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg text-green-900">Signed Off</CardTitle>
              </div>
              <p className="text-sm text-green-800 mt-2">
                You signed off on this meeting on {formatDate(meeting.acknowledgement.acknowledgedAt)}
              </p>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
