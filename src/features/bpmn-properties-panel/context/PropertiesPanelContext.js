import {
  createContext
} from 'preact';

const PropertiesPanelContext = createContext({
  selectedElement: null,
  setSelectedElement() {},
  injector: null,
  getService() { return null;}
});

export default PropertiesPanelContext;