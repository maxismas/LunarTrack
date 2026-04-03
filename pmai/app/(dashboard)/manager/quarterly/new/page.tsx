'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ValueSelector } from '@/components/value-selector'
import { RatingBadge } from '@/components/rating-badge'
import { useToast } from '@/components/ui/use-toast'
import { calculateOverallRating } from '@/lib/utils'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  email: string
}

const RATINGS = [
  { value: 1, label: 'Exceptional' },
  { value: 2, label: 'Exceeds' },
  { value: 3, label: 'Meets' },
  { value: 4, label: 'Below' },
  { value: 5, label: 'Improvement Needed' },
]

export default function NewQuarterlyReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState(searchParams.get('employeeId') || '')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    meetingDate: new Date().toISOString().split('T')[0],
    masteryRating: 3,
    masteryDoneWell: '',
    masteryDoBetter: '',
    objectivesRating: 3,
    objectivesDoneWell: '',
    objectivesDoBetter: '',
    behavioursRating: 3,
    behavioursValues: [] as string[],
    behavioursDoneWell: '',
    behavioursDoBetter: '',
    overallRating: 3,
    overallRatingOverride: false,
    overallRatingJustification: '',
    finalComments: '',
    followUpDate: '',
    nextQuarterGoals: '',
    developmentPlan: '',
    compensationFlag: false,
    compensationNotes: '',
  })

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees')
        if (res.ok) {
          const data = await res.json()
          setEmployees(data)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load employees',
          variant: 'destructive',
        })
      }
    }

    fetchEmployees()
  }, [toast])

  const calculatedRating = calculateOverallRating(
    formData.masteryRating,
    formData.objectivesRating,
    formData.behavioursRating
  )

  const needsDevelopmentPlan = calculatedRating >= 4

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEmployee) {
      toast({
        title: 'Error',
        description: 'Please select an employee',
        variant: 'destructive',
      })
      return
    }

    if (needsDevelopmentPlan && !formData.developmentPlan.trim()) {
      toast({
        title: 'Error',
        description: 'Development plan is required for ratings 4 or 5',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quarterly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          ...formData,
          overallRating: formData.overallRatingOverride ? formData.overallRating : calculatedRating,
        }),
      })

      if (res.ok) {
        const review = await res.json()
        toast({
          title: 'Success',
          description: 'Quarterly review created successfully',
        })
        router.push(`/manager/quarterly/${review.id}`)
      } else {
        throw new Error('Failed to create review')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create review',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div>
      <Link href="/manager">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>

      <PageHeader
        title="Create Quarterly Review"
        description="Comprehensive performance evaluation across three dimensions"
      />

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="employee" className="mb-2 block">
              Select Employee
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Choose an employee..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Meeting Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="date" className="mb-2 block">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.meetingDate}
              onChange={(e) => handleChange('meetingDate', e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* Dimension 1: Mastery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimension 1: Mastery</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Technical skills, expertise, and professional growth
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="masteryRating" className="mb-2 block">
                Rating
              </Label>
              <Select
                value={String(formData.masteryRating)}
                onValueChange={(v) => handleChange('masteryRating', parseInt(v))}
              >
                <SelectTrigger id="masteryRating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATINGS.map((r) => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {r.value}. {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="masteryWell" className="mb-2 block">
                Done Well
              </Label>
              <Textarea
                id="masteryWell"
                value={formData.masteryDoneWell}
                onChange={(e) => handleChange('masteryDoneWell', e.target.value)}
                className="min-h-20"
              />
            </div>
            <div>
              <Label htmlFor="masteryBetter" className="mb-2 block">
                Do Better
              </Label>
              <Textarea
                id="masteryBetter"
                value={formData.masteryDoBetter}
                onChange={(e) => handleChange('masteryDoBetter', e.target.value)}
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dimension 2: Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimension 2: Objectives</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Goal achievement and delivery of results
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="objectivesRating" className="mb-2 block">
                Rating
              </Label>
              <Select
                value={String(formData.objectivesRating)}
                onValueChange={(v) => handleChange('objectivesRating', parseInt(v))}
              >
                <SelectTrigger id="objectivesRating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATINGS.map((r) => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {r.value}. {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="objectivesWell" className="mb-2 block">
                Done Well
              </Label>
              <Textarea
                id="objectivesWell"
                value={formData.objectivesDoneWell}
                onChange={(e) => handleChange('objectivesDoneWell', e.target.value)}
                className="min-h-20"
              />
            </div>
            <div>
              <Label htmlFor="objectivesBetter" className="mb-2 block">
                Do Better
              </Label>
              <Textarea
                id="objectivesBetter"
                value={formData.objectivesDoBetter}
                onChange={(e) => handleChange('objectivesDoBetter', e.target.value)}
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dimension 3: Behaviours & Values */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimension 3: Behaviours & Values</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Living Lunar Rails values and team collaboration
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="behavioursRating" className="mb-2 block">
                Rating
              </Label>
              <Select
                value={String(formData.behavioursRating)}
                onValueChange={(v) => handleChange('behavioursRating', parseInt(v))}
              >
                <SelectTrigger id="behavioursRating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATINGS.map((r) => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {r.value}. {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-3 block">Values Demonstrated</Label>
              <ValueSelector
                selected={formData.behavioursValues}
                onChange={(values) => handleChange('behavioursValues', values)}
                maxSelection={6}
              />
            </div>
            <div>
              <Label htmlFor="behavioursWell" className="mb-2 block">
                Done Well
              </Label>
              <Textarea
                id="behavioursWell"
                value={formData.behavioursDoneWell}
                onChange={(e) => handleChange('behavioursDoneWell', e.target.value)}
                className="min-h-20"
              />
            </div>
            <div>
              <Label htmlFor="behavioursBetter" className="mb-2 block">
                Do Better
              </Label>
              <Textarea
                id="behavioursBetter"
                value={formData.behavioursDoBetter}
                onChange={(e) => handleChange('behavioursDoBetter', e.target.value)}
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Overall Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Auto-calculated from three dimensions:</p>
                <RatingBadge rating={calculatedRating} size="lg" />
              </div>
              <div className="text-sm">
                <p>({formData.masteryRating} + {formData.objectivesRating} + {formData.behavioursRating}) / 3</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="override"
                checked={formData.overallRatingOverride}
                onChange={(e) => handleChange('overallRatingOverride', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="override">Override Overall Rating</Label>
            </div>

            {formData.overallRatingOverride && (
              <div>
                <Label htmlFor="overallRating" className="mb-2 block">
                  Override Value
                </Label>
                <Select
                  value={String(formData.overallRating)}
                  onValueChange={(v) => handleChange('overallRating', parseInt(v))}
                >
                  <SelectTrigger id="overallRating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATINGS.map((r) => (
                      <SelectItem key={r.value} value={String(r.value)}>
                        {r.value}. {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="justification" className="mt-3 mb-2 block">
                  Justification
                </Label>
                <Textarea
                  id="justification"
                  value={formData.overallRatingJustification}
                  onChange={(e) => handleChange('overallRatingJustification', e.target.value)}
                  className="min-h-20"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Development Plan Alert */}
        {needsDevelopmentPlan && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <CardTitle className="text-base text-amber-900">Development Plan Required</CardTitle>
                  <p className="text-sm text-amber-700 mt-1">
                    A development plan is required for overall ratings of 4 (Below) or 5 (Improvement Needed)
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Final Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Final Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Overall summary and key takeaways..."
              value={formData.finalComments}
              onChange={(e) => handleChange('finalComments', e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Follow-up */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Follow-up & Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="followUp" className="mb-2 block">
                Follow-up Date
              </Label>
              <Input
                id="followUp"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleChange('followUpDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goals" className="mb-2 block">
                Next Quarter Goals
              </Label>
              <Textarea
                id="goals"
                placeholder="Key objectives for the next quarter..."
                value={formData.nextQuarterGoals}
                onChange={(e) => handleChange('nextQuarterGoals', e.target.value)}
                className="min-h-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Development Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Development Plan</CardTitle>
            {needsDevelopmentPlan && <p className="text-sm text-amber-600 mt-2">Required for this rating</p>}
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="1. Priority skill development
2. Training or coaching needed
3. Timeline and success metrics..."
              value={formData.developmentPlan}
              onChange={(e) => handleChange('developmentPlan', e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compFlag"
                checked={formData.compensationFlag}
                onChange={(e) => handleChange('compensationFlag', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="compFlag">Flag for compensation review</Label>
            </div>
            {formData.compensationFlag && (
              <div>
                <Label htmlFor="compNotes" className="mb-2 block">
                  Notes
                </Label>
                <Textarea
                  id="compNotes"
                  placeholder="Compensation notes..."
                  value={formData.compensationNotes}
                  onChange={(e) => handleChange('compensationNotes', e.target.value)}
                  className="min-h-20"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-2 justify-end">
          <Link href="/manager">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            type="submit"
            className="bg-lunar-navy hover:bg-lunar-navy-dark"
            disabled={submitting || (needsDevelopmentPlan && !formData.developmentPlan.trim())}
          >
            {submitting ? 'Creating...' : 'Create Review'}
          </Button>
        </div>
      </form>
    </div>
  )
}
