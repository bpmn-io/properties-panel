import { promises as fs } from 'fs';

import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';
import babelConfig from './.babelrc.json';

const nonbundledDependencies = Object.keys({
  ...pkg.dependencies,
  ...pkg.peerDependencies
});

export default [
  {
    input: 'src/index.js',
    output: [
      {
        sourcemap: true,
        format: 'commonjs',
        file: pkg.main
      },
      {
        sourcemap: true,
        format: 'esm',
        file: pkg.module
      }
    ],
    external: (id) => {

      // Externalize `preact` and all of its subpaths so the consumer
      // resolves a single preact instance for the entire app — both for
      // properties-panel's own components (compiled into dist/) and for
      // re-exports under `@bpmn-io/properties-panel/preact/*`. Bundling
      // preact previously produced TWO instances (one in dist/, one in
      // ./preact) which silently broke hooks (`__H` is undefined) when a
      // consumer's tree spanned both modules.
      if (/^preact($|\/)/.test(id)) return true;

      // exclude the re-export shims under `./preact/` so they remain
      // available as a published subpath
      if (/^\.\/preact/.test(id)) return true;

      // bare-name match (e.g. `min-dash`) AND deep imports
      // (e.g. `@camunda/design-system/preact/components/checkbox`)
      return nonbundledDependencies.some(dep => id === dep || id.startsWith(dep + '/'));
    },
    plugins: [
      copy({
        hook: 'buildStart',
        targets: [
          { src: 'src/assets', dest: 'dist' },

          // Re-publish the design-system stylesheet under the panel's own
          // dist subpath so consumers (e.g. bpmn-js-properties-panel) can
          // load shadcn styles via `@bpmn-io/properties-panel/dist/assets/...`
          // and don't need a direct dependency on `@camunda/design-system`.
          {
            src: 'node_modules/@camunda/design-system/dist/preact/styles.css',
            dest: 'dist/assets',
            rename: 'shadcn-styles.css'
          }
        ]
      }),
      writePreactShims(),
      babel({ ...babelConfig, babelHelpers: 'bundled' }),
      json(),
      resolve()
    ]
  }
];

/**
 * Generate thin re-export shims under `./preact/{,hooks,compat,jsx-runtime}` so
 * `@bpmn-io/properties-panel/preact/<sub>` resolves to whatever `preact` the
 * consumer has installed. Keeps the published subpath stable (downstream
 * code still does `import { useState } from '@bpmn-io/properties-panel/preact/hooks'`)
 * without smuggling our own preact runtime into the package.
 */
function writePreactShims() {
  const subpackages = [
    { dir: 'preact', from: 'preact', hasDefault: false },
    { dir: 'preact/hooks', from: 'preact/hooks', hasDefault: false },
    { dir: 'preact/compat', from: 'preact/compat', hasDefault: true },
    { dir: 'preact/jsx-runtime', from: 'preact/jsx-runtime', hasDefault: false },
    { dir: 'preact/test-utils', from: 'preact/test-utils', hasDefault: false }
  ];

  return {
    name: 'write-preact-shims',
    async buildStart() {
      for (const { dir, from, hasDefault } of subpackages) {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(
          `${dir}/package.json`,
          JSON.stringify({ main: 'index.js', module: 'index.mjs' }, null, 2) + '\n'
        );

        // CJS shim
        await fs.writeFile(
          `${dir}/index.js`,
          `'use strict';\nmodule.exports = require('${from}');\n`
        );

        // ESM shim. `preact` and most subpaths have no default export — a
        // `export { default }` line then makes webpack fail with "default not
        // found". `preact/compat` does have one (React compat default).
        const esm = hasDefault
          ? `export * from '${from}';\nexport { default } from '${from}';\n`
          : `export * from '${from}';\n`;
        await fs.writeFile(`${dir}/index.mjs`, esm);
      }
    }
  };
}