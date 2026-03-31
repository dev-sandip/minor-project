import { Client } from "pg";
import { EventEmitter } from "events";

// Define payload type (adjust as needed)
export interface VehicleEvent {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  data: unknown;
}

// Singleton Event Bus
class VehicleEventBus extends EventEmitter {}
export const vehicleEventBus = new VehicleEventBus();
vehicleEventBus.setMaxListeners(200);

let listenerClient: Client | null = null;
let isConnecting = false;

export async function startVehicleListener() {
  if (listenerClient || isConnecting) return;

  isConnecting = true;

  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    await client.query("LISTEN vehicle_events");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.on("notification", (msg: any) => {
      if (!msg.payload) return;

      try {
        const data: VehicleEvent = JSON.parse(msg.payload as string);
        vehicleEventBus.emit("vehicle", data);
      } catch {
        console.error("Invalid payload:", msg.payload);
      }
    });

    client.on("error", (err:unknown) => {
      console.error("PG listener error:", (err as Error).message);
      cleanupAndReconnect();
    });

    client.on("end", () => {
      console.warn("PG listener ended");
      cleanupAndReconnect();
    });

    listenerClient = client;
    console.log("Vehicle listener started");
  } catch (err:unknown) {
    console.error("Failed to start listener:", (err as Error).message);
    cleanupAndReconnect();
  } finally {
    isConnecting = false;
  }
}

function cleanupAndReconnect() {
  if (listenerClient) {
    listenerClient.removeAllListeners();
    listenerClient = null;
  }

  setTimeout(() => {
    startVehicleListener();
  }, 3000);
}

// Optional: graceful shutdown
export async function stopVehicleListener() {
  if (listenerClient) {
    await listenerClient.end();
    listenerClient = null;
  }
}