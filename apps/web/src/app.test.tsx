import { HttpResponse, http } from "msw/http";
import { describe, expect, test } from "vitest";
import { apiBaseUrl } from "@/lib/api";
import { renderApp } from "@/test/render-app";
import { server } from "@/test/setup";

// One test per screen state in docs/design/screens.md (S1-S9).

const addButton = (name: string) => ({
	name: new RegExp(`Add to basket.*${name}`),
});
const total = () => document.querySelector("dd .text-total")?.textContent;

async function startWith(codes: string[]) {
	const app = renderApp();
	const names: Record<string, string> = {
		R01: "Red Widget",
		G01: "Green Widget",
		B01: "Blue Widget",
	};
	for (const code of codes) {
		const name = names[code] ?? code;
		const plus = app.screen.queryByRole("button", { name: `Add one ${name}` });
		await app.user.click(
			plus ?? (await app.screen.findByRole("button", addButton(name))),
		);
	}
	return app;
}

describe("basket", () => {
	test("S4: a new visitor sees an empty basket", async () => {
		const { screen } = renderApp();
		expect(await screen.findByText("Your basket is empty")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Empty basket" }),
		).not.toBeInTheDocument();
	});

	test("S1: two reds show the offer line, the total and the delivery hint", async () => {
		const { screen } = await startWith(["R01", "R01"]);
		expect(await screen.findByText("Red Widget offer")).toBeInTheDocument();
		await expect.poll(total).toBe("$54.37");
		expect(
			screen.getByText("Spend $0.58 more to pay $2.95 for delivery."),
		).toBeInTheDocument();
	});

	test("S2: no offer line without a red pair", async () => {
		await startWith(["B01", "G01"]);
		await expect.poll(total).toBe("$37.85");
		expect(document.body).not.toHaveTextContent("Red Widget offer");
	});

	test("S3: the brief's last example has free delivery", async () => {
		const { screen } = await startWith(["B01", "B01", "R01", "R01", "R01"]);
		await expect.poll(total).toBe("$98.27");
		expect(screen.getByText("Free")).toBeInTheDocument();
	});

	test("offers are listed above the catalogue", async () => {
		const { screen } = renderApp();
		const offers = await screen.findByRole("list", { name: "Offers" });
		expect(offers).toHaveTextContent(
			"Buy one Red Widget, get the second half price.",
		);
	});
});

describe("quantity controls", () => {
	test("show the quantity after the first add, and minus at 1 goes back to Add (BR-10)", async () => {
		const { screen, user } = await startWith(["R01"]);
		expect(
			screen.getByRole("group", { name: "Red Widget in basket" }),
		).toHaveTextContent("1");

		await user.click(
			screen.getByRole("button", { name: "Remove one Red Widget" }),
		);

		const add = await screen.findByRole("button", addButton("Red Widget"));
		expect(add).toHaveFocus();
		expect(await screen.findByText("Your basket is empty")).toBeInTheDocument();
	});

	test("S6: the quantity moves on click, before the server answers", async () => {
		let answer: () => void = () => {};
		server.use(
			http.post(`${apiBaseUrl}/baskets/:id/items`, async () => {
				await new Promise<void>((resolve) => {
					answer = resolve;
				});
				return undefined; // fall through to the normal handler
			}),
		);
		const { screen, user } = renderApp();
		await user.click(
			await screen.findByRole("button", addButton("Red Widget")),
		);

		expect(
			screen.getByRole("group", { name: "Red Widget in basket" }),
		).toHaveTextContent("1");
		expect(screen.getByText("Your basket is empty")).toBeInTheDocument(); // receipt waits for the server
		answer();
		await expect.poll(total).toBe("$37.90");
	});

	test("S7: a failed add rolls the quantity back and shows a toast", async () => {
		server.use(
			http.post(
				`${apiBaseUrl}/baskets/:id/items`,
				() => new HttpResponse(null, { status: 500 }),
			),
		);
		const { screen, user } = renderApp();
		await user.click(
			await screen.findByRole("button", addButton("Red Widget")),
		);

		expect(
			await screen.findByText("Red Widget wasn't added"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", addButton("Red Widget")),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("group", { name: "Red Widget in basket" }),
		).not.toBeInTheDocument();
	});
});

describe("loading and errors", () => {
	test("S8: the page shows an error and recovers with Try again", async () => {
		server.use(
			http.get(
				`${apiBaseUrl}/products`,
				() => new HttpResponse(null, { status: 500 }),
				{ once: true },
			),
		);
		const { screen, user } = renderApp();

		expect(await screen.findByText("Can't load the shop")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Try again" }));
		expect(
			await screen.findByRole("button", addButton("Red Widget")),
		).toBeInTheDocument();
	});

	test("a saved basket that no longer exists is replaced by a new one", async () => {
		localStorage.setItem("acme.basketId", "gone");
		const { screen } = renderApp();
		expect(await screen.findByText("Your basket is empty")).toBeInTheDocument();
		expect(localStorage.getItem("acme.basketId")).not.toBe("gone");
	});

	test("Empty basket starts a new basket", async () => {
		const { screen, user } = await startWith(["G01"]);
		await user.click(
			await screen.findByRole("button", { name: "Empty basket" }),
		);
		expect(await screen.findByText("Your basket is empty")).toBeInTheDocument();
	});
});
