import jwt from "jsonwebtoken";
import { getPrivateKey } from "../config/keys.js";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const tokenService = {
  signUserToken: (payload: TokenPayload): string => {
    const privateKey = getPrivateKey();

    // Sign using RS256 (Asymmetric Cryptography)
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d", // 7 days
      issuer: "ecommerce-user-service",
    });
  },
};
