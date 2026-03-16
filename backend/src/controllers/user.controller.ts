import { Request, Response } from "express";
import { db } from "../db";
import { users, UserInsertSchema } from "../db/user";
import { eq } from "drizzle-orm";
import PasswordHasher from "../lib/hash";
import JwtService, { JwtPayload } from "../lib/jwt";
import { z } from "zod";
import { omit } from "../lib/utiities";
import { generateAvatar } from "../lib/avatar";

export const UserLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});


class UserController {
    public async register(req: Request, res: Response) {
        const parsed = UserInsertSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }

        const { email, name, password } = parsed.data;
        try {

            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, email),
            });
            if (existingUser) {
                return res.status(400).json({ error: "User with this email already exists" });
            }


            const hashedPassword = await PasswordHasher.hashPassword(password);

            const imageUrl = generateAvatar(name);
            const [user] = await db
                .insert(users)
                .values({ email, name, password: hashedPassword, imageUrl })
                .returning();

            if (!user) {
                return res.status(500).json({ error: "Failed to create user" });
            }

            res.status(201).json({
                message: "User registered successfully!",
                user: omit(user, ["password"]),
            });
        } catch (err) {
            res.status(500).json({

                error: err instanceof Error ? err.message : "Internal Server Error"
            });
        }
    }

    public async login(req: Request, res: Response) {
        const parsed = UserLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }

        const { email, password } = parsed.data;

        try {

            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (!user) {
                return res.status(401).json({ error: "Invalid email or password" });
            }


            const isValid = await PasswordHasher.comparePassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: "Invalid email or password" });
            }


            const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
            const token = JwtService.generateToken(payload);

            res.status(200).json({
                message: "User logged in successfully!",
                token,
                user: omit(user, ["password"]),
            });
        } catch (err) {
            res.status(500).json({ error: err instanceof Error ? err.message : "Internal Server Error" });
        }
    }
    public async profile(req: Request, res: Response) {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, req.user.id),
            });
console.log("User profile accessed:", user);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json({ user: omit(user, ["password"]) });
        } catch (err) {
            res.status(500).json({ error: err instanceof Error ? err.message : "Internal Server Error" });
        }
    }
}

export default new UserController();