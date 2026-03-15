import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getDashboardStats,
  getCurrentlyParkedVehicles,
  getRecentVehicles,
  registerVehicleEntry,
  processVehicleExit,
  type VehicleRow,
} from '@/data/parking'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const [stats, setStats] = useState<{
    carsParked: number
    remainingPlaces: number
    totalEarnings: string
  } | null>(null)
  const [parked, setParked] = useState<VehicleRow[]>([])
  const [recent, setRecent] = useState<VehicleRow[]>([])
  const [entryLoading, setEntryLoading] = useState(false)
  const [entryError, setEntryError] = useState('')
  const [exitPlate, setExitPlate] = useState('')
  const [exitLoading, setExitLoading] = useState(false)
  const [exitError, setExitError] = useState('')
  const [exitSuccess, setExitSuccess] = useState<string | null>(null)

  const refresh = useCallback(() => {
    getDashboardStats().then(setStats).catch(() => setStats(null))
    getCurrentlyParkedVehicles().then(setParked).catch(() => setParked([]))
    getRecentVehicles().then(setRecent).catch(() => setRecent([]))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const onEntrySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEntryError('')
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input?.files?.length) {
      setEntryError('Select an image')
      return
    }
    setEntryLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', input.files[0])
      await registerVehicleEntry({ data: { data: formData } })
      form.reset()
      refresh()
    } catch (err) {
      setEntryError(err instanceof Error ? err.message : 'Entry failed')
    } finally {
      setEntryLoading(false)
    }
  }

  const onExitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setExitError('')
    setExitSuccess(null)
    if (!exitPlate.trim()) {
      setExitError('Enter license plate')
      return
    }
    setExitLoading(true)
    try {
      const result = await processVehicleExit({
        data: { vehicleNumber: exitPlate.trim() },
      })
      setExitSuccess(`Rs. ${result.parkingCost} collected.`)
      setExitPlate('')
      refresh()
    } catch (err) {
      setExitError(err instanceof Error ? err.message : 'Exit failed')
    } finally {
      setExitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <h1 className="text-sm font-semibold text-foreground">
            Parking Billing System
          </h1>
          <span className="text-xs text-muted-foreground">Demo · dummy data</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of parking lot status and earnings. Data is dummy until API is integrated.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Cars parked
              </CardTitle>
              <CardDescription>Currently in lot</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {stats?.carsParked ?? '—'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining places
              </CardTitle>
              <CardDescription>Available spots</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {stats?.remainingPlaces ?? '—'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total earnings
              </CardTitle>
              <CardDescription>Completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {stats != null
                  ? `Rs. ${Number(stats.totalEarnings).toLocaleString()}`
                  : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle entry</CardTitle>
              <CardDescription>Upload plate image to register entry (demo only)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onEntrySubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="entry-image">Plate image</Label>
                  <Input
                    id="entry-image"
                    type="file"
                    accept="image/*"
                    required
                    className="text-xs"
                  />
                </div>
                {entryError && (
                  <p className="text-xs text-destructive">{entryError}</p>
                )}
                <Button type="submit" disabled={entryLoading} size="sm">
                  {entryLoading ? 'Registering…' : 'Register entry'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle exit</CardTitle>
              <CardDescription>Enter plate to compute and record exit (demo only)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onExitSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="exit-plate">License plate</Label>
                  <Input
                    id="exit-plate"
                    type="text"
                    value={exitPlate}
                    onChange={(e) => setExitPlate(e.target.value)}
                    placeholder="e.g. नेपाल १२३"
                    className="text-xs"
                  />
                </div>
                {exitError && (
                  <p className="text-xs text-destructive">{exitError}</p>
                )}
                {exitSuccess && (
                  <p className="text-xs text-foreground">{exitSuccess}</p>
                )}
                <Button type="submit" disabled={exitLoading} size="sm">
                  {exitLoading ? 'Processing…' : 'Process exit'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Currently parked
              </CardTitle>
              <CardDescription>Vehicles in lot</CardDescription>
            </CardHeader>
            <CardContent>
              <VehiclesTable rows={parked} showExitTime={false} />
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Recent exits
              </CardTitle>
              <CardDescription>Last 50 completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <VehiclesTable rows={recent} showExitTime={true} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function VehiclesTable({
  rows,
  showExitTime,
}: {
  rows: VehicleRow[]
  showExitTime: boolean
}) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No vehicles to show.</p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 font-medium">Plate</th>
            <th className="text-left py-2 font-medium">Entry</th>
            {showExitTime && (
              <th className="text-left py-2 font-medium">Exit</th>
            )}
            <th className="text-right py-2 font-medium">Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/50">
              <td className="py-1.5">{r.vehicleNumber}</td>
              <td className="py-1.5 text-muted-foreground">
                {formatDate(r.entryTime)}
              </td>
              {showExitTime && (
                <td className="py-1.5 text-muted-foreground">
                  {r.exitTime ? formatDate(r.exitTime) : '—'}
                </td>
              )}
              <td className="py-1.5 text-right">
                Rs. {Number(r.parkingCost).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatDate(d: Date): string {
  const x = d instanceof Date ? d : new Date(d)
  return x.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
