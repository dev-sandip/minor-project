import { getPlateServiceUrl } from '@/lib/parking-config'

/**
 * Call the hosted plate extraction service with multipart/form-data (image file).
 * Expects response with Nepali license plate text, e.g. { "plate": "नेपाल १२३" } or { "number": "..." }.
 */
export async function extractPlateFromImage(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const url = getPlateServiceUrl()
  const form = new FormData()
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  form.append('image', blob, fileName)

  const res = await fetch(url, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Plate service error ${res.status}: ${text}`)
  }

  const json = (await res.json()) as Record<string, unknown>
  const plate =
    typeof json.plate === 'string'
      ? json.plate
      : typeof json.number === 'string'
        ? json.number
        : typeof json.vehicleNumber === 'string'
          ? json.vehicleNumber
          : typeof json.text === 'string'
            ? json.text
            : null

  if (!plate?.trim()) {
    throw new Error('Plate service did not return a plate number')
  }
  return plate.trim()
}
