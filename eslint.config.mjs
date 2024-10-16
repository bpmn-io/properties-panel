import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintImport from 'eslint-plugin-import';

const files = {
  build: [
    '*.js',
    '*.mjs'
  ],
  test: [
    'test/**/*.js'
  ],
  ignored: [
    'preact',
    'dist'
  ]
};


export default [
  {
    ignores: files.ignored,
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {
    return {
      ...config,
      ignores: files.build
    };
  }),
  ...bpmnIoPlugin.configs.jsx.map(config => {
    return {
      ...config,
      ignores: files.build
    };
  }),
  {
    plugins: {
      'react-hooks': reactHooks,
      'import': eslintImport
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'import/first': 'error',
      'import/no-amd': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react/display-name': 'off',
      'react/no-unknown-property': 'off',
    },
  },

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: files.test
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true,
        require: true,
        global: true
      },
    },
    files: files.test
  }
];