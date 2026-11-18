import {
	type OfferView,
	offerViews,
	type ProductView,
	productViews,
} from "@acme/core";
import { Controller, Get } from "@nestjs/common";
import { CatalogueService } from "./catalogue.service.js";

@Controller()
export class CatalogueController {
	constructor(private readonly catalogue: CatalogueService) {}

	@Get("products")
	async products(): Promise<ProductView[]> {
		return productViews(await this.catalogue.config());
	}

	@Get("offers")
	async offers(): Promise<OfferView[]> {
		return offerViews(await this.catalogue.config());
	}
}
