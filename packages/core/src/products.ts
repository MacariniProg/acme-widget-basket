import type { BasketConfig } from "./basket.js";
import type { OfferView, ProductView } from "./index.js";

export function productViews({ catalogue }: BasketConfig): ProductView[] {
	return catalogue.map(({ code, name, price }) => ({ code, name, price }));
}

/** The active offers as GET /offers returns them. An offer can span several products, so it isn't tied to one. */
export function offerViews({ offers }: BasketConfig): OfferView[] {
	return offers.map(({ label, description }) => ({ label, description }));
}
