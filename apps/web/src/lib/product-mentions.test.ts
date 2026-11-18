import { expect, test } from "vitest";
import { splitProductMentions } from "./product-mentions";

const products = [
	{ code: "R01", name: "Red Widget" },
	{ code: "B01", name: "Blue Widget" },
	{ code: "R02", name: "Red Widget XL" },
];

test("marks each product name with its code", () => {
	expect(
		splitProductMentions("Buy one Red Widget and one Blue Widget.", products),
	).toEqual([
		{ text: "Buy one " },
		{ text: "Red Widget", code: "R01" },
		{ text: " and one " },
		{ text: "Blue Widget", code: "B01" },
		{ text: "." },
	]);
});

test("prefers the longest name when one contains another", () => {
	expect(splitProductMentions("Red Widget XL", products)).toEqual([
		{ text: "Red Widget XL", code: "R02" },
	]);
});

test("returns the text as is when no product is named", () => {
	expect(splitProductMentions("Free delivery over $90.", products)).toEqual([
		{ text: "Free delivery over $90." },
	]);
});
