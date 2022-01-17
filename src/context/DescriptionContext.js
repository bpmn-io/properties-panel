import {
  createContext
} from 'preact';

/** @type {import('../types').DescriptionContext} */
const DescriptionContext = createContext({
  description: {},
  getDescriptionForId: () => ''
});

export default DescriptionContext;
