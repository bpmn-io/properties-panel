import {
  createContext
} from 'preact';

/** @type {import('../types').LayoutContext} */
const LayoutContext = createContext({
  layout: {},
  setLayout: () => {},
  getLayoutForKey: () => {},
  setLayoutForKey: () => {}
});

export default LayoutContext;