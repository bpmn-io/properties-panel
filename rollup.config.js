import path, { parse as parsePath, relative as relativePath } from 'path';
import { replaceInFile } from 'replace-in-file';

import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';
import babelConfig from './.babelrc.json';

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
          { src: 'node_modules/preact', dest: '.' },
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