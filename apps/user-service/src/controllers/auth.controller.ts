import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { OtpModel } from "../models/Otp.js";
import { UserModel } from "../models/User.js";
import { mailService } from "../services/mail.service.js";
import { tokenService } from "../services/token.service.js";

const createOtpPayload = (email: string) => {
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
  const canResendAt = new Date(Date.now() + 60000); // 60s cooldown
  return { rawOtp, otpHash, canResendAt };
};

export const requestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    await OtpModel.deleteOne({ email });

    const { rawOtp, otpHash, canResendAt } = createOtpPayload(email);
    await OtpModel.create({ email, otpHash, canResendAt, attempts: 0 });

    await mailService.sendOtp(email, rawOtp);
    res.status(200).json({ message: "Code dispatched." });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    const existingOtp = await OtpModel.findOne({ email });

    if (existingOtp && new Date() < existingOtp.canResendAt) {
      res.status(429).json({ error: "Please wait for cooldown to expire." });
      return;
    }

    await OtpModel.deleteOne({ email });
    const { rawOtp, otpHash, canResendAt } = createOtpPayload(email);

    await OtpModel.create({ email, otpHash, canResendAt, attempts: 0 });
    await mailService.sendOtp(email, rawOtp);
    res.status(200).json({ message: "Fresh code dispatched." });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const record = await OtpModel.findOne({ email });

    if (!record) {
      res.status(401).json({ error: "Code expired or not requested." });
      return;
    }

    if (record.attempts >= 3) {
      await OtpModel.deleteOne({ email });
      res.status(429).json({ error: "Max attempts exceeded." });
      return;
    }

    const inputHash = crypto.createHash("sha256").update(otp).digest("hex");
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(record.otpHash),
      Buffer.from(inputHash),
    );

    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      res.status(401).json({ error: "Invalid code." });
      return;
    }

    await OtpModel.deleteOne({ email });

    // Dynamic Provisioning Loop
    let user = await UserModel.findOne({ email });
    if (!user) user = await UserModel.create({ email, role: "customer" });
    const token = tokenService.signUserToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      token,
      user: { email: user.email, role: user.role, firstName: user.firstName },
    });
  } catch (error) {
    next(error);
  }
};
