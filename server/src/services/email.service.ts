import { logger } from "../utils/logger.js";
import { transporter } from "../config/mail.config.js";
import { EmailTemplates } from "../config/email-templates.js";
import { env } from "../config/env.js";

export class EmailService {
  static async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    try {
      const info = await transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
      });

      // logger.info(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
      return false;
    }
  }

  static async sendVerificationEmail(
    email: string,
    name: string,
    token: string
  ) {
    const template = EmailTemplates.verificationEmail(name, token);
    return this.sendEmail(email, template.subject, template.html);
  }

  static async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string
  ) {
    const template = EmailTemplates.passwordResetEmail(name, token);
    return this.sendEmail(email, template.subject, template.html);
  }

  static async sendLoginNotification(email: string, name: string) {
    const template = EmailTemplates.loginNotification(name);
    return this.sendEmail(email, template.subject, template.html);
  }
}
