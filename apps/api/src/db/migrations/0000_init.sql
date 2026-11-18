CREATE TABLE "basket_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "basket_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"basket_id" uuid NOT NULL,
	"product_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "baskets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_tiers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delivery_tiers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"below_cents" integer,
	"cost_cents" integer NOT NULL,
	CONSTRAINT "cost_not_negative" CHECK ("delivery_tiers"."cost_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kind" text NOT NULL,
	"product_code" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "known_kind" CHECK ("offers"."kind" in ('second_half_price'))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "price_positive" CHECK ("products"."price_cents" > 0)
);
--> statement-breakpoint
ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basket_id_baskets_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."baskets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_product_code_products_code_fk" FOREIGN KEY ("product_code") REFERENCES "public"."products"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_code_products_code_fk" FOREIGN KEY ("product_code") REFERENCES "public"."products"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "basket_items_basket_id_idx" ON "basket_items" USING btree ("basket_id");