import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'Sources/doVisualUpdate.ts'
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
    sourcemap: true,
    treeshake: false,
    outDir: 'Designs'
});
