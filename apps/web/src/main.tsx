import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error('index.html is missing <div id="root">');

// Without a real API, answer requests with the MSW mock (development only).
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
	const { network } = await import("virtual:msw");
	const { handlers } = await import("./mocks/handlers");
	network.configure({ handlers });
	await network.enable();
}

const queryClient = new QueryClient();

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</StrictMode>,
);
