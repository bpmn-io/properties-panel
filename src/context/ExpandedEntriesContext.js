import { createContext } from 'preact';

export const ExpandedEntriesContext = createContext({
  expandedEntries: [],
  expansionContextProps: {}
});
