import { Request, Response, NextFunction } from "express";
import JwtService, { JwtPayload } from "../lib/jwt";


export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}


export function requireRole(...roles: JwtPayload["role"][]): (
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: `Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}