// API contract shared by apps/api and apps/web. See docs/design/screens.md.

/** Integer cents, never floats (BR-02). */
export type Cents = number;

export type ProductView = {
	code: string;
	name: string;
	price: Cents;
};

export type OfferView = {
	label: string;
	description: string;
};

export type BasketItemView = {
	code: string;
	name: string;
	quantity: number;
	/** quantity x catalogue price, before discounts. */
	lineTotal: Cents;
};

export type DiscountView = {
	label: string;
	amount: Cents;
};

export type BasketView = {
	id: string;
	items: BasketItemView[];
	subtotal: Cents;
	discounts: DiscountView[];
	/** 0 means free delivery. */
	delivery: Cents;
	total: Cents;
	/** How much more to spend for the next cheaper delivery tier. Null when delivery is already free. */
	nextDelivery: { spend: Cents; cost: Cents } | null;
};

export { acmeConfig } from "./acme.js";
export {
	Basket,
	type BasketConfig,
	type DeliveryTier,
	type Offer,
	type Product,
	UnknownProductError,
} from "./basket.js";
export { secondHalfPrice } from "./offers.js";
export { offerViews, productViews } from "./products.js";
