/**
 * Dummy parking data for UI demo. Replace with API calls when backend is ready.
 */

import { createServerFn } from '@tanstack/react-start'

export type DashboardStats = {
  carsParked: number
  remainingPlaces: number
  totalEarnings: string
}

const DUMMY_STATS: DashboardStats = {
  carsParked: 3,
  remainingPlaces: 47,
  totalEarnings: '1250',
}

const DUMMY_PARKED: VehicleRow[] = [
  {
    id: '1',
    vehicleNumber: 'नेपाल १२३',
    imageUrl: 'https://via.placeholder.com/100',
    entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    exitTime: null,
    parkingCost: '0',
  },
  {
    id: '2',
    vehicleNumber: 'नेपाल ४५६',
    imageUrl: 'https://via.placeholder.com/100',
    entryTime: new Date(Date.now() - 45 * 60 * 1000),
    exitTime: null,
    parkingCost: '0',
  },
]

const DUMMY_RECENT: VehicleRow[] = [
  {
    id: '3',
    vehicleNumber: 'नेपाल ७८९',
    imageUrl: 'https://via.placeholder.com/100',
    entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    exitTime: new Date(Date.now() - 30 * 60 * 1000),
    parkingCost: '250',
  },
  {
    id: '4',
    vehicleNumber: 'नेपाल ०१२',
    imageUrl: 'https://via.placeholder.com/100',
    entryTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    exitTime: new Date(Date.now() - 20 * 60 * 60 * 1000),
    parkingCost: '500',
  },
]

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardStats> => {
    return DUMMY_STATS
  }
)

export function calculateParkingCost(
  entryTime: Date,
  exitTime: Date,
  ratePerHour: number
): number {
  const ms = exitTime.getTime() - entryTime.getTime()
  const hours = Math.max(0, ms / (1000 * 60 * 60))
  return Math.round(hours * ratePerHour * 100) / 100
}

export function getRatePerHour(): number {
  return 50
}

export type VehicleEntryResult = {
  id: string
  vehicleNumber: string
  imageUrl: string
}

export const registerVehicleEntry = createServerFn({ method: 'POST' })
  .inputValidator((input: { data: FormData }) => input.data as FormData)
  .handler(async ({ data }: { data: FormData }): Promise<VehicleEntryResult> => {
    const file = data.get('image')
    if (!file || !(file instanceof File)) {
      throw new Error('Image file is required')
    }
    // Dummy: no upload, return fake success. Replace with API call later.
    const id = crypto.randomUUID()
    const vehicleNumber = `DEMO-${id.slice(0, 8)}`
    const imageUrl = 'https://via.placeholder.com/100'
    return { id, vehicleNumber, imageUrl }
  })

export type VehicleExitResult = {
  id: string
  vehicleNumber: string
  parkingCost: string
  exitTime: Date
}

export const processVehicleExit = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    if (typeof data !== 'object' || data == null) throw new Error('Invalid input')
    const o = data as Record<string, unknown>
    const plate = o.vehicleNumber ?? o.plate
    if (typeof plate !== 'string' || !plate.trim()) {
      throw new Error('Vehicle number (license plate) is required')
    }
    return { vehicleNumber: plate.trim() }
  })
  .handler(async ({ data }): Promise<VehicleExitResult> => {
    // Dummy: always return success. Replace with API call later.
    return {
      id: crypto.randomUUID(),
      vehicleNumber: data.vehicleNumber,
      parkingCost: '150.00',
      exitTime: new Date(),
    }
  })

export type VehicleRow = {
  id: string
  vehicleNumber: string
  imageUrl: string
  entryTime: Date
  exitTime: Date | null
  parkingCost: string
}

export const getCurrentlyParkedVehicles = createServerFn({ method: 'GET' }).handler(
  async (): Promise<VehicleRow[]> => DUMMY_PARKED
)

export const getRecentVehicles = createServerFn({ method: 'GET' }).handler(
  async (): Promise<VehicleRow[]> => DUMMY_RECENT
)
