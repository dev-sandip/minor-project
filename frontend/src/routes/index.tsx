import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Parking Admin
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Simple, real-time billing for Nepali license plates.
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track entries and exits for Nepali number plates in Devanagari,
            calculate charges instantly, and keep your parking operations under
            control with a clean, focused dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" variant="outline">
              View dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
