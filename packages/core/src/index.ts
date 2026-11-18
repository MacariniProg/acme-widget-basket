// API contract shared by apps/api and apps/web. See docs/design/screens.md.
// shortcut: the package exports TypeScript source (fine for Vite and Vitest); the API build in Stage 5 must compile or bundle it.

/** Integer cents, never floats (BR-02). */
export type Cents = number;

export type ProductView = {
	code: string;
	name: string;
	price: Cents;
	/** Badge text, e.g. "Second one half price". Null when the product has no offer. */
	offer: string | null;
};

export type BasketItemView = {
	code: string;
	name: string;
	quantity: number;
	/** quantity x catalogue price, before discounts. */
	lineTotal: Cents;
};

export type DiscountView = {
	/** Receipt line text, e.g. "Red Widget offer". */
	label: string;
	amount: Cents;
};

export type BasketView = {
	id: string;
	items: BasketItemView[];
	subtotal: Cents;
	/** One line per applied offer. Empty when no offer applies. */
	discounts: DiscountView[];
	/** 0 means free delivery. */
	delivery: Cents;
	total: Cents;
	/** How much more to spend for the next cheaper delivery tier. Null when delivery is already free. */
	nextDelivery: { spend: Cents; cost: Cents } | null;
};
