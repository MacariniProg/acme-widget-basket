import { expect, test } from "vitest";
import { acmeConfig } from "./acme.js";
import { productViews } from "./products.js";

test("lists the catalogue with the offer badge on products that have one", () => {
	expect(productViews(acmeConfig)).toEqual([
		{
			code: "R01",
			name: "Red Widget",
			price: 3295,
			offer: "Second one half price",
		},
		{ code: "G01", name: "Green Widget", price: 2495, offer: null },
		{ code: "B01", name: "Blue Widget", price: 795, offer: null },
	]);
});
