import type { BasketView } from "@acme/core";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCents } from "@/lib/money";
import { useEmptyBasket } from "./hooks";

function Line({
	label,
	children,
	strong,
}: {
	label: ReactNode;
	children: ReactNode;
	strong?: boolean;
}) {
	return (
		<div
			className={`flex items-baseline justify-between gap-4 ${strong ? "font-semibold" : ""}`}
		>
			<dt>{label}</dt>
			<dd className="tabular-nums">{children}</dd>
		</div>
	);
}

function deliveryHint({
	spend,
	cost,
}: NonNullable<BasketView["nextDelivery"]>) {
	return cost === 0
		? `Spend ${formatCents(spend)} more for free delivery.`
		: `Spend ${formatCents(spend)} more to pay ${formatCents(cost)} for delivery.`;
}

export function BasketSummary({
	basket,
	className,
}: {
	basket?: BasketView;
	className?: string;
}) {
	const emptyBasket = useEmptyBasket();
	const hasItems = (basket?.items.length ?? 0) > 0;

	return (
		<Card className={className} aria-labelledby="basket-heading">
			<CardHeader>
				<CardTitle id="basket-heading" className="text-xl font-semibold">
					<h2>Basket</h2>
				</CardTitle>
				{hasItems && (
					<CardAction>
						<Button
							variant="destructive"
							size="sm"
							disabled={emptyBasket.isPending}
							onClick={() =>
								emptyBasket.mutate(undefined, {
									onError: () =>
										toast.error("The basket wasn't emptied", {
											description: "The server didn't respond. Try again.",
										}),
								})
							}
						>
							Empty basket
						</Button>
					</CardAction>
				)}
			</CardHeader>

			<CardContent className="text-base">
				{!basket ? (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-2/3" />
					</div>
				) : !hasItems ? (
					<Empty className="p-4">
						<EmptyHeader>
							<EmptyTitle className="text-base">
								Your basket is empty
							</EmptyTitle>
							<EmptyDescription className="text-base">
								Add a widget to see your total.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<dl className="flex flex-col gap-2">
						{basket.items.map((item) => (
							<Line key={item.code} label={`${item.quantity} × ${item.name}`}>
								{formatCents(item.lineTotal)}
							</Line>
						))}
						<Separator className="my-2" />
						<Line label="Subtotal">{formatCents(basket.subtotal)}</Line>
						{basket.discounts.map((discount) => (
							<Line key={discount.label} label={discount.label}>
								{formatCents(-discount.amount)}
							</Line>
						))}
						<Line label="Delivery">
							{basket.delivery === 0 ? "Free" : formatCents(basket.delivery)}
						</Line>
						<Separator className="my-2" />
						<div aria-live="polite" aria-atomic="true">
							<Line label="Total" strong>
								<span className="text-total">{formatCents(basket.total)}</span>
							</Line>
						</div>
					</dl>
				)}
			</CardContent>

			{hasItems && basket?.nextDelivery && (
				<CardFooter className="text-muted-foreground">
					{deliveryHint(basket.nextDelivery)}
				</CardFooter>
			)}
		</Card>
	);
}
