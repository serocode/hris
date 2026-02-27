import { defineConfig, type Options } from "tsup"

export default defineConfig((options: Options) => ({
	entry: [
		"src/index.ts",
		"src/errors.ts",
		"src/files.ts",
		"src/employees/index.ts",
		"src/me/index.ts",
		"src/admin/index.ts",
	],
	treeshake: true,
	clean: true,
	dts: {
		resolve: true,
	},
	format: ["esm", "cjs"],
	sourcemap: true,
	splitting: false,
	outExtension({ format }) {
		return {
			js: format === "cjs" ? ".cjs" : ".js",
		}
	},
	...options,
}))
