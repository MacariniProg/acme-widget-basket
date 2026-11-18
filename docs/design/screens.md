# Screens

One page: the widget catalogue and the basket. This doc describes every state of that page, the shadcn/ui components it uses, the business rules it shows (`BR-NN`, see `docs/business-rules.md`) and the data it needs from the API.

Component names follow [ui.shadcn.com](https://ui.shadcn.com/docs/components) (checked 2026-11-18).

## Design direction

- **Who and what for.** A customer buying widgets, and an evaluator reading the code. The page's job: add widgets and see exactly why the total is what it is.
- **The one memorable thing: the receipt.** The basket summary lays the math out the same way BR-07 does (subtotal, minus offer, plus delivery, equals total), with every amount right-aligned in tabular figures. When delivery can get cheaper, one line says how much more to spend. That line comes from the brief's own words: delivery costs are reduced "to incentivise customers to spend more".
- **Products lead with their name.** Customers shop by name, so the name is the large text. The code (`R01`) sits under it, small and muted, as a reference.
- **Colour comes from the products only.** Red, green and blue are the widgets. They appear as swatches and nowhere else. The interface itself is ink on cool grey.
- **Everything else stays quiet.** No hero, no marketing copy, no decorative motion. The only animation is the Spinner while a request is running.

### Theme tokens

shadcn CSS variables, set in `apps/web/src/index.css`.

| Token                  | Value     |
| ---------------------- | --------- |
| `--background`         | `#F3F5F7` |
| `--foreground`         | `#1B2338` |
| `--card`               | `#FFFFFF` |
| `--primary`            | `#1B2338` |
| `--primary-foreground` | `#FFFFFF` |
| `--secondary`          | `#E6E9EE` |
| `--muted`              | `#E6E9EE` |
| `--muted-foreground`   | `#596173` |
| `--border` / `--input` | `#D5DAE1` |
| `--ring`               | `#2D6CD3` |
| `--destructive`        | `#B42318` |
| `--radius`             | `0.5rem`  |

Extra tokens for product swatches only (not in shadcn):

| Token          | Value     |
| -------------- | --------- |
| `--widget-r01` | `#D63A3A` |
| `--widget-g01` | `#2E9A5C` |
| `--widget-b01` | `#2D6CD3` |

The swatch token is picked by product code. A product without a token gets `--muted`.
Light theme only. _(shortcut: no dark mode, add the `.dark` token set if asked)_

### Type

- One family: **IBM Plex Sans** (Google Fonts), weights 400, 500, 600. Industrial and plain, fits a widget maker, and has tabular figures.
- All money uses `font-variant-numeric: tabular-nums` so amounts line up in the receipt.
- Scale: 14 / 16 / 20 / 40 px. Body 16. Product name and price 20 semibold, code 14 muted. Basket total 40 semibold.
- Sentence case everywhere. No all-caps labels.

### Layout

- Content max width 1040px, centred on the page, text left-aligned.
- From `md` (768px) up: two columns, 7/12 catalogue and 5/12 basket. The basket Card is sticky at the top.
- Below `md`: one column, catalogue first, basket under it. With three products the basket is still near the first screen, so there is no sticky mobile bar.

## Components

| Where                      | shadcn component                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Product list               | `ItemGroup`, `Item` (outline, `role="listitem"`)                                           |
| Product parts              | `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`                  |
| Offers above the catalogue | `ItemGroup`, `Item` (highlight, a variant added to the generated file), `ItemMedia` (icon) |
| Quantity controls          | `ButtonGroup`, `ButtonGroupText`, `Button` (outline, icon)                                 |
| Add button                 | `Button` (outline) + `Spinner`                                                             |
| Basket                     | `Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardContent`, `CardFooter`               |
| Empty basket button        | `Button` (destructive, sm)                                                                 |
| Receipt lines              | `Separator`                                                                                |
| Empty state                | `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`                                   |
| Loading                    | `Skeleton`                                                                                 |
| Load error                 | `Alert` (destructive), `AlertTitle`, `AlertDescription`                                    |
| Add error                  | `Sonner` (`Toaster` from `@/components/ui/sonner`, `toast.error`)                          |

Install: `pnpm dlx shadcn@latest add item button button-group spinner card separator empty skeleton alert sonner`

The shadcn `Toast` component only exists for Base UI projects. This project uses Radix, so errors use `Sonner`. Render it as `<Toaster theme="light" />`: the generated wrapper reads the theme from `next-themes`, and without a provider it would follow the OS dark mode.

## States

Wireframe legend: `[Text]` is a Button, `[-] 2 [+]` the quantity controls, `[##]` a colour swatch, `(%)` the offer icon.

### S1. Basket with an offer (main state)

Basket: R01, R01. Shows BR-04, BR-05, BR-06, BR-07.

```
+------------------------------------------------------------------------+
| Acme Widget Co                                                         |
+------------------------------------------------------------------------+
| Widgets                                 | Basket          [Empty basket]|
| +-------------------------------------+ |                               |
| | (%) Buy one Red Widget, get the     | | 2 x Red Widget         $65.90 |
| |     second half price.              | | ----------------------------- |
| +-------------------------------------+ | Subtotal               $65.90 |
| +-------------------------------------+ | Red Widget offer      -$16.48 |
| | [##]  R01                   $32.95  | | Delivery                $4.95 |
| | red   Red Widget        [-] 2 [+]   | | ----------------------------- |
| +-------------------------------------+ | Total                 $54.37  |
| | [##]  G01                   $24.95  | |                               |
| | green Green Widget  [Add to basket] | | Spend $0.58 more to pay $2.95 |
| +-------------------------------------+ | for delivery.                 |
| | [##]  B01                    $7.95  | +-------------------------------+
| | blue  Blue Widget   [Add to basket] |
| +-------------------------------------+
```

- Product row: a two-row grid inside `Item`, like a receipt line. Row 1: name (`ItemTitle`) and price, sharing a baseline. Row 2: code (`ItemDescription`, small, muted) and the Button or quantity controls. The swatch spans both rows (56px, 48px on mobile). Spacing: 16px swatch to text (12px on mobile), 6px between rows, 20px side padding (16px on mobile).
- Offers sit above the catalogue, one `Item` (variant `highlight`, light blue) per offer with its description (from `GET /offers`). Product names in the text take their widget colour, mixed with 30% ink so each stays above 4.5:1 contrast. An offer can span several products (e.g. "one red, one green and one blue"), so it isn't a badge on one product.
- With 0 in the basket the row shows "Add to basket". From 1 up it shows the quantity between a minus and a plus Button (`ButtonGroup`). Minus at 1 takes the product out and the row goes back to "Add to basket" (BR-10).
- When the controls swap (0 → 1 or 1 → 0), focus moves to the new control, so keyboard users keep their place.
- "Empty basket" is a destructive (red) Button.
- Receipt: one line per product with quantity and line amount at catalogue price, then subtotal, one line per entry in `discounts` with its label, delivery, total (BR-07).
- Delivery hint in `CardFooter`, `text-muted-foreground`. Only when a cheaper tier exists (BR-06). Next tier with a cost: "Spend $0.58 more to pay $2.95 for delivery." Next tier free: "Spend $32.10 more for free delivery."
- The total area has `aria-live="polite"`, so screen readers hear the new total after each add.
- "Add to basket" carries the product name as screen-reader-only text, so its accessible name is "Add to basket: Red Widget" and still starts with the visible label. The icon Buttons are named "Add one Red Widget" and "Remove one Red Widget".

### S2. Basket without an offer

Basket: B01, G01. Shows BR-06, BR-07.

```
| Basket          [Empty basket]|
|                               |
| 1 x Green Widget       $24.95 |
| 1 x Blue Widget         $7.95 |
| ----------------------------- |
| Subtotal               $32.90 |
| Delivery                $4.95 |
| ----------------------------- |
| Total                 $37.85  |
|                               |
| Spend $17.10 more to pay      |
| $2.95 for delivery.           |
```

No offer line when `discounts` is empty.

### S3. Free delivery

Basket: B01, B01, R01, R01, R01. Shows BR-04 (3 reds give 1 discount), BR-06.

```
| Basket          [Empty basket]|
|                               |
| 3 x Red Widget         $98.85 |
| 2 x Blue Widget        $15.90 |
| ----------------------------- |
| Subtotal              $114.75 |
| Red Widget offer      -$16.48 |
| Delivery                 Free |
| ----------------------------- |
| Total                 $98.27  |
```

Delivery reads "Free", not "$0.00". No hint line.

### S4. Empty basket

First visit, or after "Empty basket". Shows BR-08.

```
| Basket                        |
|                               |
|   Your basket is empty        |
|   Add a widget to see your    |
|   total.                      |
```

- `Empty` inside `CardContent`. No receipt, no "Empty basket" button.
- "Empty basket" starts a new basket (BR-10). No confirmation dialog: three widgets are quick to add back.

### S5. Loading

First load, before products and basket arrive.

```
| Widgets                                 | Basket                        |
| [skeleton row                         ] | [skeleton line              ] |
| [skeleton row                         ] | [skeleton line              ] |
| [skeleton row                         ] | [skeleton line              ] |
```

`Skeleton` with the same height as each real row, so the page doesn't jump when data arrives.

### S6. Adding or removing

While `POST /baskets/:id/items` or `DELETE /baskets/:id/items/:code` runs.

- Optimistic, with no Spinner and no disabled Buttons: the quantity changes on click (saved quantity + requests in flight).
- The receipt keeps the server's numbers and changes once, when the response arrives. The front-end never computes offers or delivery, so it never shows a half-updated total.
- Adds and removes run one at a time, in click order, so a slow response can't overwrite a newer basket. "Empty basket" waits in the same queue.
- If a request fails, its unit drops out of the count (the number rolls back) and S7 shows the toast.

### S7. Add failed

The request fails (network or 5xx).

- `toast.error("Red Widget wasn't added", { description: "The server didn't respond. Try again." })`
- The basket doesn't change.

### S8. Page failed to load

`GET /products` or the basket request fails.

```
| [!] Can't load the shop                                   |
|     The server didn't respond.          [Try again]       |
```

- `Alert` variant `destructive` in place of both columns, with a `Button` "Try again" that refetches.
- A saved basket id that returns 404 (old or deleted basket) is not an error: the page creates a new basket and shows S4.

### S9. Mobile (below 768px)

```
+------------------------------+
| Acme Widget Co               |
+------------------------------+
| Widgets                      |
| (%) Buy one Red Widget, get   |
|     the second half price.   |
| [##] R01             $32.95  |
|      Red Widget  [-] 2 [+]   |
| ---------------------------- |
| [##] G01             $24.95  |
|      Green   [Add to basket] |
|      Widget                  |
| ---------------------------- |
| [##] B01              $7.95  |
|      Blue    [Add to basket] |
|      Widget                  |
+------------------------------+
| Basket       [Empty basket]  |
| ...same receipt as S1...     |
+------------------------------+
```

Same grid as desktop with a smaller swatch and gaps. On very narrow screens (320px) the product name wraps to two lines and the price stays on its first line.

## Data the screens need (API contract)

All amounts are integer cents (BR-02). The UI formats them with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.

The types live in `packages/core/src/index.ts` (`ProductView`, `OfferView`, `BasketView`, `DiscountView`). In short:

```ts
type ProductView = { code; name; price };
type OfferView = { label; description }; // shown above the catalogue (S1)
type BasketView = {
	id; // uuid, saved in localStorage
	items: { code; name; quantity; lineTotal }[];
	subtotal;
	discounts: { label; amount }[]; // one receipt line per offer, empty hides it (S2)
	delivery; // 0 shows "Free" (S3)
	total;
	nextDelivery: { spend; cost } | null; // hint line (S1, S2), null when already free
};
```

| Screen need                | Endpoint                                             |
| -------------------------- | ---------------------------------------------------- |
| Catalogue (S1, S5)         | `GET /products` → `ProductView[]`                    |
| Offers (S1)                | `GET /offers` → `OfferView[]`                        |
| New or emptied basket (S4) | `POST /baskets` → `BasketView`                       |
| Saved basket on reload     | `GET /baskets/:id` → `BasketView` (404 → new basket) |
| Add (S6, S7)               | `POST /baskets/:id/items` `{ code }` → `BasketView`  |
| Remove one (S6)            | `DELETE /baskets/:id/items/:code` → `BasketView`     |

### Discounts and offers come from the API

- The client only sends a product code. Prices, discounts, delivery and totals are computed on the server and are never read from the request, so a client can't send its own price or discount.
- Offers are data (an `offers` table, see the plan), and their text comes from `GET /offers`. Changing or switching off an offer of an existing kind is a data change, with no front-end change.
- A new kind of offer (e.g. "3 for 2") is still a new function in `packages/core`. The front-end doesn't change.
- Admin screens to manage offers are out of scope.
- Each applied offer is its own entry in `discounts`, with the label the receipt shows. Several offers at once need no front-end change.

### Delivery hint

`nextDelivery` is the only field the brief doesn't need. It is computed in `packages/core` from the delivery tiers, so the UI never repeats a business rule.

Checks for the four brief examples:

| Basket                  | subtotal | discounts | delivery | total | nextDelivery |
| ----------------------- | -------- | --------- | -------- | ----- | ------------ |
| B01, G01                | 3290     | none      | 495      | 3785  | 1710 → 295   |
| R01, R01                | 6590     | 1648      | 495      | 5437  | 58 → 295     |
| R01, G01                | 5790     | none      | 295      | 6085  | 3210 → 0     |
| B01, B01, R01, R01, R01 | 11475    | 1648      | 0        | 9827  | null         |
