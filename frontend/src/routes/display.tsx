import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Vehicle } from '@/lib/api/vehicle'
import { useVehicleStream } from '@/lib/hooks/use-vehicle-stream'

export const Route = createFileRoute('/display')({
  component: DisplayPage,
})

function DisplayPage() {
  const { vehicles, status } = useVehicleStream({ max: 100 })
  const isLoading = status === 'connecting' || status === 'idle'
  const isError = status === 'error'

  const latest = getLatestEvent(vehicles)
  const isExit = latest?.type === 'exit'
  const timeText = latest
    ? new Date(latest.time).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-4xl grid gap-6 md:grid-cols-[2fr_1fr] items-stretch">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium">
                Parking lot display
              </CardTitle>
              <Badge variant={isExit ? 'secondary' : 'default'}>
                {isExit ? 'EXIT' : 'ENTRY'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Waiting for latest event…</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Unable to connect to live updates.
                </p>
                <p className="text-xs text-muted-foreground">
                  Ensure the backend SSE endpoint is available at <span className="font-mono">/api/vehicles/stream</span>.
                </p>
              </div>
            ) : latest ? (
              <>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Vehicle</p>
              <p className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                {latest.licensePlate}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {isExit ? 'Exit message' : 'Entry message'}
              </p>
              <p className="text-base md:text-lg text-foreground">
                {isExit
                  ? `Entered parking lot at ${timeText}. Please pay your bill below.`
                  : `Entered parking lot at ${timeText}.`}
              </p>
            </div>
            {isExit && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total amount</p>
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  Rs. {Number(latest.totalAmount ?? 0).toLocaleString()}
                </p>
              </div>
            )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No recent entry/exit yet.</p>
            )}
          </CardContent>
        </Card>

        {isExit && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pay via QR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-square w-full rounded border border-border bg-card flex items-center justify-center p-3">
                <img
                  src={STATIC_BANK_QR_DATA_URL}
                  alt="Bank QR"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Scan the QR to pay to our bank account. Keep the receipt until you
                exit the gate.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Static placeholder QR (replace with your real bank QR image/data URL)
const STATIC_BANK_QR_DATA_URL ='/qr.png'

type LatestEvent =
  | (Vehicle & { type: 'entry'; time: string })
  | (Vehicle & { type: 'exit'; time: string })

function getLatestEvent(vehicles: Vehicle[]): LatestEvent | null {
  let best: LatestEvent | null = null

  for (const v of vehicles) {
    const entryTime = v.entryTime ? new Date(v.entryTime).getTime() : 0
    const exitTime = v.exitTime ? new Date(v.exitTime).getTime() : 0
    const isExit = exitTime > entryTime

    const candidate: LatestEvent = isExit
      ? ({ ...v, type: 'exit', time: v.exitTime! } as const)
      : ({ ...v, type: 'entry', time: v.entryTime } as const)

    const candidateTime = new Date(candidate.time).getTime()
    const bestTime = best ? new Date(best.time).getTime() : -1
    if (candidateTime > bestTime) best = candidate
  }

  return best
}
