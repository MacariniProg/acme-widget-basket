/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Base URL of the API, e.g. http://localhost:3000. Unset: /api, answered by the MSW mock. */
	readonly VITE_API_URL?: string;
}
