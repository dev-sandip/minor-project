import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters').optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  PARKING_TOTAL_CAPACITY: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(1, parseInt(v, 10) || 50) : 50)),
  PARKING_RATE_PER_HOUR: z
    .string()
    .optional()
    .transform((v) => (v ? Math.max(0, parseFloat(v) || 50) : 50)),
  PLATE_SERVICE_URL: z.string().url().optional(),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1).optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    PARKING_TOTAL_CAPACITY: process.env.PARKING_TOTAL_CAPACITY,
    PARKING_RATE_PER_HOUR: process.env.PARKING_RATE_PER_HOUR,
    PLATE_SERVICE_URL: process.env.PLATE_SERVICE_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY?.trim(),
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY?.trim(),
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT?.trim(),
  })
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors
    throw new Error(`Invalid env: ${JSON.stringify(msg)}`)
  }
  return parsed.data
}

let cached: Env | null = null

/** Type-safe env; validates once. Throws if required vars (e.g. DATABASE_URL) are missing. */
export function getEnv(): Env {
  if (cached) return cached
  cached = loadEnv()
  return cached
}

/** ImageKit config; throws if any key is missing. */
export type ImageKitEnv = {
  publicKey: string
  privateKey: string
  urlEndpoint: string
}

export function getImageKitEnv(): ImageKitEnv {
  const env = getEnv()
  if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error(
      'IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT are required for image upload'
    )
  }
  return {
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  }
}

export function hasImageKitEnv(): boolean {
  try {
    const e = getEnv()
    return !!(e.IMAGEKIT_PUBLIC_KEY && e.IMAGEKIT_PRIVATE_KEY && e.IMAGEKIT_URL_ENDPOINT)
  } catch {
    return false
  }
}
