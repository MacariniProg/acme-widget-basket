import { UnknownProductError } from "@acme/core";
import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";

/** The core knows nothing about HTTP, so its errors become status codes here (BR-03). */
@Catch(UnknownProductError)
export class DomainErrorFilter implements ExceptionFilter {
	catch(error: UnknownProductError, host: ArgumentsHost) {
		host
			.switchToHttp()
			.getResponse<Response>()
			.status(400)
			.json({ statusCode: 400, message: error.message, error: "Bad Request" });
	}
}
