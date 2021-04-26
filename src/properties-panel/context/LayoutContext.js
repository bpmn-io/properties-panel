import {
  createContext
} from 'preact';

const LayoutContext = createContext({
  layout: {},
  setLayout: () => {},
  setLayoutForKey: () => {}
});

export default LayoutContext;