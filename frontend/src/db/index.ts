import { drizzle } from 'drizzle-orm/node-postgres'

import { getEnv } from '@/lib/env'
import * as schema from './schema.ts'

export const db = drizzle(getEnv().DATABASE_URL, { schema })
