import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  createVehicleEntry,
  exitVehicle,
  fetchVehicles,
  type Vehicle,
} from '@/lib/api/vehicle'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const queryClient = useQueryClient()

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  })

  const [entryError, setEntryError] = useState('')
  const [exitError, setExitError] = useState('')
  const [exitSuccess, setExitSuccess] = useState<string | null>(null)

  const stats = useMemo(() => {
    const capacity = 50
    const carsParked = vehicles.filter((v) => !v.exitTime).length
    const totalEarnings = vehicles
      .filter((v) => v.exitTime)
      .reduce(
        (sum, v) => sum + (Number(v.totalAmount ?? 0) || 0),
        0,
      )
      .toFixed(2)
    const remainingPlaces = Math.max(0, capacity - carsParked)
    return { carsParked, remainingPlaces, totalEarnings }
  }, [vehicles])

  const parked = useMemo(
    () => vehicles.filter((v) => !v.exitTime),
    [vehicles],
  )

  const recent = useMemo(
    () =>
      vehicles
        .filter((v) => v.exitTime)
        .sort(
          (a, b) =>
            new Date(b.exitTime ?? '').getTime() -
            new Date(a.exitTime ?? '').getTime(),
        )
        .slice(0, 50),
    [vehicles],
  )

  const entryMutation = useMutation({
    mutationFn: createVehicleEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  const exitMutation = useMutation({
    mutationFn: exitVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  const onEntrySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEntryError('')
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input?.files?.length) {
      setEntryError('Select an image')
      return
    }
    try {
      const file = input.files[0]
      await entryMutation.mutateAsync(file)
      form.reset()
    } catch (err) {
      setEntryError(err instanceof Error ? err.message : 'Entry failed')
    }
  }

  const onExitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setExitError('')
    setExitSuccess(null)
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input?.files?.length) {
      setExitError('Select an image')
      return
    }
    try {
      const file = input.files[0]
      const result = await exitMutation.mutateAsync(file)
      setExitSuccess(`Rs. ${result.totalAmount ?? '0.00'} collected.`)
      form.reset()
    } catch (err) {
      setExitError(err instanceof Error ? err.message : 'Exit failed')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of parking lot status and earnings. 
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
                {isLoading ? '…' : stats.carsParked}
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
                {isLoading ? '…' : stats.remainingPlaces}
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
                {isLoading
                  ? '…'
                  : `Rs. ${Number(stats.totalEarnings).toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle entry</CardTitle>
              <CardDescription>
                Upload vehicle image to detect plate and register entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onEntrySubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="entry-image">Entry image</Label>
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
                <Button
                  type="submit"
                  disabled={entryMutation.isPending}
                  size="sm"
                >
                  {entryMutation.isPending ? 'Registering…' : 'Register entry'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle exit</CardTitle>
              <CardDescription>
                Upload vehicle image to detect plate and record exit with billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onExitSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="exit-image">Exit image</Label>
                  <Input
                    id="exit-image"
                    type="file"
                    accept="image/*"
                    required
                    className="text-xs"
                  />
                </div>
                {exitError && (
                  <p className="text-xs text-destructive">{exitError}</p>
                )}
                {exitSuccess && (
                  <p className="text-xs text-foreground">{exitSuccess}</p>
                )}
                <Button
                  type="submit"
                  disabled={exitMutation.isPending}
                  size="sm"
                >
                  {exitMutation.isPending ? 'Processing…' : 'Process exit'}
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
  rows: Vehicle[]
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
              <td className="py-1.5">{r.licensePlate}</td>
              <td className="py-1.5 text-muted-foreground">
                {formatDate(new Date(r.entryTime))}
              </td>
              {showExitTime && (
                <td className="py-1.5 text-muted-foreground">
                  {r.exitTime ? formatDate(new Date(r.exitTime)) : '—'}
                </td>
              )}
              <td className="py-1.5 text-right">
                Rs. {Number(r.totalAmount ?? 0).toLocaleString()}
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
