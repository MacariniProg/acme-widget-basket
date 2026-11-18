import { describe, expect, test } from "vitest";
import { acmeConfig } from "./acme.js";
import { Basket, type BasketConfig, UnknownProductError } from "./basket.js";

function basketWith(codes: string[], config: BasketConfig = acmeConfig) {
	const basket = new Basket(config);
	for (const code of codes) basket.add(code);
	return basket;
}

describe("total", () => {
	// The four examples from the brief. They never leave the suite.
	test.each([
		[["B01", "G01"], 3785],
		[["R01", "R01"], 5437],
		[["R01", "G01"], 6085],
		[["B01", "B01", "R01", "R01", "R01"], 9827],
	])("%j costs %i cents", (codes, expected) => {
		expect(basketWith(codes).total()).toBe(expected);
	});

	test("an empty basket costs nothing, with no delivery (BR-08)", () => {
		expect(basketWith([]).total()).toBe(0);
	});

	test("the red widget offer applies once per pair (BR-04)", () => {
		// 4 x 3295 = 13180, minus 2 x 1648 = 9884, free delivery
		expect(basketWith(["R01", "R01", "R01", "R01"]).total()).toBe(9884);
	});

	test("delivery tiers: exactly $50 pays $2.95 and exactly $90 is free (BR-06)", () => {
		const config: BasketConfig = {
			...acmeConfig,
			catalogue: [
				{ code: "X50", name: "Fifty", price: 5000 },
				{ code: "X90", name: "Ninety", price: 9000 },
			],
		};
		expect(basketWith(["X50"], config).total()).toBe(5295);
		expect(basketWith(["X90"], config).total()).toBe(9000);
	});

	test("an unknown product code is rejected (BR-03)", () => {
		expect(() => basketWith(["NOPE"])).toThrow(UnknownProductError);
	});

	test("delivery tiers without an open-ended tier are rejected", () => {
		expect(
			() =>
				new Basket({ ...acmeConfig, delivery: [{ below: 5000, cost: 495 }] }),
		).toThrow();
	});
});

describe("summary", () => {
	test("shows each step of the total (BR-07)", () => {
		expect(basketWith(["R01", "R01"]).summary()).toMatchObject({
			items: [
				{ code: "R01", name: "Red Widget", quantity: 2, lineTotal: 6590 },
			],
			subtotal: 6590,
			discounts: [{ label: "Red Widget offer", amount: 1648 }],
			delivery: 495,
			total: 5437,
		});
	});

	test("groups items by product, in the order they were first added", () => {
		expect(basketWith(["B01", "R01", "B01"]).summary().items).toEqual([
			{ code: "B01", name: "Blue Widget", quantity: 2, lineTotal: 1590 },
			{ code: "R01", name: "Red Widget", quantity: 1, lineTotal: 3295 },
		]);
	});

	test("has no discount lines when no offer applies", () => {
		expect(basketWith(["B01", "G01"]).summary().discounts).toEqual([]);
	});
});

describe("nextDelivery", () => {
	test.each([
		// After discount 4942: 58 more reaches the $2.95 tier.
		[["R01", "R01"], { spend: 58, cost: 295 }],
		// 5790: 3210 more reaches free delivery.
		[["R01", "G01"], { spend: 3210, cost: 0 }],
	])("%j needs %j for cheaper delivery", (codes, expected) => {
		expect(basketWith(codes).summary().nextDelivery).toEqual(expected);
	});

	test("is null when delivery is already free", () => {
		expect(
			basketWith(["B01", "B01", "R01", "R01", "R01"]).summary().nextDelivery,
		).toBeNull();
	});

	test("is null for an empty basket", () => {
		expect(basketWith([]).summary().nextDelivery).toBeNull();
	});
});

describe("remove", () => {
	test("takes one unit of that product out of the basket (BR-10)", () => {
		const basket = basketWith(["R01", "R01", "G01"]);
		basket.remove("R01");
		expect(basket.summary().items).toEqual([
			{ code: "R01", name: "Red Widget", quantity: 1, lineTotal: 3295 },
			{ code: "G01", name: "Green Widget", quantity: 1, lineTotal: 2495 },
		]);
	});

	test("recomputes the offer: back to one red, no discount", () => {
		const basket = basketWith(["R01", "R01"]);
		basket.remove("R01");
		expect(basket.total()).toBe(3295 + 495);
	});

	test("changes nothing when the product isn't in the basket (BR-10)", () => {
		const basket = basketWith(["G01"]);
		basket.remove("R01");
		expect(basket.total()).toBe(2495 + 495);
	});

	test("rejects an unknown product code (BR-03)", () => {
		expect(() => basketWith([]).remove("NOPE")).toThrow(UnknownProductError);
	});
});
