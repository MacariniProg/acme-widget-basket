import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { handlers, resetMockBaskets } from "@/mocks/handlers";

// The same handlers as `pnpm dev`, so tests and the browser talk to the same fake API.
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
	cleanup();
	server.resetHandlers();
	resetMockBaskets();
	localStorage.clear();
});
afterAll(() => server.close());
