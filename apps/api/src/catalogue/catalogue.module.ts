import { Module } from "@nestjs/common";
import { CatalogueController } from "./catalogue.controller.js";
import { CatalogueService } from "./catalogue.service.js";

@Module({
	controllers: [CatalogueController],
	providers: [CatalogueService],
	// BasketsModule builds each Basket from this config.
	exports: [CatalogueService],
})
export class CatalogueModule {}
