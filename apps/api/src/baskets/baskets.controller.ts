import type { BasketView } from "@acme/core";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Post,
} from "@nestjs/common";
import { z } from "zod";
import { BasketsService } from "./baskets.service.js";

// Only the product code comes from the client. z.object drops any other field, so a sent price never reaches the service.
const addItemSchema = z.object({ code: z.string().min(1) });

@Controller("baskets")
export class BasketsController {
	constructor(private readonly baskets: BasketsService) {}

	@Post()
	create(): Promise<BasketView> {
		return this.baskets.create();
	}

	// ParseUUIDPipe answers 400 for a malformed id, before Postgres would fail on the uuid column.
	@Get(":id")
	find(@Param("id", ParseUUIDPipe) id: string): Promise<BasketView> {
		return this.baskets.view(id);
	}

	// Adding changes an existing basket, so 200 like the contract, not Nest's default 201 for POST.
	@Post(":id/items")
	@HttpCode(200)
	add(
		@Param("id", ParseUUIDPipe) id: string,
		@Body({ schema: addItemSchema }) body: z.infer<typeof addItemSchema>,
	): Promise<BasketView> {
		return this.baskets.add(id, body.code);
	}

	@Delete(":id/items/:code")
	remove(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("code") code: string,
	): Promise<BasketView> {
		return this.baskets.remove(id, code);
	}
}
