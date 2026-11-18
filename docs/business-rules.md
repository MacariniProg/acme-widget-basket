# Business rules

The rules the basket follows. Each rule has an id (`BR-NN`) so tests, screens and specs can point to it.
Every rule says where it comes from: **brief** (the coding test) or **assumption** (a decision made here because the brief is silent or ambiguous).

## Glossary

- **Basket**: the list of products a customer has added.
- **Subtotal**: the sum of the catalogue prices of every item in the basket.
- **Discount**: the amount taken off by offers.
- **Delivery**: the delivery charge, chosen from the subtotal after discount.
- **Total**: what the customer pays.

## Configuration

The basket is created with three inputs: the product catalogue, the delivery tiers and the offers.
Nothing below is hard-coded in the basket. A new price, tier or offer is a configuration change. _(brief)_

## Rules

### BR-01. Product catalogue _(brief)_

| Code | Product      | Price  |
| ---- | ------------ | ------ |
| R01  | Red Widget   | $32.95 |
| G01  | Green Widget | $24.95 |
| B01  | Blue Widget  | $7.95  |

### BR-02. Money is integer cents _(assumption)_

All amounts are stored and calculated as whole cents ($32.95 = `3295`). Floating point is never used for money.
Amounts are formatted as dollars only when shown (UI) or returned (API).

### BR-03. Adding a product _(brief + assumption)_

- `add(code)` adds one unit of the product with that code. Adding the same code again adds another unit. _(brief)_
- A code that is not in the catalogue is rejected with an error. It is never silently ignored. _(assumption)_

### BR-04. Offer: buy one red widget, get the second half price _(brief + assumption)_

- The second red widget costs half price. _(brief)_
- The offer repeats for every pair of red widgets: 2 reds give 1 discount, 3 reds give 1, 4 reds give 2. _(assumption: the brief doesn't say whether the offer repeats)_

### BR-05. Discount rounding: half a cent goes to the customer _(assumption, forced by the examples)_

Half of $32.95 is $16.475. The discount is rounded **up** to $16.48 (`1648` cents).
This is the only rounding that matches the expected totals in the brief:

- Rounded up: R01,R01 = $54.37 and B01,B01,R01,R01,R01 = $98.27, as in the brief.
- Rounded down ($16.47): $54.38 and $98.28. Wrong.

### BR-06. Delivery tiers, on the subtotal after discount _(brief + assumption, forced by the examples)_

| Subtotal after discount | Delivery |
| ----------------------- | -------- |
| under $50.00            | $4.95    |
| $50.00 to $89.99        | $2.95    |
| $90.00 or more          | free     |

- The tiers are from the brief. _(brief)_
- The tier is chosen **after** the discount. With R01,R01 the subtotal before discount is $65.90 (delivery $2.95, total $52.37). The brief expects $54.37, which only works with the discounted subtotal ($49.42, delivery $4.95). _(assumption, forced by the examples)_
- Exactly $50.00 pays $2.95 and exactly $90.00 is free, because the brief says "under $50" and "$90 or more". _(brief)_

### BR-07. Total _(brief)_

`total = subtotal - discount + delivery`

### BR-08. Empty basket costs $0 _(assumption)_

An empty basket has a total of $0.00, with no delivery charge.
Read literally, the brief would charge $4.95 (an order "under $50"). Charging delivery for nothing makes no sense, so there is no order and no charge.

### BR-09. Currency and tax _(assumption)_

One currency (USD). No tax.

### BR-10. Operations _(brief + assumption)_

- Required by the brief: `add(code)` and `total()`. _(brief)_
- The UI can empty the basket by starting a new one. _(assumption: a UI convenience, not in the brief)_
- `remove(code)` takes one unit of that product out, and offers and delivery are recomputed. Removing a product the basket doesn't have changes nothing; an unknown code is still an error (BR-03). _(assumption: added for the quantity controls in the UI, not in the brief)_

## Worked examples _(brief)_

The four examples from the brief, step by step, in cents. These four are always part of the test suite.

**B01, G01 → $37.85**

```
subtotal   795 + 2495          = 3290
discount   no red pair         =    0
after      3290 - 0            = 3290   (under 5000 → delivery 495)
total      3290 + 495          = 3785
```

**R01, R01 → $54.37**

```
subtotal   3295 + 3295         = 6590
discount   1 pair, ceil(3295/2) = 1648
after      6590 - 1648         = 4942   (under 5000 → delivery 495)
total      4942 + 495          = 5437
```

**R01, G01 → $60.85**

```
subtotal   3295 + 2495         = 5790
discount   no red pair         =    0
after      5790 - 0            = 5790   (5000 to 8999 → delivery 295)
total      5790 + 295          = 6085
```

**B01, B01, R01, R01, R01 → $98.27**

```
subtotal   795×2 + 3295×3      = 11475
discount   1 pair (3 reds)     =  1648
after      11475 - 1648        =  9827  (9000 or more → delivery 0)
total      9827 + 0            =  9827
```
