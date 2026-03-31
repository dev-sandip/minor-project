import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createVehicleEntry, exitVehicle } from '@/lib/api/vehicle'
import { getApiErrorMessage } from '@/lib/api/error-message'

export const Route = createFileRoute('/simulation')({
  component: SimulationPage,
})

function SimulationPage() {
  const queryClient = useQueryClient()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [, setCameraError] = useState<string | null>(null)

  const entryMutation = useMutation({
    mutationFn: createVehicleEntry,
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(
        `Entry recorded: ${vehicle.licensePlate} @ ${new Date(
          vehicle.entryTime,
        ).toLocaleTimeString()}`,
      )
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) ?? 'Could not record entry.')
    },
  })

  const exitMutation = useMutation({
    mutationFn: exitVehicle,
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(
        `Exit recorded: ${vehicle.licensePlate} charged Rs. ${
          vehicle.totalAmount ?? '0.00'
        }`,
      )
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) ?? 'Could not record exit.')
    },
  })

  useEffect(() => {
    void startCamera()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCamera = async () => {
    try {
      setCameraError(null)
      stream?.getTracks().forEach((t) => t.stop())
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setStream(media)
      if (videoRef.current) videoRef.current.srcObject = media
      await Promise.allSettled([videoRef.current?.play()])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to access camera'
      setCameraError(message)
      toast.error(message)
    }
  }

  const captureFrameAsFile = async (
    videoEl: HTMLVideoElement | null,
  ): Promise<File | null> => {
    if (!videoEl || !canvasRef.current) return null
    const video = videoEl
    const canvas = canvasRef.current
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return null
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, width, height)
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(null)
          const file = new File([blob], `plate-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          resolve(file)
        },
        'image/jpeg',
        0.9,
      )
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-medium text-foreground">Simulation lab</h1>
        <p className="text-xs text-muted-foreground">
          Simulate real-time parking by capturing Nepali license plate images for entry
          and exit. Camera integration will plug into the same flow later.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <Card className="border-border sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live camera</CardTitle>
            <CardDescription>
              Single shared camera preview for both entry and exit captures.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <video
              ref={videoRef}
              className="mx-auto w-full max-w-sm aspect-video rounded border border-border bg-black object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
              >
                Reconnect camera
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Simulate entry</CardTitle>
            <CardDescription>
              Keep the camera open and capture a plate image to record an entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Capture from live camera</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={entryMutation.isPending || !stream}
                onClick={async () => {
                  const file = await captureFrameAsFile(videoRef.current)
                  if (!file) return
                  await entryMutation.mutateAsync(file)
                }}
              >
                {entryMutation.isPending ? 'Capturing…' : 'Capture (Entry)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Simulate exit</CardTitle>
            <CardDescription>
              Use another capture of the same vehicle to simulate exit and billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Capture from live camera</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={exitMutation.isPending || !stream}
                onClick={async () => {
                  const file = await captureFrameAsFile(videoRef.current)
                  if (!file) return
                  await exitMutation.mutateAsync(file)
                }}
              >
                {exitMutation.isPending ? 'Capturing…' : 'Capture (Exit)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

