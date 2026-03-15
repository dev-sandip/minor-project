import { JwtPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}