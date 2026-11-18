import type { BasketConfig } from "./basket.js";
import type { ProductView } from "./index.js";

/** The catalogue as GET /products returns it. */
export function productViews({
	catalogue,
	offers,
}: BasketConfig): ProductView[] {
	return catalogue.map((product) => ({
		...product,
		offer:
			offers.find((offer) => offer.badge?.code === product.code)?.badge?.text ??
			null,
	}));
}
