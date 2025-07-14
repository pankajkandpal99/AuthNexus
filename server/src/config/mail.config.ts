import nodemailer from "nodemailer";
import { env } from "./env.js";

export const mailConfig = {
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

export const transporter = nodemailer.createTransport(mailConfig);

transporter.verify((error: any) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    // console.log("SMTP server is ready to send emails");
  }
});
