import { defineConfig } from "drizzle-kit";

// drizzle-kit loads .env from the folder it runs in (apps/api).
export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
