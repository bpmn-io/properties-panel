import {
  createContext
} from 'preact';

const DescriptionContext = createContext({
  description: {},
  getDescriptionForId: () => {}
});

export default DescriptionContext;
