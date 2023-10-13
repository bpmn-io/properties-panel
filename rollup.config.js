import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';
import babelConfig from './.babelrc.json';

const nonbundledDependencies = Object.keys(pkg.dependencies);

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
    external: externalDependencies(),
    plugins: [
      copy({

        // hook name provided to make sure next plugin has files to replace
        hook: 'buildStart',
        targets: [
          { src: 'src/assets', dest: 'dist' }
        ]
      }),
      babel({ ...babelConfig, babelHelpers: 'bundled' }),
      json(),
      resolve()
    ]
  }
];

function externalDependencies() {
  return id => {
    return nonbundledDependencies.find(dep => id.startsWith(dep));
  };
}