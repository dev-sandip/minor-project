/**
 * Parking billing config from validated env.
 */

import { getEnv, getImageKitEnv, hasImageKitEnv } from '@/lib/env'

export function getParkingTotalCapacity(): number {
  return getEnv().PARKING_TOTAL_CAPACITY
}

export function getParkingRatePerHour(): number {
  return getEnv().PARKING_RATE_PER_HOUR
}

export function getPlateServiceUrl(): string {
  const url = getEnv().PLATE_SERVICE_URL
  if (!url?.trim()) throw new Error('PLATE_SERVICE_URL is required for plate extraction')
  return url.trim()
}

export function getImageKitConfig(): ReturnType<typeof getImageKitEnv> {
  return getImageKitEnv()
}

export { hasImageKitEnv as hasImageKitConfig }
