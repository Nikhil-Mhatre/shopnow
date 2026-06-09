import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, inject these via Kubernetes Secrets.
// Locally, load them from a secure directory.
export const getPrivateKey = (): string => {
  if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY;
  return fs.readFileSync(
    path.join(__dirname, "../../certs/private.pem"),
    "utf8",
  );
};

export const getPublicKey = (): string => {
  if (process.env.PUBLIC_KEY) return process.env.PUBLIC_KEY;
  return fs.readFileSync(
    path.join(__dirname, "../../certs/public.pem"),
    "utf8",
  );
};
