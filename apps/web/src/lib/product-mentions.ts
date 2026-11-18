export type Mention = { text: string; code?: string };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits offer text so the UI can colour each product name, e.g. "Red Widget" → R01. */
export function splitProductMentions(
	text: string,
	products: { code: string; name: string }[],
): Mention[] {
	if (products.length === 0) return [{ text }];
	// Longest names first, so "Red Widget XL" wins over "Red Widget".
	const byName = new Map(products.map((p) => [p.name, p.code]));
	const names = [...byName.keys()]
		.sort((a, b) => b.length - a.length)
		.map(escapeRegExp);
	return text
		.split(new RegExp(`(${names.join("|")})`))
		.filter(Boolean)
		.map((part) => {
			const code = byName.get(part);
			return code ? { text: part, code } : { text: part };
		});
}
