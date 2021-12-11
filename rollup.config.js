import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';
import babelConfig from './.babelrc.json';

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
      'classnames',
      'min-dash',
      /^preact/
    ],
    plugins: [
      babel({ ...babelConfig, babelHelpers: 'bundled' }),
      json(),
      resolve()
    ]
  }
];
