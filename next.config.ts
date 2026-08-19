import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	compiler: {
		// Milkdown's Crepe editor is built with Vue, which expects the bundler to
		// inject these compile-time flags. Defining them silences the dev warning
		// and lets Vue drop its dev-only branches from the production bundle.
		define: {
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
		},
	},
};

export default nextConfig;
