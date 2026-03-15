import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { NotFoundError } from "../lib/errors.js";
import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";

export const taskRouter = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).default(""),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }),
});

taskRouter.get("/", async (_req, res) => {
  const result = await db.select().from(tasks);
  res.json(result);
});

taskRouter.get("/:id", async (req, res) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!task) throw new NotFoundError("Task not found");
  res.json(task);
});

taskRouter.post("/", validate(createSchema), async (req, res) => {
  const [task] = await db.insert(tasks).values(req.body).returning();
  res.status(201).json(task);
});

taskRouter.put("/:id", validate(updateSchema), async (req, res) => {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!existing) throw new NotFoundError("Task not found");
  const [updated] = await db.update(tasks).set(req.body).where(eq(tasks.id, existing.id)).returning();
  res.json(updated);
});

taskRouter.delete("/:id", async (req, res) => {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!existing) throw new NotFoundError("Task not found");
  await db.delete(tasks).where(eq(tasks.id, existing.id));
  res.status(204).end();
});
