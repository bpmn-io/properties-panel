import {
  createContext
} from 'preact';

const FeelPopupContext = createContext({
  open: () => {},
  close: () => {},
  source: null
});

export default FeelPopupContext;