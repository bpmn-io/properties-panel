import {
  createContext
} from 'preact';

export const FeelPopupContext = createContext({
  activePopupEntryIds: [],
  popupContainer: null,
  getLinks: () => []
});