import { PGlite } from "@electric-sql/pglite";
import { getDrizzleToken } from "@nestjs/drizzle";
import { Test } from "@nestjs/testing";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { AppModule } from "../src/app.module.js";

/** The real AppModule on an in-memory Postgres (PGlite), with the real migrations, seed included. */
export async function createTestApp() {
	const db = drizzle(new PGlite());
	await migrate(db, {
		migrationsFolder: `${import.meta.dirname}/../src/db/migrations`,
	});
	const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
		.overrideProvider(getDrizzleToken())
		.useValue(db)
		.compile();
	const app = moduleRef.createNestApplication();
	await app.init();
	return app;
}
