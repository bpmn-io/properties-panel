import Description from './Description';

import {
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction, isObject } from 'min-dash';

import translateFallback from '../util/translateFallback';

import {
  useDebounce,
  useError,
  useShowEntryEvent,
  useStaticCallback
} from '../../hooks';

import Tooltip from './Tooltip';

import { EditorView, drawSelection, highlightSpecialChars, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { Annotation, EditorState } from '@codemirror/state';
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, syntaxHighlighting } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const ExternalChange = Annotation.define();
const parseJsonLinter = jsonParseLinter();

/**
 * A CodeMirror based JSON editor for the properties panel.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.value]
 * @param {Function} props.onInput
 * @param {boolean} [props.disabled]
 * @param {string} [props.placeholder]
 * @param {string} [props.tooltip]
 * @param {object} [props.element]
 */
function JsonEditor(props) {

  const {
    id,
    label,
    debounce,
    value = '',
    onInput: commitValue,
    disabled,
    placeholder,
    tooltip,
    element
  } = props;

  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const editorRef = useShowEntryEvent(id);

  const onInput = useStaticCallback((newValue) => {
    commitValue(newValue === '' ? undefined : newValue);
  });

  const handleChange = useDebounce(onInput, debounce);

  useEffect(() => {
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          highlightSpecialChars(),
          history(),
          drawSelection(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          foldGutter(),
          bracketMatching(),
          closeBrackets(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...closeBracketsKeymap,
            ...foldKeymap
          ]),
          EditorState.tabSize.of(2),
          EditorView.lineWrapping,
          EditorState.readOnly.of(!!disabled),
          ...(placeholder ? [ cmPlaceholder(placeholder) ] : []),
          EditorView.updateListener.of(update => {
            const isExternal = update.transactions.some(
              tr => tr.annotation(ExternalChange)
            );
            if (update.docChanged && !isExternal) {
              handleChange(update.state.doc.toString());
            }
          }),
          json(),
          linter((view) => {
            const content = view.state.doc.toString();
            if (!content.trim()) return [];
            return parseJsonLinter(view);
          }, { delay: 300 })
        ]
      }),
      parent: containerRef.current
    });

    viewRef.current = view;

    // Allow useShowEntryEvent to focus the editor
    editorRef.current = view.contentDOM;

    const prefixedId = `bio-properties-panel-${ id }`;
    view.contentDOM.setAttribute('id', prefixedId);
    view.contentDOM.setAttribute('aria-label', label);

    return () => {
      view.destroy();
    };
  }, []);

  // Sync external value changes into the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (value === currentValue) return;

    view.dispatch({
      changes: { from: 0, to: currentValue.length, insert: value || '' },
      annotations: ExternalChange.of(true)
    });
  }, [ value ]);

  // Focus editor on label click manually, as the native `for`
  // attribute does not work with contenteditable elements
  const focusEditor = () => {
    viewRef.current && viewRef.current.focus();
  };

  return (
    <div class="bio-properties-panel-json-editor">
      <label class="bio-properties-panel-label" onClick={ focusEditor }>
        <Tooltip value={ tooltip } forId={ id } element={ element }>
          { label }
        </Tooltip>
      </label>
      <div class={ classnames('bio-properties-panel-input', value && 'edited') } ref={ containerRef } />
    </div>
  );
}


/**
 * Entry wrapper for JsonEditor, handles getValue/setValue, built-in JSON validation, error display, and description.
 *
 * @param {object} props
 * @param {object} props.element
 * @param {string} props.id
 * @param {string} [props.description]
 * @param {string} props.label
 * @param {Function} props.debounce
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {boolean} [props.disabled]
 * @param {string} [props.placeholder]
 * @param {string} [props.tooltip]
 * @param {Function} [props.validate]
 * @param {Function} [props.translate]
 */
export default function JsonEditorEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue,
    setValue,
    disabled,
    placeholder,
    tooltip,
    validate,
    translate = translateFallback
  } = props;

  const globalError = useError(id);

  let value = getValue(element);
  const [ localError, setLocalError ] = useState(
    () => computeError(validate, value, translate)
  );
  const [ editorValue, setEditorValue ] = useState(value);

  useEffect(() => {
    if (value === editorValue) {
      return;
    }

    setEditorValue(value);
    setLocalError(computeError(validate, value, translate));
  }, [ value, validate ]);

  const onInput = useStaticCallback((newValue) => {
    setEditorValue(newValue);

    const currentValue = getValue(element);

    if (newValue !== currentValue) {
      const newValidationError = computeError(validate, newValue, translate);

      setValue(newValue, newValidationError);
      setLocalError(newValidationError);
    }
  });

  const error = globalError || localError;

  return (
    <div
      class={ classnames('bio-properties-panel-entry', error && 'has-error') }
      data-entry-id={ id }>
      <JsonEditor
        id={ id }
        key={ element }
        label={ label }
        debounce={ debounce }
        value={ value }
        onInput={ onInput }
        disabled={ disabled }
        placeholder={ placeholder }
        tooltip={ tooltip }
        element={ element }
      />
      { error && <div class="bio-properties-panel-error">{ error }</div> }
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}

/**
 * Check if the JSON editor entry has been edited.
 */
export function isEdited(node) {
  return node && node.classList.contains('edited');
}


// helpers /////////////////

function computeError(validate, value, translate) {
  return (isFunction(validate) ? validate(value) : null) || validateJson(value, translate);
}

function validateJson(value, translate = translateFallback) {
  if (!value || !value.trim()) return null;

  try {
    return isObject(JSON.parse(value)) ? null : translate('JSON contains errors');
  } catch (e) {
    return translate('JSON contains errors');
  }
}
