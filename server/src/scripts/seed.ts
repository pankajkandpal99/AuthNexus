// src/scripts/seed.ts
import { sequelize } from "../lib/db.js";
import { UserSeeder } from "../seeders/user.seeder.js";

(async () => {
  try {
    await sequelize.sync({ force: false }); // Sync database (optional)
    await UserSeeder.seedDatabase(40); // Seed users (40 users)

    process.exit(0);
  } catch (error) {
    console.error("Seed script failed:", error);
    process.exit(1);
  }
})();
