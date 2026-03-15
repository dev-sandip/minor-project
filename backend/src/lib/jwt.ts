import jwt from "jsonwebtoken";
import { env } from "../config/env";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

export type JwtPayload = {
  id: string;
  email: string;
  role: string;
};

class JwtService {
  generateToken(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
}

export default new JwtService();