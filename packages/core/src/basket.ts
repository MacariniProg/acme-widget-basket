import type { BasketItemView, BasketView, Cents } from "./index.js";

export type Product = { code: string; name: string; price: Cents };

/** Applies while the subtotal after discount is below `below`. The tier without `below` covers everything above. */
export type DeliveryTier = { below?: Cents; cost: Cents };

export type Offer = {
	/** Receipt line text, e.g. "Red Widget offer". */
	label: string;
	/** What the customer reads, e.g. "Buy one Red Widget, get the second half price." */
	description: string;
	discount: (items: readonly Product[]) => Cents;
};

export type BasketConfig = {
	catalogue: Product[];
	delivery: DeliveryTier[];
	offers: Offer[];
};

export class UnknownProductError extends Error {
	constructor(code: string) {
		super(`Unknown product code: ${code}`);
		this.name = "UnknownProductError";
	}
}

export class Basket {
	readonly #catalogue: Map<string, Product>;
	readonly #delivery: DeliveryTier[];
	readonly #offers: Offer[];
	readonly #items: Product[] = [];

	constructor({ catalogue, delivery, offers }: BasketConfig) {
		this.#catalogue = new Map(
			catalogue.map((product) => [product.code, product]),
		);
		// Cheapest-threshold first, the open-ended tier last.
		this.#delivery = delivery.toSorted(
			(a, b) => (a.below ?? Infinity) - (b.below ?? Infinity),
		);
		if (this.#delivery.at(-1)?.below !== undefined) {
			throw new Error(
				"Delivery tiers need one tier without `below` for large orders",
			);
		}
		this.#offers = offers;
	}

	add(code: string): void {
		const product = this.#catalogue.get(code);
		if (!product) throw new UnknownProductError(code);
		this.#items.push(product);
	}

	/** Takes one unit of the product out. A product the basket doesn't have changes nothing (BR-10). */
	remove(code: string): void {
		if (!this.#catalogue.has(code)) throw new UnknownProductError(code);
		const index = this.#items.findLastIndex((item) => item.code === code);
		if (index !== -1) this.#items.splice(index, 1);
	}

	total(): Cents {
		return this.summary().total;
	}

	/** Every step of the total, as the receipt shows it (BR-07). */
	summary(): Omit<BasketView, "id"> {
		const items = new Map<string, BasketItemView>();
		for (const { code, name, price } of this.#items) {
			const line = items.get(code) ?? { code, name, quantity: 0, lineTotal: 0 };
			line.quantity += 1;
			line.lineTotal += price;
			items.set(code, line);
		}

		const subtotal = this.#items.reduce((sum, item) => sum + item.price, 0);
		const discounts = this.#offers
			.map((offer) => ({
				label: offer.label,
				amount: offer.discount(this.#items),
			}))
			.filter((discount) => discount.amount > 0);
		const afterDiscount =
			subtotal - discounts.reduce((sum, discount) => sum + discount.amount, 0);
		// Delivery is chosen from the subtotal after discount (BR-06). An empty basket pays nothing (BR-08).
		const empty = this.#items.length === 0;
		const index = this.#delivery.findIndex(
			(t) => t.below === undefined || afterDiscount < t.below,
		);
		const tier = this.#delivery[index];
		const next = this.#delivery[index + 1];
		const delivery = empty ? 0 : (tier?.cost ?? 0);
		// Only the open-ended tier lacks `below`, and it is last, so `next` implies `tier.below`.
		const nextDelivery =
			!empty && next && tier?.below !== undefined
				? { spend: tier.below - afterDiscount, cost: next.cost }
				: null;

		return {
			items: [...items.values()],
			subtotal,
			discounts,
			delivery,
			total: afterDiscount + delivery,
			nextDelivery,
		};
	}
}
