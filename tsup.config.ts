import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        main: 'Sources/dataFunctions.ts'
    },
    external: [],
    noExternal: [],
    platform: 'node',
    format: ['cjs', 'esm'],
    target: 'es5',
    skipNodeModulesBundle: true,
    clean: true,
    minify: false,
    terserOptions: {
        mangle: false,
        keep_classnames: true,
        keep_fnames: true
    },
    splitting: false,
    keepNames: true,
    dts: true,
    sourcemap: false,
    treeshake: true,
    outDir: 'Designs'
});
