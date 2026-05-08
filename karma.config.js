/* eslint-env node */

const path = require('path');
const { DefinePlugin } = require('webpack');

const babelConfig = require('./.babelrc');

const basePath = '.';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

const singleStart = process.env.SINGLE_START;

const coverage = process.env.COVERAGE;

const absoluteBasePath = path.resolve(path.join(__dirname, basePath));

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

const suite = coverage ? 'test/coverageBundle.js' : 'test/testBundle.js';

module.exports = function(karma) {

  const config = {

    basePath,

    frameworks: [
      'webpack',
      'mocha'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress' ].concat(coverage ? 'coverage' : []),

    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' },
      ]
    },

    browsers,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /test\/globals\.js$/,
            sideEffects: true
          },
          {
            test: /\.(css)$/,
            use: 'raw-loader'
          },
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                ...babelConfig,
                plugins: babelConfig.plugins.concat(coverage ? (
                  [
                    [ 'istanbul', {
                      include: [
                        'src/**'
                      ]
                    } ]
                  ]
                ) : [])
              }
            }
          }
        ]
      },
      plugins: [
        new DefinePlugin({

          // @barmac: process.env has to be defined to make @testing-library/preact work
          'process.env': {}
        })
      ],
      resolve: {

        // When @camunda/design-system is npm-linked into node_modules, default
        // symlink resolution walks up from the link target (where preact is
        // not installed) and fails to resolve `preact/compat`. Disabling
        // symlink-following keeps resolution anchored here, where it IS.
        symlinks: false,
        mainFields: [
          'browser',
          'module',
          'main'
        ],
        alias: {

          // preact imports resolve naturally through node_modules — the
          // `./preact/` directory is now just a published-subpath shim and
          // mustn't intercept bare `preact` requests in tests.
          'react': 'preact/compat',
          'react-dom': 'preact/compat'
        },
        modules: [
          'node_modules',
          absoluteBasePath
        ],
        fallback: {
          'crypto': false
        }
      },
      devtool: 'eval-source-map'
    }
  };

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};