import { faker } from "@faker-js/faker";
import { ROLE } from "../config/constants.js";
import { AuthProvider, UserStatus } from "../types/model/i-user-model.js";
import { AuthService } from "../services/auth.service.js"; // We'll create this

export class UserSeeder {
  static async generateDummyUsers(count: number) {
    const users = [];

    for (let i = 0; i < count; i++) {
      const isAdmin = i === 0; // First user is admin
      const verified = faker.datatype.boolean(0.8); // 80% verified

      users.push({
        username: faker.internet
          .userName()
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .slice(0, 20),
        email: faker.internet.email().toLowerCase(),
        password: "Password@123", // Will be hashed
        role: isAdmin ? ROLE.ADMIN : ROLE.USER,
        profileImage: faker.image.avatar(),
        isEmailVerified: verified,
        provider: AuthProvider.LOCAL,
        status: UserStatus.ACTIVE,
        profileCompleted: faker.datatype.boolean(),
        preferences: {
          theme: faker.helpers.arrayElement(["light", "dark"]),
          notifications: faker.datatype.boolean(),
        },
        createdAt: faker.date.past({ years: 1 }),
        lastLogin: faker.datatype.boolean() ? faker.date.recent() : null,
      });
    }

    return users;
  }

  static async seedDatabase(count = 30) {
    try {
      console.log("Starting user seeding process...");

      // Generate dummy users
      const dummyUsers = await this.generateDummyUsers(count);

      // Use AuthService for bulk creation
      const result = await AuthService.bulkCreateUsers(dummyUsers);

      console.log(
        `Seeding completed. ${result.createdCount} users created, ${result.errorCount} failed.`
      );
      return result;
    } catch (error) {
      console.error("Seeding failed:", error);
      throw error;
    }
  }
}
