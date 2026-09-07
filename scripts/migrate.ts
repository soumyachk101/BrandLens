/**
 * Prisma Migration Runner
 *
 * Usage:
 * - tsx scripts/migrate.ts [up|down|reset|deploy]
 *
 * Commands:
 * - deploy : Run pending migrations (default)
 * - reset : Reset database and re-run all migrations
 * - seed : Run migrations and seed initial data
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

interface MigrationOptions {
 command: "deploy" | "reset" | "seed";
 verbose?: boolean;
}

async function runMigrations(): Promise<void> {
 console.log("Running Prisma migrations...");

 try {
 // Generate Prisma client (ensures schema is up to date)
 console.log("Generating Prisma client...");
 execSync("npx prisma generate", { stdio: "inherit" });

 // Deploy pending migrations
 console.log("Deploying migrations...");
 execSync("npx prisma migrate deploy", { stdio: "inherit" });

 console.log("Migrations deployed successfully");
 } catch (error) {
 console.error("Migration failed:", error);
 process.exit(1);
 }
}

async function resetDatabase(): Promise<void> {
 console.warn("WARNING: This will delete all data in the database!");
 console.warn("Press Ctrl+C within 5 seconds to cancel...");

 await new Promise((resolve) => setTimeout(resolve, 5000));

 console.log("Resetting database...");

 try {
 // Push schema (dropping and recreating)
 execSync("npx prisma migrate reset --force", { stdio: "inherit" });

 console.log("Database reset successfully");
 } catch (error) {
 console.error("Database reset failed:", error);
 process.exit(1);
 }
}

async function seedDatabase(): Promise<void> {
 console.log("Seeding database with initial data...");

 try {
 const seedModule = await import("./seed.js");
 await seedModule.default?.();
 } catch (error) {
 console.error("Seeding failed:", error);
 process.exit(1);
 }
}

async function validateConnection(): Promise<boolean> {
 try {
 await prisma.$connect();
 const result = await prisma.$queryRaw`SELECT 1 as connected`;
 console.log("Database connection validated");
 await prisma.$disconnect();
 return true;
 } catch (error) {
 console.error("Database connection failed:", error);
 return false;
 }
}

async function main(): Promise<void> {
 const args = process.argv.slice(2);
 const command = args[0] || "deploy";
 const options: MigrationOptions = { command: command as MigrationOptions["command"] };

 console.log("=".repeat(50));
 console.log("BrandLens Database Migration Runner");
 console.log("=".repeat(50));
 console.log(`Command: ${options.command}`);
 console.log("=".repeat(50));

 // Validate database connection
 console.log("\nValidating database connection...");
 const connected = await validateConnection();
 if (!connected) {
 console.error("\nCannot proceed without database connection.");
 console.error("Please check your DATABASE_URL environment variable.");
 process.exit(1);
 }

 switch (options.command) {
 case "deploy":
 await runMigrations();
 break;
 case "reset":
 await resetDatabase();
 await runMigrations();
 break;
 case "seed":
 await runMigrations();
 await seedDatabase();
 break;
 default:
 console.error(`Unknown command: ${options.command}`);
 console.error("Usage: tsx scripts/migrate.ts [deploy|reset|seed]");
 process.exit(1);
 }

 console.log("\n" + "=".repeat(50));
 console.log("Migration completed successfully!");
 console.log("=".repeat(50));
}

main()
 .catch((error) => {
 console.error("Unexpected error:", error);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
