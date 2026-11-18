import { expect, test } from "vitest";
import { acmeConfig } from "./acme.js";
import { offerViews, productViews } from "./products.js";

test("lists the catalogue", () => {
	expect(productViews(acmeConfig)).toEqual([
		{ code: "R01", name: "Red Widget", price: 3295 },
		{ code: "G01", name: "Green Widget", price: 2495 },
		{ code: "B01", name: "Blue Widget", price: 795 },
	]);
});

test("lists the offers with the text customers see", () => {
	expect(offerViews(acmeConfig)).toEqual([
		{
			label: "Red Widget offer",
			description: "Buy one Red Widget, get the second half price.",
		},
	]);
});
