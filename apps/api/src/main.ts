import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { env } from "./env.js";

const app = await NestFactory.create(AppModule);
// The web app runs on another origin (Vite on :5173 locally).
app.enableCors({ origin: env.CORS_ORIGIN });
// Closes the database pool on SIGTERM.
app.enableShutdownHooks();
await app.listen(env.PORT);
