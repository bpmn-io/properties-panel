import { isString } from 'min-dash';

/**
 * @typedef { 'info'|'warning'|'error' } Severity
 *
 * @typedef {Object} DiagnosticAction
 * @property {String} label - label of the action button
 * @property {String} [ariaLabel] - accessible name of the action button, to tell apart multiple actions with the same label
 * @property {String|import('preact').ComponentChildren} [tooltip] - tooltip shown on hover/focus of the action button
 * @property {Function} onClick - callback invoked when the action is triggered
 *
 * @typedef {Object} Diagnostic
 * @property {Severity} severity
 * @property {String} message
 * @property {DiagnosticAction} [action]
 *
 * @callback ValidateFunction
 * @param {*} value
 * @returns {String|Diagnostic|null|undefined} a message or a diagnostic, if the value is invalid
 */

/**
 * Known severities, ordered from least to most severe.
 *
 * @type {Array<Severity>}
 */
export const SEVERITIES = [ 'info', 'warning', 'error' ];

/**
 * Entry state classes per severity. Infos do not mark the entry, they inform
 * about it.
 */
export const ENTRY_SEVERITY_CLASS = {
  error: 'has-error',
  warning: 'has-warning'
};

const DEFAULT_SEVERITY = 'error';

/**
 * Entry state class for the given diagnostic, if any.
 *
 * @param {Diagnostic} [diagnostic]
 *
 * @returns {String|undefined}
 */
export function getDiagnosticClass(diagnostic) {
  return ENTRY_SEVERITY_CLASS[ diagnostic?.severity ];
}

/**
 * Normalize a diagnostic. Plain strings and unknown severities are treated as
 * <error>, so a mistyped severity stays visible instead of being swallowed.
 *
 * @param {String|Diagnostic} [value]
 * @param {Severity} [severity] - severity to assume if none is provided
 *
 * @returns {Diagnostic|null}
 */
export function toDiagnostic(value, severity = DEFAULT_SEVERITY) {
  if (!value) {
    return null;
  }

  if (isString(value)) {
    return { severity, message: value };
  }

  return {
    ...value,
    message: value.message || '',
    severity: SEVERITIES.includes(value.severity) ? value.severity : severity
  };
}

const MAX_RANK = SEVERITIES.length - 1;

/**
 * Pick the most severe diagnostic. Ties are resolved in favor of the first
 * one, hence callers list externally provided diagnostics first. Falsy
 * entries are ignored, so callers may pass empty local slots as-is.
 *
 * @param {Array<String|Diagnostic|null|undefined>} [diagnostics]
 *
 * @returns {Diagnostic|null}
 */
export function getMostSevere(diagnostics) {
  let mostSevere = null;

  for (const value of (diagnostics || [])) {
    const diagnostic = toDiagnostic(value);

    if (!diagnostic) {
      continue;
    }

    if (!mostSevere || getRank(diagnostic) > getRank(mostSevere)) {
      mostSevere = diagnostic;

      // already the highest possible severity, nothing can outrank it
      if (getRank(mostSevere) === MAX_RANK) {
        break;
      }
    }
  }

  return mostSevere;
}


/**
 * Normalize an error provided through the deprecated errors, which carry a
 * message and nothing else.
 *
 * @param {String} [error]
 *
 * @returns {Diagnostic|null}
 */
export function toErrorDiagnostic(error) {
  if (!error) {
    return null;
  }

  const message = isString(error) ? error : error.message;

  return message ? { severity: DEFAULT_SEVERITY, message } : null;
}

/**
 * Pick the most severe diagnostic across a number of entries.
 *
 * @param {Object<String, Array<Diagnostic>>} diagnostics - keyed by entry ID
 * @param {Array<String>} ids
 *
 * @returns {Diagnostic|null}
 */
export function getMostSevereForIds(diagnostics, ids) {
  return getMostSevere(
    ids.flatMap(id => diagnostics[ id ] || [])
  );
}

/**
 * Pick the most severe diagnostic across a group's entries.
 *
 * @param {Object<String, Array<Diagnostic>>} diagnostics - keyed by entry ID
 * @param {Array<import('../../PropertiesPanel').EntryDefinition>} entries
 *
 * @returns {Diagnostic|null}
 */
export function getGroupDiagnostic(diagnostics, entries) {
  return getMostSevereForIds(diagnostics, entries.map(entry => entry.id));
}

/**
 * Pick the most severe diagnostic across a list group's items, including
 * their nested entries, e.g. for name-value entries.
 *
 * @param {Object<String, Array<Diagnostic>>} diagnostics - keyed by entry ID
 * @param {Array<import('../../PropertiesPanel').ListItemDefinition>} items
 *
 * @returns {Diagnostic|null}
 */
export function getListDiagnostic(diagnostics, items) {
  return getMostSevereForIds(diagnostics, items.flatMap(item => [
    item.id,
    ...(item.entries || []).map(entry => entry.id)
  ]));
}


// helpers /////////////////

function getRank(diagnostic) {
  return SEVERITIES.indexOf(diagnostic.severity);
}
