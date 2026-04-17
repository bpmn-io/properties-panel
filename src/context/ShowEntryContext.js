import { createContext } from 'preact';

/**
 * Coordinates `propertiesPanel.showEntry` requests at the panel level so that
 * groups can open themselves and entries can focus even when they are not yet
 * mounted at the time the event fires.
 *
 * @typedef { {
 *   id: string,
 *   token: number
 * } } ShowEntryRequest
 *
 * @typedef { {
 *   pendingRequest: ShowEntryRequest | null,
 *   requestShow: (id: string) => void,
 *   resolve: (token: number) => void
 * } } ShowEntryContextValue
 */

const noop = () => {};

const ShowEntryContext = createContext({
  pendingRequest: null,
  requestShow: noop,
  resolve: noop
});

export default ShowEntryContext;
