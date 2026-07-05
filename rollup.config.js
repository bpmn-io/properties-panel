import path, { parse as parsePath, relative as relativePath } from 'path';
import { createRequire } from 'module';
import { replaceInFile } from 'replace-in-file';

import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';
import babelConfig from './.babelrc.json';

const require = createRequire(import.meta.url);

// resolve preact through Node module resolution rather than assuming it lives
// in the local `node_modules/preact`. This ensures the build works when preact
// is hoisted to a parent `node_modules` (mono repositories) or linked in from
// another location. Path separators are normalized to POSIX so that
// rollup-plugin-copy's globby can process the path on Windows.
const preactDir = path.dirname(require.resolve('preact/package.json')).split(path.sep).join('/');

const nonbundledDependencies = Object.keys({ ...pkg.dependencies });

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
    external: [
      ...nonbundledDependencies,

      // exclude local preact copy to share it with extensions
      /\.\/preact/
    ],
    plugins: [
      copy({

        // hook name provided to make sure next plugin has files to replace
        hook: 'buildStart',
        targets: [
          { src: preactDir, dest: '.' },
          { src: 'src/assets', dest: 'dist' }
        ]
      }),
      rewirePreactSubpackages(),
      babel({ ...babelConfig, babelHelpers: 'bundled' }),
      json(),
      resolve()
    ]
  }
];

/**
 * Monkey-patch preact subpackages to import from the local package via relative path.
 */
function rewirePreactSubpackages() {
  return {
    async buildEnd() {
      await replaceInFile({
        files: './preact/**/*.{js,mjs,js.map}',
        from: [ /(import\s*['"])preact([/'"])/g, /(from\s*['"])preact([/'"])/g, /(require\(['"])preact([/'"])/g ],
        to: function(...args) {
          const importGroup = args[1],
                afterImport = args[2],
                filePath = args.pop();

          const { dir } = parsePath(filePath);
          const posixPathToPreact = relativePath(dir, './preact').split(path.sep).join(path.posix.sep);
          return `${importGroup}${posixPathToPreact}${afterImport}`;
        }
      });
    }
  };
}