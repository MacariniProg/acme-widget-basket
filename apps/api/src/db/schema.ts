import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	integer,
	type PgDatabase,
	type PgQueryResultHKT,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// Money columns are integer cents (BR-02).

export const products = pgTable(
	"products",
	{
		code: text().primaryKey(),
		name: text().notNull(),
		priceCents: integer("price_cents").notNull(),
		/** Catalogue order on screen, as in the brief: R01, G01, B01. */
		position: integer().notNull(),
	},
	(t) => [check("price_positive", sql`${t.priceCents} > 0`)],
);

/** Mirrors the core's DeliveryTier: a null `below_cents` is the open-ended tier. */
export const deliveryTiers = pgTable(
	"delivery_tiers",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		belowCents: integer("below_cents"),
		costCents: integer("cost_cents").notNull(),
	},
	(t) => [check("cost_not_negative", sql`${t.costCents} >= 0`)],
);

/** `kind` picks the core function that builds the offer. A new kind is new code in packages/core. */
export const offers = pgTable(
	"offers",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		kind: text().notNull(),
		productCode: text("product_code")
			.notNull()
			.references(() => products.code),
		label: text().notNull(),
		description: text().notNull(),
		active: boolean().notNull().default(true),
	},
	(t) => [check("known_kind", sql`${t.kind} in ('second_half_price')`)],
);

export const baskets = pgTable("baskets", {
	id: uuid().primaryKey().defaultRandom(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

/** One row per add(), no quantity column. The identity id keeps the order items were added. */
export const basketItems = pgTable(
	"basket_items",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		basketId: uuid("basket_id")
			.notNull()
			.references(() => baskets.id, { onDelete: "cascade" }),
		productCode: text("product_code")
			.notNull()
			.references(() => products.code),
	},
	// Postgres doesn't index foreign keys on its own, and every basket read filters by it.
	(t) => [index("basket_items_basket_id_idx").on(t.basketId)],
);

/** Base type of every Postgres driver's database: postgres.js in production, PGlite in tests. */
export type Db = PgDatabase<PgQueryResultHKT>;
