import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

// Retrieves the RS256 Public Key from the environment
const getPublicKey = (): string => {
  const key = process.env.JWT_PUBLIC_KEY;
  if (!key) {
    throw new Error("CRITICAL: JWT_PUBLIC_KEY is missing in Catalog Service environment variables.");
  }
  // Ensures newlines are parsed correctly if injected via Docker Compose or Azure Key Vault
  return key.replace(/\\n/g, '\n'); 
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // 1. PURE ZERO-TRUST: We ignore `x-user-role` completely. 
  // We strictly require the Authorization header containing the JWT.
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or malformed Bearer token." });
    return;
  }

  // Extract the raw token string
  const token = authHeader.split(" ")[1];

  try {
    // 2. Cryptographically verify the token locally using the shared Public Key
    // The algorithm is strictly enforced as RS256 to prevent algorithm downgrade attacks
    const decoded = jwt.verify(token, getPublicKey(), { algorithms: ["RS256"] }) as JwtPayload;

    // 3. Role-Based Access Control (RBAC) Validation
    if (decoded.role !== "admin") {
      res.status(403).json({ error: "Forbidden: Administrative privileges required to perform this action." });
      return;
    }

    // 4. Token is valid and user is an admin. Proceed to the next controller!
    next();
  } catch (err) {
    // This catches expired tokens, malformed tokens, or tokens signed with the wrong Private Key
    res.status(401).json({ error: "Unauthorized: Invalid, tampered, or expired access token." });
    return;
  }
};