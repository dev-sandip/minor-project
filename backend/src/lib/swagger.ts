import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ─── Security Scheme ──────────────────────────────────────────────────────────

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// ─── Reusable Schemas ─────────────────────────────────────────────────────────

const HealthSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  timestamp: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  uptime: z.number().openapi({ example: 123.456 }),
}).openapi("Health");

const RegisterRequestSchema = z.object({
  name: z.string().openapi({ example: "Sandip Sapkota" }),
  email: z.string().email().openapi({ example: "test@thesandip.dev" }),
  password: z.string().min(8).openapi({ example: "strongpassword123" }),
}).openapi("RegisterRequest");

const LoginRequestSchema = z.object({
  email: z.string().email().openapi({ example: "test@thesandip.dev" }),
  password: z.string().min(1).openapi({ example: "strongpassword123" }),
}).openapi("LoginRequest");

const UserSchema = z.object({
  id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  name: z.string().openapi({ example: "Sandip Sapkota" }),
  email: z.string().email().openapi({ example: "test@thesandip.dev" }),
  role: z.enum(["admin", "user", "operator"]).openapi({ example: "user" }),
  imageUrl: z.string().url().nullable().openapi({ example: "https://cdn.example.com/avatar.png" }),
}).openapi("User");

const ConfidenceStatsSchema = z.object({
  mean: z.number().openapi({ example: 0.7968 }),
  min: z.number().openapi({ example: 0.0176 }),
  max: z.number().openapi({ example: 1 }),
  std: z.number().openapi({ example: 0.3437 }),
}).openapi("ConfidenceStats");

const VehicleSchema = z.object({
  id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  licensePlate: z.string().openapi({ example: "बा१९च५७६९" }),
  entryTime: z.string().datetime().openapi({ example: "2024-01-01T10:00:00.000Z" }),
  exitTime: z.string().datetime().nullable().openapi({ example: "2024-01-01T12:00:00.000Z" }),
  imageUrl: z.string().url().nullable().openapi({ example: "https://ik.imagekit.io/example/image.jpg" }),
  imageKey: z.string().nullable().openapi({ example: "fileId_abc123" }),
  vehicleType: z.string().nullable().openapi({ example: "car" }),
  confidence: ConfidenceStatsSchema.nullable(),
  totalAmount: z.string().nullable().openapi({ example: "150.00" }),
}).openapi("Vehicle");

const ErrorSchema = z.object({
  error: z.string().openapi({ example: "Unauthorized" }),
  message: z.string().optional().openapi({ example: "Additional error details" }),
}).openapi("Error");

const TokenResponseSchema = z.object({
  message: z.string().openapi({ example: "User logged in successfully!" }),
  token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  user: UserSchema,
}).openapi("TokenResponse");

// ─── Health ───────────────────────────────────────────────────────────────────

registry.registerPath({
  method: "get",
  path: "/health",
  summary: "Health check",
  tags: ["Health"],
  responses: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: HealthSchema } },
    },
  },
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  summary: "Register a new user",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterRequestSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "User registered successfully!" }),
            user: UserSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation error or email already exists",
      content: { "application/json": { schema: ErrorSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Login and receive JWT token",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: LoginRequestSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: TokenResponseSchema } },
    },
    401: {
      description: "Invalid email or password",
      content: { "application/json": { schema: ErrorSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/profile",
  summary: "Get authenticated user profile",
  tags: ["Auth"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "User profile",
      content: {
        "application/json": {
          schema: z.object({ user: UserSchema }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// ─── Vehicle Routes ───────────────────────────────────────────────────────────

const vehicleEntryExitResponse = z.object({
  message: z.string().openapi({ example: "Vehicle entry recorded successfully!" }),
  data: VehicleSchema,
});

registry.registerPath({
  method: "post",
  path: "/api/vehicles/entry",
  summary: "Record vehicle entry",
  description: "Upload a vehicle image to detect the license plate and record entry. Requires admin role.",
  tags: ["Vehicles"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: z.object({
            image: z.instanceof(File).openapi({
              type: "string",
              format: "binary",
              description: "Vehicle image (JPEG, PNG, WEBP, GIF, SVG — max 5MB)",
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Vehicle entry recorded",
      content: { "application/json": { schema: vehicleEntryExitResponse } },
    },
    400: {
      description: "No image file provided",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden — admin role required",
      content: { "application/json": { schema: ErrorSchema } },
    },
    409: {
      description: "Vehicle is already parked",
      content: { "application/json": { schema: ErrorSchema } },
    },
    502: {
      description: "License plate extraction or image upload failed",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/vehicles/exit",
  summary: "Record vehicle exit",
  description: "Upload a vehicle image to detect the license plate and record exit with billing. Requires admin role.",
  tags: ["Vehicles"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: z.object({
            image: z.instanceof(File).openapi({
              type: "string",
              format: "binary",
              description: "Vehicle image (JPEG, PNG, WEBP, GIF, SVG — max 5MB)",
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Vehicle exit recorded with total billing amount",
      content: { "application/json": { schema: vehicleEntryExitResponse } },
    },
    400: {
      description: "No image file provided",
      content: { "application/json": { schema: ErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden — admin role required",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "No entry record found for this license plate",
      content: { "application/json": { schema: ErrorSchema } },
    },
    409: {
      description: "Vehicle has already exited or exit processed simultaneously",
      content: { "application/json": { schema: ErrorSchema } },
    },
    502: {
      description: "License plate extraction or image upload failed",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/vehicles",
  summary: "Get all vehicle records",
  description: "Returns all vehicle entry/exit records ordered by entry time descending. Requires admin role.",
  tags: ["Vehicles"],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "List of all vehicles",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(VehicleSchema) }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden — admin role required",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/vehicles/{id}",
  summary: "Get vehicle record by ID",
  tags: ["Vehicles"],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    }),
  },
  responses: {
    200: {
      description: "Vehicle record",
      content: {
        "application/json": {
          schema: z.object({ data: VehicleSchema }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden — admin role required",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "Vehicle not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

// ─── Generate ─────────────────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Parking Billing API",
    version: "1.0.0",
    description: "Backend API for parking entry/exit billing with license plate recognition",
  },
  servers: [
    { url: "http://localhost:8080", description: "Local development" },
    { url: "https://your-app.vercel.app", description: "Production" },
  ],
});

export const swaggerUiOptions = {
  customSiteTitle: "Parking Billing API Docs",
};