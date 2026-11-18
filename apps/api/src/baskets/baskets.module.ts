import { Module } from "@nestjs/common";
import { CatalogueModule } from "../catalogue/catalogue.module.js";
import { BasketsController } from "./baskets.controller.js";
import { BasketsService } from "./baskets.service.js";

@Module({
	imports: [CatalogueModule],
	controllers: [BasketsController],
	providers: [BasketsService],
})
export class BasketsModule {}
