import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

/** Renders the whole page against the MSW mock, with a fresh cache and no retries. */
export function renderApp() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const user = userEvent.setup();
	render(
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>,
	);
	return { user, screen };
}
