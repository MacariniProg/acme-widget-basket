import type { OfferView, ProductView } from "@acme/core";
import { BadgePercentIcon } from "lucide-react";
import {
	Item,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { splitProductMentions } from "@/lib/product-mentions";

// The swatch colour alone is too light for text (green is 3.1:1); 30% ink brings every widget colour above 4.5:1.
const textColour = (code: string) =>
	`color-mix(in srgb, var(--widget-${code.toLowerCase()}, currentColor) 70%, var(--foreground))`;

/** Active offers, above the catalogue. An offer can span several products, so it gets its own place instead of a product badge. */
export function OfferList({
	offers,
	products = [],
}: {
	offers?: OfferView[];
	products?: ProductView[];
}) {
	if (!offers?.length) return null;
	return (
		<ItemGroup aria-label="Offers" className="gap-2">
			{offers.map((offer) => (
				<Item
					key={offer.label}
					role="listitem"
					variant="highlight"
					className="px-4"
				>
					<ItemMedia variant="icon">
						<BadgePercentIcon className="size-5" />
					</ItemMedia>
					<ItemContent>
						<ItemTitle className="line-clamp-none block text-base font-medium">
							<OfferText text={offer.description} products={products} />
						</ItemTitle>
					</ItemContent>
				</Item>
			))}
		</ItemGroup>
	);
}

function OfferText({
	text,
	products,
}: {
	text: string;
	products: ProductView[];
}) {
	let offset = 0; // position in the text: a stable key for each part
	return splitProductMentions(text, products).map((part) => {
		const key = offset;
		offset += part.text.length;
		return part.code ? (
			<span
				key={key}
				className="font-semibold"
				style={{ color: textColour(part.code) }}
			>
				{part.text}
			</span>
		) : (
			<span key={key}>{part.text}</span>
		);
	});
}
