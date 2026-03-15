import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { getThemeServerFn } from '@/lib/theme'
import { ThemeProvider } from '@/components/theme'
import { Toaster } from '@/components/ui/sonner'

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
  component: RootLayout,
})

function RootLayout() {
  // const navigate = useNavigate()

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await fetch('/api/auth/session')
  //       const session = await response.json()

  //       // If on root path and authenticated, go to dashboard
  //       if (session?.user && window.location.pathname === '/') {
  //         navigate({ to: '/', replace: true })
  //       }
  //       // If on root path and not authenticated, go to login
  //       else if (!session?.user && window.location.pathname === '/') {
  //         navigate({ to: '/login', replace: true })
  //       }
  //     } catch {
  //       // If not authenticated and on root, go to login
  //       if (window.location.pathname === '/') {
  //         navigate({ to: '/login', replace: true })
  //       }
  //     }
  //   }

  //   // checkAuth()
  // }, [])

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
        </body>
      </ThemeProvider>
    </html>
  )
}
