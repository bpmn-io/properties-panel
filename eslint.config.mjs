import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintImport from 'eslint-plugin-import';

const buildScripts = [ '*.js', '*.mjs' ];

export default [
  {
    ignores: [ 'preact', 'dist' ],
  },
  ...bpmnIoPlugin.configs.browser,
  ...bpmnIoPlugin.configs.jsx,
  ...bpmnIoPlugin.configs.mocha.map(config => {
    return {
      ...config,
      files: [
        'test/**/*.js'
      ]
    };
  }),
  ...bpmnIoPlugin.configs.node.map(config => {
    return {
      ...config,
      files: [
        ...buildScripts,
        'test/**/*.js'
      ]
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
  {
    languageOptions: {
      globals: {
        sinon: true
      },
    },
    files: [
      'test/**/*.js'
    ]
  }
];