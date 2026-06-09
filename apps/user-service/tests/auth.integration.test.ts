import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js"; // Adjust path based on your exact app layout
import { mailService } from "../src/services/mail.service.js";
import { OtpModel } from "../src/models/Otp.js";
import { UserModel } from "../src/models/User.js";

describe("User Service - Authentication Lifecycle Integration", () => {
  const testEmail = "tester@mystore.com";

  it("should execute a complete passwordless login loop successfully", async () => {
    // 1. Spy on mailService to intercept the generated OTP code
    const mailSpy = vi
      .spyOn(mailService, "sendOtp")
      .mockResolvedValue(undefined);

    // 2. Trigger an OTP Request
    const requestRes = await request(app)
      .post("/api/auth/otp-request")
      .send({ email: testEmail });

    expect(requestRes.status).toBe(200);
    expect(requestRes.body.message).toBe("Code dispatched.");
    expect(mailSpy).toHaveBeenCalledTimes(1);

    // Extract the exact 6-digit plain text code passed to mailService
    const interceptedOtp = mailSpy.mock.calls[0][1];
    expect(interceptedOtp).toMatch(/^\d{6}$/);

    // 3. Verify the OTP Code to complete Authentication and obtain JWT
    const verifyRes = await request(app)
      .post("/api/auth/otp-verify")
      .send({ email: testEmail, otp: interceptedOtp });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toHaveProperty("token");
    expect(verifyRes.body.user.email).toBe(testEmail);
    expect(verifyRes.body.user.role).toBe("customer");

    // 4. Assert Database State: The temporary OTP document must be purged
    const dbOtpRecord = await OtpModel.findOne({ email: testEmail });
    expect(dbOtpRecord).toBeNull();

    // Assert Database State: The user must be dynamically provisioned
    const dbUserRecord = await UserModel.findOne({ email: testEmail });
    expect(dbUserRecord).not.toBeNull();
  });

  it("should enforce rate limits and reject invalid verification sequences", async () => {
    // Request a code to populate an active instance
    vi.spyOn(mailService, "sendOtp").mockResolvedValue(undefined);
    await request(app).post("/api/auth/otp-request").send({ email: testEmail });

    // Submit an intentional mismatch code payload
    const badVerifyRes = await request(app)
      .post("/api/auth/otp-verify")
      .send({ email: testEmail, otp: "000000" });

    expect(badVerifyRes.status).toBe(401);
    expect(badVerifyRes.body.error).toBe("Invalid code.");

    // Assert that the wrong attempt incremented internally in the DB cache
    const record = await OtpModel.findOne({ email: testEmail });
    expect(record?.attempts).toBe(1);
  });
});
