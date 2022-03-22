import {
  createContext
} from 'preact';

const LayoutContext = createContext({
  layout: {},
  setLayout: () => {},
  getLayoutForKey: (key, defaultValue) => defaultValue,
  setLayoutForKey: () => {}
});

export default LayoutContext;