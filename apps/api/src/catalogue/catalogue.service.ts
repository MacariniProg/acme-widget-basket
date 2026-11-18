import { type BasketConfig, type Offer, secondHalfPrice } from "@acme/core";
import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import { asc, eq } from "drizzle-orm";
import { type Db, deliveryTiers, offers, products } from "../db/schema.js";

type OfferRow = typeof offers.$inferSelect;

function toOffer({ kind, productCode, label, description }: OfferRow): Offer {
	switch (kind) {
		case "second_half_price":
			return secondHalfPrice({ code: productCode, label, description });
		default:
			// The check constraint on offers.kind keeps this from happening.
			throw new Error(`Unknown offer kind: ${kind}`);
	}
}

@Injectable()
export class CatalogueService {
	constructor(@InjectDrizzle() private readonly db: Db) {}

	// shortcut: three small queries per request; cache in memory with a TTL if it ever shows up in latency.
	async config(): Promise<BasketConfig> {
		const [catalogue, tiers, offerRows] = await Promise.all([
			this.db
				.select({
					code: products.code,
					name: products.name,
					price: products.priceCents,
				})
				.from(products)
				.orderBy(asc(products.position)),
			this.db.select().from(deliveryTiers),
			this.db
				.select()
				.from(offers)
				.where(eq(offers.active, true))
				.orderBy(asc(offers.id)),
		]);
		return {
			catalogue,
			// The core sorts the tiers; a null limit is the open-ended tier.
			delivery: tiers.map(({ belowCents, costCents }) =>
				belowCents === null
					? { cost: costCents }
					: { below: belowCents, cost: costCents },
			),
			offers: offerRows.map(toOffer),
		};
	}
}
