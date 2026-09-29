import { useContext, useMemo } from 'preact/hooks';

import { DiagnosticsContext, ErrorsContext } from '../context';

import {
  getGroupDiagnostic,
  getListDiagnostic,
  getMostSevere,
  toErrorDiagnostic
} from '../components/util/diagnostics';

const NO_DIAGNOSTICS = [];

/**
 * Accesses the diagnostics of a single entry.
 *
 * Falls back to the deprecated errors, so hosts that only provide those keep
 * working. Diagnostics take precedence.
 *
 * @param {String} id
 *
 * @returns {Array<import('../components/util/diagnostics').Diagnostic>}
 */
export function useDiagnostics(id) {
  const { diagnostics } = useContext(DiagnosticsContext);
  const { errors } = useContext(ErrorsContext);

  const entryDiagnostics = diagnostics[ id ];

  if (entryDiagnostics && entryDiagnostics.length) {
    return entryDiagnostics;
  }

  const error = toErrorDiagnostic(errors[ id ]);

  return error ? [ error ] : NO_DIAGNOSTICS;
}

/**
 * Accesses the single most severe, externally provided diagnostic of an
 * entry, for entries that do not also combine in a local one.
 *
 * @param {String} id
 *
 * @returns {import('../components/util/diagnostics').Diagnostic|null}
 */
export function useDisplayedDiagnostic(id) {
  return getMostSevere(useDiagnostics(id));
}

/**
 * Accesses the diagnostics of all entries, keyed by entry ID.
 *
 * Falls back to the deprecated errors, so hosts that only provide those keep
 * working. Diagnostics take precedence.
 *
 * @returns {Object<String, Array<import('../components/util/diagnostics').Diagnostic>>}
 */
export function useAllDiagnostics() {
  const { diagnostics } = useContext(DiagnosticsContext);
  const { errors } = useContext(ErrorsContext);

  return useMemo(() => {
    const allDiagnostics = { ...diagnostics };

    for (const id in errors) {
      if (allDiagnostics[ id ] && allDiagnostics[ id ].length) {
        continue;
      }

      const error = toErrorDiagnostic(errors[ id ]);

      if (error) {
        allDiagnostics[ id ] = [ error ];
      }
    }

    return allDiagnostics;
  }, [ diagnostics, errors ]);
}

/**
 * Accesses the most severe diagnostic across a group's entries.
 *
 * @param {Array<import('../PropertiesPanel').EntryDefinition>} entries
 *
 * @returns {import('../components/util/diagnostics').Diagnostic|null}
 */
export function useGroupDiagnostic(entries) {
  return getGroupDiagnostic(useAllDiagnostics(), entries);
}

/**
 * Accesses the most severe diagnostic across a list group's items,
 * including their nested entries.
 *
 * @param {Array<import('../PropertiesPanel').ListItemDefinition>} items
 *
 * @returns {import('../components/util/diagnostics').Diagnostic|null}
 */
export function useListDiagnostic(items) {
  return getListDiagnostic(useAllDiagnostics(), items);
}
