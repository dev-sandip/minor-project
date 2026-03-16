import {
  HeadContent,
  Outlet,
  Scripts,
  Link,
  createRootRoute,
  useNavigate,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { getThemeServerFn } from '@/lib/theme'
import { ThemeProvider } from '@/components/theme'
import { useTheme } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { fetchProfile, logout } from '@/lib/api/auth'
import { getCachedToken } from '@/lib/safe-storage'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Parking Admin - Real-Time Billing System',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  loader: () => getThemeServerFn(),
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
          404 · Not found
        </p>
        <p className="text-sm text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="text-xs text-foreground underline underline-offset-4">
          Go back home
        </Link>
      </div>
    </div>
  ),
  component: RootLayout,
})

function RootLayout() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()
  return (
    <html className={theme} lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <ThemeProvider theme={theme}>
        <body>
          <QueryClientProvider client={queryClient}>
            <AppHeader />
            {children}
            <Toaster richColors />
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <Scripts />
          </QueryClientProvider>
        </body>
      </ThemeProvider>
    </html>
  )
}

function AppHeader() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const hasToken = !!getCachedToken()
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  })

  const isDark = theme === 'dark'

  const handleLogout = () => {
    logout()
    navigate({ to: '/login', replace: true })
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="font-semibold text-foreground">
            Parking Billing System
          </Link>
          <Link to="/contact" className="hover:text-foreground">
                Team
              </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-3 text-muted-foreground">
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/vehicles" className="hover:text-foreground">
                Vehicles
              </Link>
              <Link to="/simulation" className="hover:text-foreground">
                Simulation
              </Link>
              
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <img
               src={user.imageUrl ?? ''}
               alt={user.name}
               className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs text-foreground">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {user.role}
                </span>
              </div>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => navigate({ to: '/login' })}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

