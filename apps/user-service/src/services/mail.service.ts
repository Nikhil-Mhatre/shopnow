import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mailpit.default.svc.cluster.local",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined, // Mailpit requires no auth
});

export const mailService = {
  sendOtp: async (email: string, otp: string): Promise<void> => {
    await transporter.sendMail({
      from: '"MyStore" <no-reply@mystore.com>',
      to: email,
      subject: "Your Login Code",
      text: `Your authentication code is: ${otp}. It expires in 5 minutes.`,
      html: `<b>Your authentication code is: ${otp}</b><br>It expires in 5 minutes.`,
    });
    logger.info(`OTP dispatched to ${email}`);
  },
};
