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
import { LUNAR_RAILS_VALUES } from '@/lib/constants'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

interface Review {
  id: string
  type: string
  meetingDate: string
  status: string
  manager: { name: string }
  employee: { name: string }
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
    overallRatingOverride: boolean
    overallRatingJustification: string
    finalComments: string
    followUpDate: string
    nextQuarterGoals: string
    developmentPlan: string
    compensationFlag: boolean
    compensationNotes: string
  }
  reflection?: {
    reflectionText: string
    submittedAt: string
  }
  acknowledgement?: {
    acknowledgedAt: string
  }
}

export default function QuarterlyReviewPage() {
  const params = useParams()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const reviewId = params.id as string

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/quarterly/${reviewId}`)
        if (res.ok) {
          const data = await res.json()
          setReview(data)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load review',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReview()
  }, [reviewId, toast])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!review) {
    return <div className="text-center py-12">Review not found</div>
  }

  const qr = review.quarterlyReview!
  const values = JSON.parse(qr.behavioursValues || '[]')

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
        title={`Quarterly Review: ${review.employee.name}`}
        description={`Conducted by ${review.manager.name} on ${formatDate(review.meetingDate)}`}
      />

      <div className="space-y-6 max-w-4xl">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Overall Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {review.status === 'DRAFT' ? 'Draft' : review.status === 'SUBMITTED' ? 'Submitted' : 'Acknowledged'}
              </Badge>
              <RatingBadge rating={qr.overallRating} size="lg" />
            </div>
            {review.acknowledgement && (
              <p className="text-sm text-muted-foreground">
                Acknowledged on {formatDate(review.acknowledgement.acknowledgedAt)}
              </p>
            )}
            {qr.overallRatingOverride && (
              <div className="text-sm bg-blue-50 p-3 rounded">
                <p className="font-semibold text-blue-900">Rating Override</p>
                <p className="text-blue-800 mt-1">{qr.overallRatingJustification}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimension 1: Mastery */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Dimension 1: Mastery</CardTitle>
              <RatingBadge rating={qr.masteryRating} size="sm" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {qr.masteryDoneWell && (
              <div>
                <p className="text-sm font-semibold text-green-700">Done Well</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{qr.masteryDoneWell}</p>
              </div>
            )}
            {qr.masteryDoBetter && (
              <div>
                <p className="text-sm font-semibold text-amber-700">Do Better</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{qr.masteryDoBetter}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimension 2: Objectives */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Dimension 2: Objectives</CardTitle>
              <RatingBadge rating={qr.objectivesRating} size="sm" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {qr.objectivesDoneWell && (
              <div>
                <p className="text-sm font-semibold text-green-700">Done Well</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{qr.objectivesDoneWell}</p>
              </div>
            )}
            {qr.objectivesDoBetter && (
              <div>
                <p className="text-sm font-semibold text-amber-700">Do Better</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{qr.objectivesDoBetter}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimension 3: Behaviours & Values */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Dimension 3: Behaviours & Values</CardTitle>
              <RatingBadge rating={qr.behavioursRating} size="sm" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {values.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Values Demonstrated</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((value: string) => (
                    <Badge key={value} variant="secondary">
                      {getValueLabel(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {qr.behavioursDoneWell && (
              <div>
                <p className="text-sm font-semibold text-green-700">Done Well</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{qr.behavioursDoneWell}</p>
              </div>
            )}
            {qr.behavioursDoBetter && (
              <div>
                <p className="text-sm font-semibold text-amber-700">Do Better</p>
                <p className="text-sm whitespace-pre-wrap mt-1">{qr.behavioursDoBetter}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Final Comments */}
        {qr.finalComments && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Final Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{qr.finalComments}</p>
            </CardContent>
          </Card>
        )}

        {/* Development Plan */}
        {qr.developmentPlan && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <CardTitle className="text-lg">Development Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{qr.developmentPlan}</p>
            </CardContent>
          </Card>
        )}

        {/* Next Quarter Goals */}
        {qr.nextQuarterGoals && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Quarter Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{qr.nextQuarterGoals}</p>
            </CardContent>
          </Card>
        )}

        {/* Follow-up Date */}
        {qr.followUpDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{formatDate(qr.followUpDate)}</p>
            </CardContent>
          </Card>
        )}

        {/* Compensation */}
        {qr.compensationFlag && (
          <Card className="border-l-4 border-l-green-500 bg-green-50">
            <CardHeader>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <CardTitle className="text-lg text-green-900">Flagged for Compensation Review</CardTitle>
              </div>
            </CardHeader>
            {qr.compensationNotes && (
              <CardContent>
                <p className="text-sm whitespace-pre-wrap text-green-800">{qr.compensationNotes}</p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Employee Reflection */}
        {review.reflection && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Employee Reflection</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted on {formatDate(review.reflection.submittedAt)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{review.reflection.reflectionText}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
