import { AlertCircleIcon } from "lucide-react";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BasketSummary } from "@/features/basket/basket-summary";
import { useBasket, useOffers, useProducts } from "@/features/basket/hooks";
import { OfferList } from "@/features/basket/offer-list";
import { ProductList } from "@/features/basket/product-list";

export default function App() {
	const products = useProducts();
	const basket = useBasket();
	const offers = useOffers();
	const failed = products.isError || basket.isError || offers.isError;

	return (
		<div className="min-h-svh">
			<header className="border-b bg-card">
				<div className="mx-auto max-w-[1040px] px-4 py-4 sm:px-6">
					<p className="text-lg font-semibold">Acme Widget Co</p>
				</div>
			</header>

			<main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
				{failed ? (
					<Alert variant="destructive">
						<AlertCircleIcon />
						<AlertTitle>Can't load the shop</AlertTitle>
						<AlertDescription>The server didn't respond.</AlertDescription>
						<AlertAction>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									products.refetch();
									basket.refetch();
									offers.refetch();
								}}
							>
								Try again
							</Button>
						</AlertAction>
					</Alert>
				) : (
					<div className="grid gap-8 md:grid-cols-12 md:items-start">
						<section
							className="md:col-span-7"
							aria-labelledby="widgets-heading"
						>
							<h1 id="widgets-heading" className="mb-4 text-xl font-semibold">
								Widgets
							</h1>
							<div className="flex flex-col gap-4">
								<OfferList offers={offers.data} products={products.data} />
								<ProductList products={products.data} basket={basket.data} />
							</div>
						</section>
						<BasketSummary
							basket={basket.data}
							className="md:sticky md:top-6 md:col-span-5"
						/>
					</div>
				)}
			</main>

			{/* The generated wrapper follows next-themes, which would track the OS theme without this. */}
			<Toaster theme="light" />
		</div>
	);
}
