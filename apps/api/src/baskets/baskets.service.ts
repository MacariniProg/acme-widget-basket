import { Basket, type BasketView } from "@acme/core";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import { and, asc, desc, eq } from "drizzle-orm";
import { CatalogueService } from "../catalogue/catalogue.service.js";
import { basketItems, baskets, type Db } from "../db/schema.js";

@Injectable()
export class BasketsService {
	constructor(
		@InjectDrizzle() private readonly db: Db,
		private readonly catalogue: CatalogueService,
	) {}

	async create(): Promise<BasketView> {
		const [basket] = await this.db
			.insert(baskets)
			.values({})
			.returning({ id: baskets.id });
		// biome-ignore lint/style/noNonNullAssertion: insert ... returning always gives back the row.
		return this.view(basket!.id);
	}

	/** Prices, discounts and delivery are always recomputed from the database, never stored or read from a request. */
	async view(id: string): Promise<BasketView> {
		return { id, ...(await this.load(id)).summary() };
	}

	async add(id: string, code: string): Promise<BasketView> {
		const basket = await this.load(id);
		basket.add(code); // throws UnknownProductError before anything is saved (BR-03)
		await this.db
			.insert(basketItems)
			.values({ basketId: id, productCode: code });
		return { id, ...basket.summary() };
	}

	async remove(id: string, code: string): Promise<BasketView> {
		const basket = await this.load(id);
		basket.remove(code); // throws on an unknown code; a code not in the basket changes nothing (BR-10)
		// Postgres has no DELETE ... LIMIT, so pick the last row added for that product first.
		const last = this.db
			.select({ id: basketItems.id })
			.from(basketItems)
			.where(
				and(eq(basketItems.basketId, id), eq(basketItems.productCode, code)),
			)
			.orderBy(desc(basketItems.id))
			.limit(1);
		await this.db.delete(basketItems).where(eq(basketItems.id, last));
		return { id, ...basket.summary() };
	}

	/** The saved basket as a core Basket, built with the catalogue, delivery tiers and offers from the database. */
	private async load(id: string): Promise<Basket> {
		const [found, items, config] = await Promise.all([
			this.db
				.select({ id: baskets.id })
				.from(baskets)
				.where(eq(baskets.id, id)),
			this.db
				.select({ code: basketItems.productCode })
				.from(basketItems)
				.where(eq(basketItems.basketId, id))
				.orderBy(asc(basketItems.id)),
			this.catalogue.config(),
		]);
		if (found.length === 0) throw new NotFoundException("Basket not found");
		const basket = new Basket(config);
		for (const { code } of items) basket.add(code);
		return basket;
	}
}
