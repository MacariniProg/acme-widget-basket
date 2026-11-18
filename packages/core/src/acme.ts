import type { BasketConfig, Product } from "./basket.js";
import { secondHalfPrice } from "./offers.js";

// The catalogue, delivery tiers and offer from the brief (BR-01, BR-04, BR-06).
// Single source for tests, the MSW mock and the database seed.

const red: Product = { code: "R01", name: "Red Widget", price: 3295 };

export const acmeConfig: BasketConfig = {
	catalogue: [
		red,
		{ code: "G01", name: "Green Widget", price: 2495 },
		{ code: "B01", name: "Blue Widget", price: 795 },
	],
	delivery: [
		{ below: 5000, cost: 495 },
		{ below: 9000, cost: 295 },
		{ cost: 0 },
	],
	offers: [secondHalfPrice(red.code, "Red Widget offer")],
};
