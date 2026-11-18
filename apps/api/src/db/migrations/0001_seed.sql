-- Catalogue, delivery tiers and offer from the brief (BR-01, BR-04, BR-06).
-- Same values as acmeConfig in packages/core; the API tests compare the two.
INSERT INTO "products" ("code", "name", "price_cents", "position") VALUES
	('R01', 'Red Widget', 3295, 1),
	('G01', 'Green Widget', 2495, 2),
	('B01', 'Blue Widget', 795, 3);
--> statement-breakpoint
INSERT INTO "delivery_tiers" ("below_cents", "cost_cents") VALUES
	(5000, 495),
	(9000, 295),
	(NULL, 0);
--> statement-breakpoint
INSERT INTO "offers" ("kind", "product_code", "label", "description") VALUES
	('second_half_price', 'R01', 'Red Widget offer', 'Buy one Red Widget, get the second half price.');
