import type { Cents } from "@acme/core";

const usd = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

/** 5437 → "$54.37". Money stays in cents everywhere else (BR-02). */
export const formatCents = (cents: Cents) => usd.format(cents / 100);
