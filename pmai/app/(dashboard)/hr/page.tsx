'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RatingBadge } from '@/components/rating-badge'
import { useToast } from '@/components/ui/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Employee {
  id: string
  name: string
  email: string
  manager?: { name: string }
}

interface RatingDistribution {
  [key: number]: number
}

export default function HRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [ratings, setRatings] = useState<RatingDistribution>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, quarterlyRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/quarterly'),
        ])

        if (empRes.ok && quarterlyRes.ok) {
          const empData = await empRes.json()
          const quarterlyData = await quarterlyRes.json()

          setEmployees(empData)

          // Calculate rating distribution
          const ratingDist: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

          const latestRatings = new Map<string, number>()
          quarterlyData.forEach((q: any) => {
            if (q.quarterlyReview && !latestRatings.has(q.employeeId)) {
              latestRatings.set(q.employeeId, q.quarterlyReview.overallRating)
            }
          })

          latestRatings.forEach((rating) => {
            if (rating >= 1 && rating <= 5) {
              ratingDist[rating]++
            }
          })

          setRatings(ratingDist)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load data',
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

  const chartData = [
    { rating: '1 - Exceptional', count: ratings[1] || 0 },
    { rating: '2 - Exceeds', count: ratings[2] || 0 },
    { rating: '3 - Meets', count: ratings[3] || 0 },
    { rating: '4 - Below', count: ratings[4] || 0 },
    { rating: '5 - Improvement', count: ratings[5] || 0 },
  ]

  const totalRatings = Object.values(ratings).reduce((a, b) => a + b, 0)

  return (
    <div>
      <PageHeader
        title="HR Dashboard"
        description="Organization-wide performance metrics and calibration"
      />

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">With Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRatings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalRatings > 0 ? `${Math.round((totalRatings / employees.length) * 100)}% coverage` : '0%'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Flagged for Adjustment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Compensation reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1B4F72" name="Number of Employees" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left font-semibold py-3 px-4">Employee</th>
                    <th className="text-left font-semibold py-3 px-4">Email</th>
                    <th className="text-left font-semibold py-3 px-4">Manager</th>
                    <th className="text-left font-semibold py-3 px-4">Latest Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{emp.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{emp.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{emp.manager?.name || '-'}</td>
                      <td className="py-3 px-4">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
