/**
 * @typedef {Function} <propertiesPanel.showEntry> callback
 *
 * @example
 *
 * useEvent('propertiesPanel.showEntry', ({ focus = false, ...rest }) => {
 *   // ...
 * });
 *
 * @param {Object} context
 * @param {boolean} [context.focus]
 *
 * @returns void
 */

/**
 * @typedef {Function} <propertiesPanel.showError> callback
 *
 * @example
 *
 * useEvent('propertiesPanel.showError', ({ focus = false, message, ...rest }) => {
 *   // ...
 * });
 *
 * @param {Object} context
 * @param {string} context.message
 * @param {boolean} [context.focus]
 *
 * @returns void
 */

import { createContext } from 'preact';

const EventContext = createContext({ eventBus: null });

export default EventContext;
