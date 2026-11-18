import type { BasketView, ProductView } from "@acme/core";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
	Item,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCents } from "@/lib/money";
import { useAddItem, usePendingDelta, useRemoveItem } from "./hooks";

type Props = { products?: ProductView[]; basket?: BasketView };

export function ProductList({ products, basket }: Props) {
	if (!products) {
		return (
			<div className="flex flex-col gap-3">
				{[1, 2, 3].map((n) => (
					<Skeleton key={n} className="h-24 w-full" />
				))}
			</div>
		);
	}

	return (
		<ItemGroup className="gap-3">
			{products.map((product) => (
				<ProductRow
					key={product.code}
					product={product}
					basketId={basket?.id}
					quantity={
						basket?.items.find((item) => item.code === product.code)
							?.quantity ?? 0
					}
				/>
			))}
		</ItemGroup>
	);
}

const retry = { description: "The server didn't respond. Try again." };

function ProductRow({
	product,
	basketId,
	quantity: savedQuantity,
}: {
	product: ProductView;
	basketId?: string;
	quantity: number;
}) {
	const add = useAddItem();
	const remove = useRemoveItem();
	// Optimistic: the number moves on click. The receipt waits for the server, which owns the prices and offers.
	const quantity = savedQuantity + usePendingDelta(product.code);

	// Going from 0 to 1 (or 1 to 0) swaps the controls. Move focus to the new control so keyboard users don't lose their place.
	const addButton = useRef<HTMLButtonElement>(null);
	const plusButton = useRef<HTMLButtonElement>(null);
	const restoreFocus = useRef(false);
	useEffect(() => {
		if (!restoreFocus.current) return;
		restoreFocus.current = false;
		(quantity === 0 ? addButton : plusButton).current?.focus();
	}, [quantity]);

	function onAdd() {
		if (!basketId) return;
		restoreFocus.current = quantity === 0;
		add.mutate(
			{ basketId, code: product.code },
			{ onError: () => toast.error(`${product.name} wasn't added`, retry) },
		);
	}

	function onRemove() {
		if (!basketId) return;
		restoreFocus.current = quantity === 1;
		remove.mutate(
			{ basketId, code: product.code },
			{ onError: () => toast.error(`${product.name} wasn't removed`, retry) },
		);
	}

	return (
		// Two rows on a grid, like a receipt line: name and price share the first row, code and controls the second.
		<Item
			variant="outline"
			role="listitem"
			className="grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] gap-x-3 gap-y-1.5 bg-card p-4 sm:gap-x-4 sm:px-5"
		>
			<span
				aria-hidden="true"
				className="row-span-2 block size-12 self-center rounded-md sm:size-14"
				style={{
					background: `var(--widget-${product.code.toLowerCase()}, var(--muted))`,
				}}
			/>
			<ItemTitle className="line-clamp-none self-end text-xl leading-tight font-semibold">
				{product.name}
			</ItemTitle>
			<span className="self-end justify-self-end text-xl leading-tight font-semibold tabular-nums">
				{formatCents(product.price)}
			</span>
			<ItemDescription className="self-start">{product.code}</ItemDescription>
			<div className="self-start justify-self-end">
				{quantity === 0 ? (
					<Button
						ref={addButton}
						variant="outline"
						disabled={!basketId}
						onClick={onAdd}
					>
						Add to basket
						<span className="sr-only">: {product.name}</span>
					</Button>
				) : (
					<ButtonGroup aria-label={`${product.name} in basket`}>
						<Button
							variant="outline"
							size="icon"
							aria-label={`Remove one ${product.name}`}
							onClick={onRemove}
						>
							<MinusIcon />
						</Button>
						<ButtonGroupText className="min-w-11 justify-center bg-card tabular-nums">
							<span aria-live="polite">{quantity}</span>
						</ButtonGroupText>
						<Button
							ref={plusButton}
							variant="outline"
							size="icon"
							aria-label={`Add one ${product.name}`}
							onClick={onAdd}
						>
							<PlusIcon />
						</Button>
					</ButtonGroup>
				)}
			</div>
		</Item>
	);
}
