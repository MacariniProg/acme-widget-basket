import { z } from "zod";

// Loads apps/api/.env when it exists. In production the platform sets the variables.
try {
	process.loadEnvFile();
} catch {}

// Fails at boot, with every problem listed, instead of on the first query.
export const env = z
	.object({
		DATABASE_URL: z.url(),
		PORT: z.coerce.number().int().default(3000),
		CORS_ORIGIN: z.string().default("http://localhost:5173"),
	})
	.parse(process.env);
