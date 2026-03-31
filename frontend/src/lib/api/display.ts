import { apiClient } from '@/config/axios-config'
import { API_ENDPOINTS } from '@/config/api-endpoints'
import type { Vehicle } from '@/lib/api/vehicle'

export type DisplayEventType = 'entry' | 'exit'

export interface DisplayLatestEvent {
  type: DisplayEventType
  vehicle: Vehicle
  time: string
}

type LatestResponseA = { data: DisplayLatestEvent }
type LatestResponseB = { data: Vehicle }

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

export async function fetchLatestDisplayEvent(): Promise<DisplayLatestEvent | null> {
  const { data } = await apiClient.get<LatestResponseA | LatestResponseB>(
    API_ENDPOINTS.DISPLAY.LATEST,
  )

  // Accept either:
  // A) { data: { type, vehicle, time } }
  // B) { data: Vehicle } (infer type/time from entryTime/exitTime)
  const inner = (data as any)?.data as unknown
  if (!inner) return null

  if (isObject(inner) && 'vehicle' in inner && isObject((inner as any).vehicle)) {
    const e = inner as any
    const type = e.type === 'exit' ? 'exit' : 'entry'
    const vehicle = e.vehicle as Vehicle
    const time = typeof e.time === 'string'
      ? e.time
      : type === 'exit'
        ? vehicle.exitTime ?? vehicle.entryTime
        : vehicle.entryTime
    return { type, vehicle, time }
  }

  const vehicle = inner as Vehicle
  const exitTime = vehicle.exitTime ? new Date(vehicle.exitTime).getTime() : 0
  const entryTime = vehicle.entryTime ? new Date(vehicle.entryTime).getTime() : 0
  const type: DisplayEventType = exitTime > entryTime ? 'exit' : 'entry'
  const time = type === 'exit' ? vehicle.exitTime ?? vehicle.entryTime : vehicle.entryTime
  return { type, vehicle, time }
}

