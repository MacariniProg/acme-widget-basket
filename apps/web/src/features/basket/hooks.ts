import type { BasketView } from "@acme/core";
import {
	useMutation,
	useMutationState,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
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

export function useOffers() {
	return useQuery({ queryKey: ["offers"], queryFn: api.offers });
}

export function useBasket() {
	return useQuery({ queryKey: basketKey, queryFn: loadBasket });
}

export function useAddItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["basket", "add"],
		mutationFn: ({ basketId, code }: { basketId: string; code: string }) =>
			api.addItem(basketId, code),
		// Adds run one at a time, so a slow response can't overwrite a newer basket.
		scope: { id: "basket" },
		// The response is the whole basket, so it replaces the cache without a refetch.
		onSuccess: (basket) => queryClient.setQueryData(basketKey, basket),
	});
}

/** Takes one unit out (BR-10). Shares the add queue so adds and removes keep their order. */
export function useRemoveItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["basket", "remove"],
		mutationFn: ({ basketId, code }: { basketId: string; code: string }) =>
			api.removeItem(basketId, code),
		scope: { id: "basket" },
		onSuccess: (basket) => queryClient.setQueryData(basketKey, basket),
	});
}

/** "Empty basket" starts a new basket (BR-10). */
export function useEmptyBasket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBasket,
		// Same queue as add and remove: emptying waits for clicks already sent.
		scope: { id: "basket" },
		onSuccess: (basket) => queryClient.setQueryData(basketKey, basket),
	});
}

type ItemVariables = { basketId: string; code: string };

/**
 * Units of `code` added (+) or removed (-) by requests still in flight. The quantity controls show
 * server quantity + this, so a click shows at once. A failed request drops out and the number rolls back.
 */
export function usePendingDelta(code: string) {
	const codeOf = (mutation: { state: { variables: unknown } }) =>
		(mutation.state.variables as ItemVariables).code;
	const adding = useMutationState({
		filters: { mutationKey: ["basket", "add"], status: "pending" },
		select: codeOf,
	});
	const removing = useMutationState({
		filters: { mutationKey: ["basket", "remove"], status: "pending" },
		select: codeOf,
	});
	return (
		adding.filter((c) => c === code).length -
		removing.filter((c) => c === code).length
	);
}
