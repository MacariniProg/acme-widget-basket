import { Controller, Get } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import { sql } from "drizzle-orm";
import type { Db } from "./db/schema.js";

@Controller("health")
export class HealthController {
	constructor(@InjectDrizzle() private readonly db: Db) {}

	/** Also proves the database answers. */
	@Get()
	async check() {
		await this.db.execute(sql`select 1`);
		return { status: "ok" };
	}
}
