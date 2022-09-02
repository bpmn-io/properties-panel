import {
  createContext
} from 'preact';

const OverridesContext = createContext({
  overrides: {},
  getOverridesForId: () => {}
});

export default OverridesContext;
