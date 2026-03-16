## Learned User Preferences

- Prefers simple, professional UIs without loud gradients.
- Wants the app explicitly tailored to Nepali license plates in Devanagari.
- Favors strong type safety across the frontend (typed APIs, env, models).
- Uses TanStack Router and TanStack Query for routing and data fetching.
- Uses Bun as the package manager for this frontend.

## Learned Workspace Facts

- The frontend is a parking billing admin panel that talks to a separate backend defined by the provided OpenAPI spec.
- Authentication is via a JWT bearer token stored client-side and attached by an Axios interceptor.
- Vehicle entry and exit are handled by multipart form uploads where the file field name must be `image`.
- The backend returns vehicle records under a `data` key and uses `licensePlate` plus `totalAmount` fields for billing.
- The project uses a theme system with light/dark modes driven by `getThemeServerFn` and `ThemeProvider`.
