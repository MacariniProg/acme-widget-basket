import type { BasketView, ProductView } from "@acme/core";

// Without VITE_API_URL the app talks to /api, which the MSW mock answers in development.
const baseUrl = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${baseUrl}${path}`, init);
	if (!response.ok) {
		throw new ApiError(
			response.status,
			`${init?.method ?? "GET"} ${path} failed with ${response.status}`,
		);
	}
	return (await response.json()) as T;
}

const json = (body: unknown): RequestInit => ({
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(body),
});

export const api = {
	products: () => request<ProductView[]>("/products"),
	createBasket: () => request<BasketView>("/baskets", { method: "POST" }),
	basket: (id: string) => request<BasketView>(`/baskets/${id}`),
	// The client only sends the product code. Prices and totals come back from the server.
	addItem: (basketId: string, code: string) =>
		request<BasketView>(`/baskets/${basketId}/items`, json({ code })),
};
