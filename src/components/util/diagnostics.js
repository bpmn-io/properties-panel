import { isString } from 'min-dash';

/**
 * @typedef { 'info'|'warning'|'error' } Severity
 *
 * @typedef {Object} DiagnosticAction
 * @property {String} label - label of the action button
 * @property {String} [tooltip] - tooltip shown on hover/focus of the action button
 * @property {Function} onClick - callback invoked when the action is triggered
 *
 * @typedef {Object} Diagnostic
 * @property {Severity} severity
 * @property {String} message
 * @property {DiagnosticAction} [action]
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
    severity: SEVERITIES.includes(value.severity) ? value.severity : severity
  };
}

/**
 * Pick the most severe diagnostic. Ties are resolved in favor of the first
 * one, hence callers list externally provided diagnostics first.
 *
 * @param {Array<String|Diagnostic>} [diagnostics]
 *
 * @returns {Diagnostic|null}
 */
export function getMostSevere(diagnostics) {
  return (diagnostics || []).reduce((mostSevere, value) => {
    const diagnostic = toDiagnostic(value);

    if (!diagnostic) {
      return mostSevere;
    }

    if (!mostSevere || getRank(diagnostic) > getRank(mostSevere)) {
      return diagnostic;
    }

    return mostSevere;
  }, null);
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
    ids.reduce((all, id) => [ ...all, ...(diagnostics[ id ] || []) ], [])
  );
}


// helpers /////////////////

function getRank(diagnostic) {
  return SEVERITIES.indexOf(diagnostic.severity);
}
