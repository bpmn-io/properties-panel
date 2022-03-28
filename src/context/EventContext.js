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

import EventBus from 'diagram-js/lib/core/EventBus';

const eventBus = new EventBus();

const EventContext = createContext({ eventBus });

export default EventContext;
