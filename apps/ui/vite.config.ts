import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	server: {
		// Use hris.localhost for cookie sharing across subdomains
		// Make sure to add '127.0.0.1 hris.localhost' to your hosts file
		// For HTTPS, you'll need to configure SSL certificates
		host: "hris.localhost",
		// port: 5173,
	},
	plugins: [
		tsConfigPaths({ projects: ["./tsconfig.json"] }),
		tanstackStart(),
		viteReact(),
		tailwindcss(),
	],
})
