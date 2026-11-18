import type { Offer } from "./basket.js";

/** Buy one, get the second half price, once per pair (BR-04). */
export function secondHalfPrice(code: string, label: string): Offer {
	return {
		label,
		discount: (items) => {
			const matches = items.filter((item) => item.code === code);
			const pairs = Math.floor(matches.length / 2);
			// Half a cent goes to the customer (BR-05): ceil(3295 / 2) = 1648.
			return pairs * Math.ceil((matches[0]?.price ?? 0) / 2);
		},
	};
}
