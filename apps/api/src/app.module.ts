import {
	Module,
	StandardSchemaValidationPipe,
	UnprocessableEntityException,
} from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { DrizzleModule } from "@nestjs/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import { BasketsModule } from "./baskets/baskets.module.js";
import { CatalogueModule } from "./catalogue/catalogue.module.js";
import { DomainErrorFilter } from "./common/domain-error.filter.js";
import { env } from "./env.js";
import { HealthController } from "./health.controller.js";

@Module({
	imports: [
		DrizzleModule.forRoot({ drizzle, connection: env.DATABASE_URL }),
		CatalogueModule,
		BasketsModule,
	],
	controllers: [HealthController],
	// Registered here, not in main.ts, so tests that build AppModule get the same pipe and filter.
	providers: [
		{
			provide: APP_PIPE,
			// A body that fails its schema is 422, as in the contract (docs/design/screens.md).
			useValue: new StandardSchemaValidationPipe({
				exceptionFactory: (issues) =>
					new UnprocessableEntityException({
						message: "Validation failed",
						errors: issues.map((issue) => ({
							path: issue.path
								?.map((segment) =>
									typeof segment === "object" ? segment.key : segment,
								)
								.join("."),
							message: issue.message,
						})),
					}),
			}),
		},
		{ provide: APP_FILTER, useClass: DomainErrorFilter },
	],
})
export class AppModule {}
