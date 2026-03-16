import { apiClient } from '@/config/axios-config'
import { API_ENDPOINTS } from '@/config/api-endpoints'

export interface ConfidenceStats {
  mean: number
  min: number
  max: number
  std: number
}

export interface Vehicle {
  id: string
  licensePlate: string
  entryTime: string
  exitTime: string | null
  imageUrl: string | null
  imageKey: string | null
  vehicleType: string | null
  confidence: ConfidenceStats | null
  totalAmount: string | null
}

type VehicleResponse = { data: Vehicle }
type VehiclesListResponse = { data: Vehicle[] }

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await apiClient.get<VehiclesListResponse>(
    API_ENDPOINTS.VEHICLE.LIST,
  )
  return data.data
}

export async function createVehicleEntry(file: File): Promise<Vehicle> {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await apiClient.post<VehicleResponse>(
    API_ENDPOINTS.VEHICLE.ENTRY,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function exitVehicle(file: File): Promise<Vehicle> {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await apiClient.post<VehicleResponse>(
    API_ENDPOINTS.VEHICLE.EXIT,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return data.data
}
