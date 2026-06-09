import { Router } from "express";
import { z } from "zod";
import {
  requestOtp,
  resendOtp,
  verifyOtp,
} from "./controllers/auth.controller.js";
import { updateProfile, addAddress } from "./controllers/profile.controller.js";
import { getDocsRouter } from "./docs/openapi.js";

// Import your middlewares
import { validate } from "./middleware/validate.js";
import { requireAuth } from "./middleware/requireAuth.js";

const router: Router = Router();

// ==========================================
// 1. DEFINE ZOD SCHEMAS
// ==========================================
const EmailSchema = z.object({
  email: z.string().email("Invalid email address format"),
});

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const UpdateProfileSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  phone: z.string().optional(),
});

const AddressSchema = z.object({
  fullName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(1),
  isDefault: z.boolean().optional(),
});

// Localized Interactive API Portal Explorer Documentation Mount
router.use("/docs", getDocsRouter());

// ==========================================
// 2. APPLY MIDDLEWARE TO ROUTES
// ==========================================

// Public Auth Routes (Protected by Zod Validation)
router.post("/auth/otp-request", validate(EmailSchema), requestOtp);
router.post("/auth/otp-resend", validate(EmailSchema), resendOtp);
router.post("/auth/otp-verify", validate(VerifyOtpSchema), verifyOtp);

// Protected Profile Routes (Protected by RequireAuth AND Zod Validation)
router.put(
  "/profile",
  requireAuth,
  validate(UpdateProfileSchema),
  updateProfile,
);
router.post(
  "/profile/addresses",
  requireAuth,
  validate(AddressSchema),
  addAddress,
);

export default router;
