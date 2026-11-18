# Screens

One page: the widget catalogue and the basket. This doc describes every state of that page, the shadcn/ui components it uses, the business rules it shows (`BR-NN`, see `docs/business-rules.md`) and the data it needs from the API.

Component names follow [ui.shadcn.com](https://ui.shadcn.com/docs/components) (checked 2026-11-18).

## Design direction

- **Who and what for.** A customer buying widgets, and an evaluator reading the code. The page's job: add widgets and see exactly why the total is what it is.
- **The one memorable thing: the receipt.** The basket summary lays the math out the same way BR-07 does (subtotal, minus offer, plus delivery, equals total), with every amount right-aligned in tabular figures. When delivery can get cheaper, one line says how much more to spend. That line comes from the brief's own words: delivery costs are reduced "to incentivise customers to spend more".
- **Products read like a parts catalogue.** The code (`R01`) is the large text and the name sits under it, because codes are how the brief, the API and the basket refer to products.
- **Colour comes from the products only.** Red, green and blue are the widgets. They appear as swatches and nowhere else. The interface itself is ink on cool grey.
- **Everything else stays quiet.** No hero, no marketing copy, no decorative motion. The only animation is the Spinner while a request is running.

### Theme tokens

shadcn CSS variables, set in `apps/web/src/index.css`.

| Token | Value |
|---|---|
| `--background` | `#F3F5F7` |
| `--foreground` | `#1B2338` |
| `--card` | `#FFFFFF` |
| `--primary` | `#1B2338` |
| `--primary-foreground` | `#FFFFFF` |
| `--secondary` | `#E6E9EE` |
| `--muted` | `#E6E9EE` |
| `--muted-foreground` | `#596173` |
| `--border` / `--input` | `#D5DAE1` |
| `--ring` | `#2D6CD3` |
| `--destructive` | `#B42318` |
| `--radius` | `0.5rem` |

Extra tokens for product swatches only (not in shadcn):

| Token | Value |
|---|---|
| `--widget-r01` | `#D63A3A` |
| `--widget-g01` | `#2E9A5C` |
| `--widget-b01` | `#2D6CD3` |

The swatch token is picked by product code. A product without a token gets `--muted`.
Light theme only. *(shortcut: no dark mode, add the `.dark` token set if asked)*

### Type

- One family: **IBM Plex Sans** (Google Fonts), weights 400, 500, 600. Industrial and plain, fits a widget maker, and has tabular figures.
- All money uses `font-variant-numeric: tabular-nums` so amounts line up in the receipt.
- Scale: 14 / 16 / 20 / 28 / 40 px. Body 16. Product code 28 semibold. Basket total 40 semibold.
- Sentence case everywhere. No all-caps labels.

### Layout

- Content max width 1040px, centred on the page, text left-aligned.
- From `md` (768px) up: two columns, 7/12 catalogue and 5/12 basket. The basket Card is sticky at the top.
- Below `md`: one column, catalogue first, basket under it. With three products the basket is still near the first screen, so there is no sticky mobile bar.

## Components

| Where | shadcn component |
|---|---|
| Product list | `ItemGroup`, `Item` (outline), `ItemSeparator` |
| Product parts | `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions` |
| Offer and quantity tags | `Badge` (secondary) |
| Add button | `Button` (outline) + `Spinner` |
| Basket | `Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardContent`, `CardFooter` |
| Empty basket button | `Button` (ghost, sm) |
| Receipt lines | `Separator` |
| Empty state | `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription` |
| Loading | `Skeleton` |
| Load error | `Alert` (destructive), `AlertTitle`, `AlertDescription` |
| Add error | `Toast` (`Toaster`, `toast.add` with `type: "error"`) |

Install: `pnpm dlx shadcn@latest add item badge button spinner card separator empty skeleton alert toast`

## States

Wireframe legend: `[Text]` is a Button, `(Text)` a Badge, `[##]` a colour swatch.

### S1. Basket with an offer (main state)

Basket: R01, R01. Shows BR-04, BR-05, BR-06, BR-07.

```
+------------------------------------------------------------------------+
| Acme Widget Co                                                         |
+------------------------------------------------------------------------+
| Widgets                                 | Basket          [Empty basket]|
|                                         |                               |
| +-------------------------------------+ | 2 x Red Widget         $65.90 |
| | [##]  R01          $32.95           | | ----------------------------- |
| | red   Red Widget                    | | Subtotal               $65.90 |
| |       (Second one half price)       | | Offer discount        -$16.48 |
| |       (2 in basket) [Add to basket] | | Delivery                $4.95 |
| +-------------------------------------+ | ----------------------------- |
| | [##]  G01          $24.95           | | Total                         |
| | green Green Widget  [Add to basket] | |                       $54.37  |
| +-------------------------------------+ |                               |
| | [##]  B01           $7.95           | | Spend $0.58 more to pay $2.95 |
| | blue  Blue Widget   [Add to basket] | | for delivery.                 |
| +-------------------------------------+ +-------------------------------+
```

- Product row: `ItemMedia` is a square swatch in the widget colour. `ItemTitle` is the code with the price right-aligned on the same line, `ItemDescription` the name. The Button sits in `ItemActions`.
- `Badge` "Second one half price" on products that have an offer (BR-04).
- `Badge` "2 in basket" once the product is in the basket, so adding gives feedback next to the button that was pressed.
- Receipt: one line per product with quantity and line amount at catalogue price, then subtotal, offer discount (only when above 0), delivery, total (BR-07).
- Delivery hint in `CardFooter`, `text-muted-foreground`. Only when a cheaper tier exists (BR-06). Next tier with a cost: "Spend $0.58 more to pay $2.95 for delivery." Next tier free: "Spend $32.10 more for free delivery."
- The total area has `aria-live="polite"`, so screen readers hear the new total after each add.
- Each Button has a visible label "Add to basket" and `aria-label="Add Red Widget to basket"`.

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

No offer discount line when the discount is 0.

### S3. Free delivery

Basket: B01, B01, R01, R01, R01. Shows BR-04 (3 reds give 1 discount), BR-06.

```
| Basket          [Empty basket]|
|                               |
| 3 x Red Widget         $98.85 |
| 2 x Blue Widget        $15.90 |
| ----------------------------- |
| Subtotal              $114.75 |
| Offer discount        -$16.48 |
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

### S6. Adding

While `POST /baskets/:id/items` runs.

```
| | [##]  R01          $32.95           |
| | red   Red Widget  [(o) Adding...  ] |
```

- Only the pressed Button is disabled and shows `<Spinner data-icon="inline-start" />` "Adding". The other products stay clickable.
- The receipt keeps the old numbers until the response arrives. No optimistic update, because the total comes from the server.

### S7. Add failed

The request fails (network or 5xx).

- `toast.add({ type: "error", title: "Red Widget wasn't added", description: "The server didn't respond. Try again." })`
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
| [##] R01             $32.95  |
|      Red Widget              |
|      (Second one half price) |
|      [Add to basket]         |
| ---------------------------- |
| [##] G01             $24.95  |
|      Green Widget            |
|      [Add to basket]         |
| ---------------------------- |
| [##] B01              $7.95  |
|      Blue Widget             |
|      [Add to basket]         |
+------------------------------+
| Basket       [Empty basket]  |
| ...same receipt as S1...     |
+------------------------------+
```

The Button moves under the name and takes the full row width, so the touch target is large.

## Data the screens need (API contract)

All amounts are integer cents (BR-02). The UI formats them with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.

```ts
type ProductView = {
  code: string;          // "R01"
  name: string;          // "Red Widget"
  price: number;         // 3295
  offer: string | null;  // "Second one half price", badge text (S1)
};

type BasketView = {
  id: string;            // uuid, saved in localStorage
  items: { code: string; name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;      // 0 hides the offer line (S2)
  delivery: number;      // 0 shows "Free" (S3)
  total: number;
  nextDelivery: { spend: number; cost: number } | null; // hint line (S1, S2), null when already free
};
```

| Screen need | Endpoint |
|---|---|
| Catalogue (S1, S5) | `GET /products` → `ProductView[]` |
| New or emptied basket (S4) | `POST /baskets` → `BasketView` |
| Saved basket on reload | `GET /baskets/:id` → `BasketView` (404 → new basket) |
| Add (S6, S7) | `POST /baskets/:id/items` `{ code }` → `BasketView` |

### Discounts and offers come from the API

- The client only sends a product code. Prices, discounts, delivery and totals are computed on the server and are never read from the request, so a client can't send its own price or discount.
- Offers are data (an `offers` table, see the plan), and the badge text comes from `ProductView.offer`. Changing or switching off an offer of an existing kind is a data change, with no front-end change.
- A new kind of offer (e.g. "3 for 2") is still a new function in `packages/core`. The front-end doesn't change.
- Admin screens to manage offers are out of scope.
- Open, decide in Stage 3: `discount` is one number shown as "Offer discount". If several offers can apply at once, return `discounts: { label: string; amount: number }[]` instead, so the receipt shows one line per offer with its name.

### Delivery hint

`nextDelivery` is the only field the brief doesn't need. It is computed in `packages/core` from the delivery tiers, so the UI never repeats a business rule.

Checks for the four brief examples:

| Basket | subtotal | discount | delivery | total | nextDelivery |
|---|---|---|---|---|---|
| B01, G01 | 3290 | 0 | 495 | 3785 | 1710 → 295 |
| R01, R01 | 6590 | 1648 | 495 | 5437 | 58 → 295 |
| R01, G01 | 5790 | 0 | 295 | 6085 | 3210 → 0 |
| B01, B01, R01, R01, R01 | 11475 | 1648 | 0 | 9827 | null |
