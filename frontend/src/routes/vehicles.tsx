import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchVehicles, type Vehicle } from '@/lib/api/vehicle'

export const Route = createFileRoute('/vehicles')({
  component: VehiclesPage,
})

function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>All vehicle records</CardTitle>
          <CardDescription>
            Entry and exit history with billing for all detected Nepali plates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading vehicles…</p>
          ) : vehicles.length === 0 ? (
            <p className="text-xs text-muted-foreground">No vehicles recorded yet.</p>
          ) : (
            <VehiclesTable vehicles={vehicles} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function VehiclesTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 font-medium">Image</th>
            <th className="text-left py-2 font-medium">Plate</th>
            <th className="text-left py-2 font-medium">Type</th>
            <th className="text-left py-2 font-medium">Entry time</th>
            <th className="text-left py-2 font-medium">Exit time</th>
            <th className="text-left py-2 font-medium">Amount</th>
            <th className="text-left py-2 font-medium">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-b border-border/50">
              <td className="py-1.5">
                {v.imageUrl ? (
                  <img
                    src={v.imageUrl}
                    alt={v.licensePlate}
                    className="h-10 w-16 rounded border border-border object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">No image</span>
                )}
              </td>
              <td className="py-1.5">{v.licensePlate}</td>
              <td className="py-1.5 text-muted-foreground">
                {v.vehicleType ?? '—'}
              </td>
              <td className="py-1.5 text-muted-foreground">
                {formatDate(v.entryTime)}
              </td>
              <td className="py-1.5 text-muted-foreground">
                {v.exitTime ? formatDate(v.exitTime) : '—'}
              </td>
              <td className="py-1.5 text-foreground">
                {v.totalAmount ? `Rs. ${Number(v.totalAmount).toLocaleString()}` : '—'}
              </td>
              <td className="py-1.5 text-muted-foreground">
                {v.confidence ? `${(v.confidence.mean * 100).toFixed(1)}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatDate(d: string | Date | null): string {
  if (!d) return ''
  const x = d instanceof Date ? d : new Date(d)
  return x.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

