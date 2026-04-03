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
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  email: string
}

export default function NewMonthlyMeetingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState(searchParams.get('employeeId') || '')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    meetingDate: new Date().toISOString().split('T')[0],
    employeeMITs: '',
    doneWell: '',
    doneWellValues: [] as string[],
    doDifferently: '',
    doDiffValues: [] as string[],
    feedbackExchange: '',
    supportAlignment: '',
    nextMITs: '',
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
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [toast])

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

    setSubmitting(true)
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          ...formData,
        }),
      })

      if (res.ok) {
        const meeting = await res.json()
        toast({
          title: 'Success',
          description: 'Meeting created successfully',
        })
        router.push(`/manager/meetings/${meeting.id}`)
      } else {
        throw new Error('Failed to create meeting')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create meeting',
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
        title="Create Monthly Meeting"
        description="Document a 1:1 performance discussion"
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
            <CardTitle className="text-lg">Meeting Date</CardTitle>
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

        {/* Employee MITs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee MITs</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="mits" className="mb-2 block">
              Most Important Things (what they're working on)
            </Label>
            <Textarea
              id="mits"
              placeholder="e.g., Complete Q1 roadmap, interview new designers..."
              value={formData.employeeMITs}
              onChange={(e) => handleChange('employeeMITs', e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Done Well */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What They Did Well</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="doneWell" className="mb-2 block">
                Feedback
              </Label>
              <Textarea
                id="doneWell"
                placeholder="Describe positive contributions and strengths..."
                value={formData.doneWell}
                onChange={(e) => handleChange('doneWell', e.target.value)}
                className="min-h-24"
              />
            </div>
            <div>
              <Label className="mb-3 block">Associated Values</Label>
              <ValueSelector
                selected={formData.doneWellValues}
                onChange={(values) => handleChange('doneWellValues', values)}
                maxSelection={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Do Differently */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What To Do Differently</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="doDiff" className="mb-2 block">
                Feedback
              </Label>
              <Textarea
                id="doDiff"
                placeholder="Describe growth areas and improvement opportunities..."
                value={formData.doDifferently}
                onChange={(e) => handleChange('doDifferently', e.target.value)}
                className="min-h-24"
              />
            </div>
            <div>
              <Label className="mb-3 block">Associated Values</Label>
              <ValueSelector
                selected={formData.doDiffValues}
                onChange={(values) => handleChange('doDiffValues', values)}
                maxSelection={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback Exchange */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feedback Exchange</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="feedback" className="mb-2 block">
              Notes from discussion
            </Label>
            <Textarea
              id="feedback"
              placeholder="Feedback shared during the conversation..."
              value={formData.feedbackExchange}
              onChange={(e) => handleChange('feedbackExchange', e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Support & Alignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support & Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="support" className="mb-2 block">
              How can we support you? Team alignment notes?
            </Label>
            <Textarea
              id="support"
              placeholder="Support offered, alignment concerns, coaching notes..."
              value={formData.supportAlignment}
              onChange={(e) => handleChange('supportAlignment', e.target.value)}
              className="min-h-24"
            />
          </CardContent>
        </Card>

        {/* Next MITs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next MITs</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="nextMits" className="mb-2 block">
              Next priorities and action items
            </Label>
            <Textarea
              id="nextMits"
              placeholder="What will they focus on next month..."
              value={formData.nextMITs}
              onChange={(e) => handleChange('nextMITs', e.target.value)}
              className="min-h-24"
            />
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
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Meeting'}
          </Button>
        </div>
      </form>
    </div>
  )
}
