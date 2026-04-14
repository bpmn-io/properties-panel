import { expect } from 'chai';

import {
  spy as sinonSpy
} from 'sinon';

import {
  render
} from '@testing-library/preact/pure';

import { waitFor } from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  insertCoreStyles
} from 'test/TestHelper';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  PropertiesPanelContext
} from 'src/context';

import JsonEditor, { isEdited } from 'src/components/entries/JsonEditor';

import { EditorView } from '@codemirror/view';

import { debounce } from 'min-dash';

insertCoreStyles();

const noop = () => {};

describe('<JsonEditor>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', async function() {

    // given
    const result = createJsonEditor({ container });

    // then
    await waitFor(() => {
      expect(domQuery('.bio-properties-panel-json-editor', result.container)).to.exist;
      expect(domQuery('.cm-editor', result.container)).to.exist;
    });
  });


  it('should render with label', async function() {

    // given
    const result = createJsonEditor({ container, label: 'My Label' });

    // then
    const label = domQuery('.bio-properties-panel-label', result.container);
    expect(label).to.exist;
    expect(label.textContent).to.equal('My Label');
  });


  it('should render with value', async function() {

    // given
    const result = createJsonEditor({ container, getValue: () => '{"foo": 1}' });

    // then
    await waitFor(() => {
      expect(getEditorValue(result.container)).to.equal('{"foo": 1}');
    });
  });


  it('should render with placeholder', async function() {

    // given
    const result = createJsonEditor({ container, placeholder: 'Enter JSON' });

    // then
    await waitFor(() => {
      const placeholder = domQuery('.cm-placeholder', result.container);
      expect(placeholder).to.exist;
      expect(placeholder.textContent).to.equal('Enter JSON');
    });
  });


  it('should call setValue on user input', async function() {

    // given
    const setValueSpy = sinonSpy();

    const result = createJsonEditor({
      container,
      setValue: setValueSpy
    });

    // when
    await waitFor(() => {
      expect(getEditorView(result.container)).to.exist;
    });

    setEditorValue(result.container, '{"test": true}');

    // then
    await waitFor(() => {
      expect(setValueSpy).to.have.been.calledWith('{"test": true}');
    });
  });


  it('should debounce setValue', async function() {

    // given
    const setValueSpy = sinonSpy();

    const result = createJsonEditor({
      container,
      setValue: setValueSpy,
      debounce: fn => debounce(fn, 50)
    });

    await waitFor(() => {
      expect(getEditorView(result.container)).to.exist;
    });

    // when
    setEditorValue(result.container, '{"debounced": true}');

    // then - should NOT have called setValue yet
    expect(setValueSpy).to.not.have.been.called;

    // when - wait for debounce to flush
    await new Promise(resolve => setTimeout(resolve, 60));

    // then - should have called setValue after debounce
    expect(setValueSpy).to.have.been.calledWith('{"debounced": true}');
  });


  it('should call setValue with undefined for empty value', async function() {

    // given
    const setValueSpy = sinonSpy();

    const result = createJsonEditor({
      container,
      getValue: () => '{"old": 1}',
      setValue: setValueSpy
    });

    await waitFor(() => {
      expect(getEditorView(result.container)).to.exist;
    });

    // when
    setEditorValue(result.container, '');

    // then
    await waitFor(() => {
      expect(setValueSpy).to.have.been.calledWith(undefined);
    });
  });


  it('should sync external value changes', async function() {

    // given
    let currentValue = '{"a": 1}';

    const result = createJsonEditor({
      container,
      getValue: () => currentValue
    });

    await waitFor(() => {
      expect(getEditorValue(result.container)).to.equal('{"a": 1}');
    });

    // when
    currentValue = '{"b": 2}';
    createJsonEditor({
      container,
      getValue: () => currentValue
    }, result.render);

    // then
    await waitFor(() => {
      expect(getEditorValue(result.container)).to.equal('{"b": 2}');
    });
  });


  describe('validation', function() {

    it('should show error for invalid value', async function() {

      // given
      const result = createJsonEditor({
        container,
        getValue: () => '{invalid: json}'
      });

      // then
      await waitFor(() => {
        const entry = domQuery('.bio-properties-panel-entry', result.container);
        expect(domClasses(entry).has('has-error')).to.be.true;

        const error = domQuery('.bio-properties-panel-error', result.container);
        expect(error).to.exist;
        expect(error.textContent).to.equal('JSON contains errors');
      });
    });


    it('should show no error for valid value', async function() {

      // given
      const result = createJsonEditor({
        container,
        getValue: () => '{"valid": true}'
      });

      // then
      await waitFor(() => {
        const entry = domQuery('.bio-properties-panel-entry', result.container);
        expect(domClasses(entry).has('has-error')).to.be.false;
      });
    });

  });


  describe('isEdited', function() {

    it('should return true when editor has content', async function() {

      // given
      const result = createJsonEditor({
        container,
        getValue: () => '{"foo": 1}'
      });

      // then
      await waitFor(() => {
        const entry = domQuery('.bio-properties-panel-entry', result.container);
        expect(isEdited(entry)).to.be.true;
      });
    });


    it('should return false when editor is empty', async function() {

      // given
      const result = createJsonEditor({
        container,
        getValue: () => ''
      });

      // then
      await waitFor(() => {
        const entry = domQuery('.bio-properties-panel-entry', result.container);
        expect(isEdited(entry)).to.be.false;
      });
    });

  });
});


// factory ////////////////////

function createJsonEditor(options = {}, renderFn = render) {
  const {
    element,
    id = 'testJsonEditor',
    description,
    debounce = fn => fn,
    label = 'JSON Editor',
    getValue = noop,
    setValue = noop,
    disabled,
    placeholder,
    tooltip,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {}
  } = options;

  const errorsContext = {
    errors
  };

  const eventContext = {
    eventBus
  };

  const propertiesPanelContext = {
    onShow
  };

  const descriptionContext = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <JsonEditor
              element={ element }
              id={ id }
              label={ label }
              debounce={ debounce }
              description={ description }
              getValue={ getValue }
              setValue={ setValue }
              disabled={ disabled }
              placeholder={ placeholder }
              tooltip={ tooltip } />
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    { container }
  );
}

// helpers /////////////////

/**
 * Get the CodeMirror EditorView instance from a container.
 */
function getEditorView(container) {
  const cmElement = domQuery('.cm-editor', container);
  return cmElement && EditorView.findFromDOM(cmElement);
}

/**
 * Get the current document text from the CodeMirror editor.
 */
function getEditorValue(container) {
  const view = getEditorView(container);
  return view ? view.state.doc.toString() : '';
}

/**
 * Set the text of the CodeMirror editor, simulating user input.
 */
function setEditorValue(container, value) {
  const view = getEditorView(container);
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: value }
  });
}
