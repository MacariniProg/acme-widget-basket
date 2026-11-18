import {
	acmeConfig,
	Basket,
	type BasketView,
	productViews,
	UnknownProductError,
} from "@acme/core";
import { HttpResponse, http } from "msw/http";
import { apiBaseUrl } from "@/lib/api";

// A fake API for development and tests, answering the contract in docs/design/screens.md.
// It runs the real Basket from @acme/core, so every total is correct.
// shortcut: baskets live in memory and vanish on reload; the real API (Stage 5) keeps them in Postgres.
const baskets = new Map<string, string[]>();

function view(id: string, codes: string[]): BasketView {
	const basket = new Basket(acmeConfig);
	for (const code of codes) basket.add(code);
	return { id, ...basket.summary() };
}

const notFound = () =>
	HttpResponse.json({ message: "Basket not found" }, { status: 404 });

export const handlers = [
	http.get(`${apiBaseUrl}/products`, () =>
		HttpResponse.json(productViews(acmeConfig)),
	),

	http.post(`${apiBaseUrl}/baskets`, () => {
		const id = crypto.randomUUID();
		baskets.set(id, []);
		return HttpResponse.json(view(id, []), { status: 201 });
	}),

	http.get<{ id: string }>(`${apiBaseUrl}/baskets/:id`, ({ params }) => {
		const codes = baskets.get(params.id);
		return codes ? HttpResponse.json(view(params.id, codes)) : notFound();
	}),

	http.post<{ id: string }>(
		`${apiBaseUrl}/baskets/:id/items`,
		async ({ params, request }) => {
			const codes = baskets.get(params.id);
			if (!codes) return notFound();
			const body = (await request.json().catch(() => null)) as {
				code?: unknown;
			} | null;
			if (typeof body?.code !== "string") {
				return HttpResponse.json(
					{ message: "code must be a string" },
					{ status: 422 },
				);
			}
			try {
				const updated = [...codes, body.code];
				const result = view(params.id, updated); // throws on an unknown code before saving it
				baskets.set(params.id, updated);
				return HttpResponse.json(result);
			} catch (error) {
				if (error instanceof UnknownProductError) {
					return HttpResponse.json({ message: error.message }, { status: 400 });
				}
				throw error;
			}
		},
	),
];

/** Test helper: forget every basket between tests. */
export const resetMockBaskets = () => baskets.clear();
