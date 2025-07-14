import { hash } from "bcryptjs";
import * as crypto from "crypto";
import User from "../models/user.model.js";

export class AuthService {
  static async bulkCreateUsers(users: any[]) {
    const createdUsers: any = [];
    let createdCount = 0;
    let errorCount = 0;

    // Process in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (userData) => {
          try {
            const { username, email, password } = userData;

            // Check for existing users
            const [existingEmail, existingUsername] = await Promise.all([
              User.findByEmail(email),
              User.findByUsername(username),
            ]);

            if (existingEmail || existingUsername) {
              errorCount++;
              return;
            }

            // Hash password
            const hashedPassword = await hash(password, 12);

            // Generate verification token if needed
            const verificationToken = userData.isEmailVerified
              ? null
              : crypto.randomBytes(32).toString("hex");

            const expiresAt = userData.isEmailVerified
              ? null
              : new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Create user
            const user = await User.create({
              ...userData,
              password: hashedPassword,
              emailVerificationToken: verificationToken,
              emailVerificationTokenExpires: expiresAt,
            });

            createdUsers.push(user.toSafeObject());
            createdCount++;
          } catch (error: any) {
            errorCount++;
            console.error(
              `Error creating user ${userData.email}:`,
              error.message
            );
          }
        })
      );
    }

    return {
      createdCount,
      errorCount,
      users: createdUsers,
      message: `Bulk user creation completed. ${createdCount} users created, ${errorCount} failed.`,
    };
  }
}
