import {
  fireEvent
} from '@testing-library/preact';

import axe from 'axe-core';

export * from './helper';

/**
 * https://www.deque.com/axe/core-documentation/api-documentation/#axe-core-tags
 */
const DEFAULT_AXE_RULES = [
  'best-practice',
  'wcag2a',
  'wcag2aa',
  'cat.semantics'
];


export function insertCSS(name, css) {
  if (document.querySelector('[data-css-file="' + name + '"]')) {
    return;
  }

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');

  style.setAttribute('data-css-file', name);

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

export function changeInput(input, value) {
  fireEvent.input(input, { target: { value } });
}

export function clickInput(input) {
  fireEvent.click(input);
}

export function insertCoreStyles() {
  insertCSS(
    'properties-panel.css',
    require('../src/assets/properties-panel.css').default
  );

  insertCSS(
    'test.css',
    require('./test.css').default
  );
}

export async function expectNoViolations(node, options = {}) {
  const {
    runOnly,
    flags,
    ...rest
  } = options;

  const results = await axe.run(node, {
    runOnly: runOnly || DEFAULT_AXE_RULES,
    ...rest
  });

  expect(results.passes).to.be.not.empty;

  if (results.violations.length) {
    console.log(JSON.stringify(results.violations, null, 2));
  }

  expect(results.violations).to.be.empty;
}