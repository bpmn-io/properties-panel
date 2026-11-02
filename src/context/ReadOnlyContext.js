import {
  createContext
} from 'preact';

/**
 * Tells whether the whole properties panel is read-only. Set via the
 * `readOnly` prop of the `PropertiesPanel`.
 */
const ReadOnlyContext = createContext(false);

export default ReadOnlyContext;
