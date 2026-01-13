import { defineConfig, type Options } from "tsup"

export default defineConfig((options: Options) => ({
	entryPoints: ["src/**/index.ts"],
	treeshake: true,
	clean: true,
	dts: true,
	format: ["cjs", "esm"],
	sourcemap: true,
	splitting: false,
	...options,
}))
