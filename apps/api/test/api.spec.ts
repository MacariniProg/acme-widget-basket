import { acmeConfig, offerViews, productViews } from "@acme/core";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp } from "./app.js";

let app: INestApplication;
const http = () => request(app.getHttpServer());

beforeAll(async () => {
	app = await createTestApp();
});
afterAll(() => app.close());

async function basketWith(...codes: string[]) {
	const { body } = await http().post("/baskets").expect(201);
	for (const code of codes) {
		await http().post(`/baskets/${body.id}/items`).send({ code }).expect(200);
	}
	return body.id as string;
}

describe("catalogue", () => {
	// The seed migration and acmeConfig hold the same data; this catches drift.
	it("GET /products returns the brief's catalogue in order", async () => {
		const { body } = await http().get("/products").expect(200);
		expect(body).toEqual(productViews(acmeConfig));
	});

	it("GET /offers returns the active offers", async () => {
		const { body } = await http().get("/offers").expect(200);
		expect(body).toEqual(offerViews(acmeConfig));
	});

	it("GET /health checks the database", async () => {
		await http().get("/health").expect(200, { status: "ok" });
	});
});

describe("the four baskets from the brief", () => {
	it.each([
		[["B01", "G01"], 3785],
		[["R01", "R01"], 5437],
		[["R01", "G01"], 6085],
		[["B01", "B01", "R01", "R01", "R01"], 9827],
	])("%j totals %i cents", async (codes, total) => {
		const id = await basketWith(...codes);
		const { body } = await http().get(`/baskets/${id}`).expect(200);
		expect(body.total).toBe(total);
	});

	it("returns the whole BasketView, as the contract describes", async () => {
		const id = await basketWith("R01", "R01");
		const { body } = await http().get(`/baskets/${id}`).expect(200);
		expect(body).toEqual({
			id,
			items: [
				{ code: "R01", name: "Red Widget", quantity: 2, lineTotal: 6590 },
			],
			subtotal: 6590,
			discounts: [{ label: "Red Widget offer", amount: 1648 }],
			delivery: 495,
			total: 5437,
			nextDelivery: { spend: 58, cost: 295 },
		});
	});
});

describe("baskets", () => {
	it("POST /baskets creates an empty basket", async () => {
		const { body } = await http().post("/baskets").expect(201);
		expect(body).toMatchObject({ items: [], total: 0, nextDelivery: null });
	});

	it("answers 404 for a basket that doesn't exist", async () => {
		const missing = "00000000-0000-4000-8000-000000000000";
		await http().get(`/baskets/${missing}`).expect(404);
		await http()
			.post(`/baskets/${missing}/items`)
			.send({ code: "R01" })
			.expect(404);
		await http().delete(`/baskets/${missing}/items/R01`).expect(404);
	});

	it("answers 400 for an id that isn't a UUID", async () => {
		await http().get("/baskets/not-a-uuid").expect(400);
	});
});

describe("POST /baskets/:id/items", () => {
	it("rejects an unknown product code with 400 and saves nothing (BR-03)", async () => {
		const id = await basketWith("B01");
		const { body } = await http()
			.post(`/baskets/${id}/items`)
			.send({ code: "R99" })
			.expect(400);
		expect(body.message).toBe("Unknown product code: R99");
		const after = await http().get(`/baskets/${id}`);
		expect(after.body.items).toEqual([
			{ code: "B01", name: "Blue Widget", quantity: 1, lineTotal: 795 },
		]);
	});

	it.each([{}, { code: 1 }, { code: "" }])(
		"rejects the body %j with 422",
		async (body) => {
			const id = await basketWith();
			await http().post(`/baskets/${id}/items`).send(body).expect(422);
		},
	);

	it("ignores a price sent by the client", async () => {
		const id = await basketWith();
		const { body } = await http()
			.post(`/baskets/${id}/items`)
			.send({ code: "R01", price: 1 })
			.expect(200);
		expect(body.subtotal).toBe(3295);
	});
});

describe("DELETE /baskets/:id/items/:code", () => {
	it("takes one unit out", async () => {
		const id = await basketWith("R01", "R01", "G01");
		const { body } = await http()
			.delete(`/baskets/${id}/items/R01`)
			.expect(200);
		expect(body.items).toEqual([
			{ code: "R01", name: "Red Widget", quantity: 1, lineTotal: 3295 },
			{ code: "G01", name: "Green Widget", quantity: 1, lineTotal: 2495 },
		]);
		expect(body.discounts).toEqual([]);
	});

	it("changes nothing for a product the basket doesn't have (BR-10)", async () => {
		const id = await basketWith("B01");
		const { body } = await http()
			.delete(`/baskets/${id}/items/G01`)
			.expect(200);
		expect(body.total).toBe(795 + 495);
	});

	it("rejects an unknown product code with 400", async () => {
		const id = await basketWith();
		await http().delete(`/baskets/${id}/items/R99`).expect(400);
	});
});
