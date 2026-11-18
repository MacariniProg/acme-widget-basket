import type { BasketView } from "@acme/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api } from "@/lib/api";

const basketKey = ["basket"] as const;
const storageKey = "acme.basketId";

// localStorage can throw (private mode, blocked storage). Losing the id only means a new basket.
function readBasketId() {
	try {
		return localStorage.getItem(storageKey);
	} catch {
		return null;
	}
}

function saveBasketId(id: string) {
	try {
		localStorage.setItem(storageKey, id);
	} catch {}
}

async function createBasket() {
	const basket = await api.createBasket();
	saveBasketId(basket.id);
	return basket;
}

/** The saved basket, or a new one when there is none or the saved one is gone (404). */
async function loadBasket(): Promise<BasketView> {
	const id = readBasketId();
	if (id) {
		try {
			return await api.basket(id);
		} catch (error) {
			if (!(error instanceof ApiError && error.status === 404)) throw error;
		}
	}
	return createBasket();
}

export function useProducts() {
	return useQuery({ queryKey: ["products"], queryFn: api.products });
}

export function useBasket() {
	return useQuery({ queryKey: basketKey, queryFn: loadBasket });
}

export function useAddItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ basketId, code }: { basketId: string; code: string }) =>
			api.addItem(basketId, code),
		// The response is the whole basket, so it replaces the cache without a refetch.
		onSuccess: (basket) => queryClient.setQueryData(basketKey, basket),
	});
}

/** "Empty basket" starts a new basket (BR-10). */
export function useEmptyBasket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBasket,
		onSuccess: (basket) => queryClient.setQueryData(basketKey, basket),
	});
}
