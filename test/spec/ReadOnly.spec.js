import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import {
  act,
  render
} from '@testing-library/preact/pure';

import { useContext } from 'preact/hooks';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  changeInput,
  insertCoreStyles
} from 'test/TestHelper';

import EventBus from 'diagram-js/lib/core/EventBus';

import PropertiesPanel from 'src/PropertiesPanel';

import ListGroup from 'src/components/ListGroup';

import {
  CheckboxEntry,
  CheckboxGroup,
  FeelCheckboxEntry,
  FeelEntry,
  FeelNumberEntry,
  FeelTemplatingEntry,
  FeelTextAreaEntry,
  FeelToggleSwitchEntry,
  JsonEditorEntry,
  ListEntry,
  NumberFieldEntry,
  SelectEntry,
  SimpleEntry,
  TemplatingEntry,
  TextAreaEntry,
  TextFieldEntry,
  ToggleSwitchEntry
} from 'src/components/entries';

import { ReadOnlyContext } from 'src/context';

import { useReadOnly } from 'src/hooks';

insertCoreStyles();

const noop = () => {};

const element = {
  id: 'foo',
  type: 'foo'
};

/**
 * Entries under test. Note that none of them is provided with a `debounce`.
 */
const ENTRIES = {
  'TextField': {
    component: TextFieldEntry,
    getValue: () => 'foo'
  },
  'TextArea': {
    component: TextAreaEntry,
    getValue: () => 'foo'
  },
  'NumberField': {
    component: NumberFieldEntry,
    getValue: () => 1
  },
  'Select': {
    component: SelectEntry,
    getValue: () => 'a',
    getOptions: () => [ { value: 'a', label: 'A' }, { value: 'b', label: 'B' } ]
  },
  'Checkbox': {
    component: CheckboxEntry,
    getValue: () => true
  },
  'CheckboxGroup': {
    component: CheckboxGroup,
    getValue: () => [ 'a' ],
    options: [ { value: 'a', label: 'A' }, { value: 'b', label: 'B' } ]
  },
  'ToggleSwitch': {
    component: ToggleSwitchEntry,
    getValue: () => true
  },
  'Simple': {
    component: SimpleEntry,
    getValue: () => 'foo'
  },
  'JsonEditor': {
    component: JsonEditorEntry,
    getValue: () => '{ "foo": "bar" }'
  },
  'Templating': {
    component: TemplatingEntry,
    getValue: () => 'foo {{bar}}'
  },
  'Feel (static text)': {
    component: FeelEntry,
    feel: 'optional',
    getValue: () => 'foo'
  },
  'Feel (expression)': {
    component: FeelEntry,
    feel: 'optional',
    getValue: () => '=foo'
  },
  'Feel (required)': {
    component: FeelEntry,
    feel: 'required',
    getValue: () => '=foo'
  },
  'Feel (textarea expression)': {
    component: FeelTextAreaEntry,
    feel: 'optional',
    getValue: () => '=foo'
  },
  'FeelNumber': {
    component: FeelNumberEntry,
    feel: 'optional',
    getValue: () => 1
  },
  'FeelTextArea': {
    component: FeelTextAreaEntry,
    feel: 'optional',
    getValue: () => 'foo'
  },
  'FeelToggleSwitch': {
    component: FeelToggleSwitchEntry,
    feel: 'optional',
    getValue: () => true
  },
  'FeelCheckbox': {
    component: FeelCheckboxEntry,
    feel: 'optional',
    getValue: () => true
  },
  'FeelTemplating': {
    component: FeelTemplatingEntry,
    feel: 'optional',
    getValue: () => 'foo {{bar}}'
  }
};


describe('read-only mode', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('entries', function() {

    Object.entries(ENTRIES).forEach(([ name, entry ]) => {

      describe(name, function() {

        it('should be editable by default', function() {

          // when
          createPanel({ container, groups: [ createGroup(entry) ] });

          // then
          expect(getEditableControls(container)).to.not.be.empty;
        });


        it('should not be editable', function() {

          // when
          createPanel({ container, readOnly: true, groups: [ createGroup(entry) ] });

          // then
          expect(domQuery('.bio-properties-panel-group-entries', container).children).to.have.length(1);
          expect(getEditableControls(container)).to.be.empty;
        });


        it('should not open popup', function() {

          // given
          const eventBus = new EventBus();
          const openSpy = sinonSpy();

          eventBus.on('propertiesPanel.openPopup', openSpy);

          // when
          createPanel({ container, eventBus, readOnly: true, groups: [ createGroup(entry) ] });

          // then
          expect(domQuery('.bio-properties-panel-open-feel-popup', container)).not.to.exist;
          expect(openSpy).not.to.have.been.called;
        });

      });

    });


    it('should respect <disabled> in addition to <readOnly>', function() {

      // when
      createPanel({
        container,
        groups: [ createGroup({ ...ENTRIES.TextField, disabled: true }) ]
      });

      // then
      expect(getEditableControls(container)).to.be.empty;
    });


    it('should not disable <Feel> toggle if not read-only', function() {

      // when
      createPanel({ container, groups: [ createGroup(ENTRIES[ 'Feel (static text)' ]) ] });

      // then
      expect(domQuery('.bio-properties-panel-feel-icon', container).disabled).to.be.false;
    });


    it('should render a read-only FEEL editor', function() {

      // when
      createPanel({ container, readOnly: true, groups: [ createGroup(ENTRIES[ 'Feel (expression)' ]) ] });

      // then
      const content = domQuery('.bio-properties-panel-feel-container .cm-content', container);

      expect(content).to.exist;
      expect(content.getAttribute('contenteditable')).to.eql('false');
    });


    it('should render a read-only templating editor', function() {

      // when
      createPanel({ container, readOnly: true, groups: [ createGroup(ENTRIES.Templating) ] });

      // then
      const content = domQuery('.bio-properties-panel-feelers-editor .cm-content', container);

      expect(content).to.exist;
      expect(content.getAttribute('contenteditable')).to.eql('false');
    });


    it('should render a read-only JSON editor', function() {

      // when
      createPanel({ container, readOnly: true, groups: [ createGroup(ENTRIES.JsonEditor) ] });

      // then
      const content = domQuery('.cm-content', container);

      expect(content).to.exist;
      expect(content.getAttribute('contenteditable')).to.eql('false');
    });

  });


  describe('debounce', function() {

    [
      [ 'TextField', ENTRIES.TextField ],
      [ 'TextArea', ENTRIES.TextArea ],
      [ 'Simple', ENTRIES.Simple ],
      [ 'Feel (static text)', ENTRIES[ 'Feel (static text)' ] ],
      [ 'NumberField', { ...ENTRIES.NumberField, getValue: () => 1 } ]
    ].forEach(([ name, entry ]) => {

      it(`should be optional (${ name })`, function() {

        // given
        const setValue = sinonSpy();

        createPanel({ container, groups: [ createGroup({ ...entry, setValue }) ] });

        const input = domQuery('input[type="text"], input[type="number"], textarea', container);

        // when
        changeInput(input, input.type === 'number' ? '42' : 'changed');

        // then
        expect(setValue).to.have.been.called;
      });

    });

  });


  describe('list', function() {

    function createListGroupPanel(readOnly) {
      return createPanel({
        container,
        readOnly,
        groups: [ {
          id: 'list-group',
          label: 'List',
          component: ListGroup,
          add: noop,
          items: [ {
            id: 'item-1',
            label: 'Item 1',
            remove: noop,
            entries: [ createGroup(ENTRIES.TextField).entries[0] ]
          } ]
        } ]
      });
    }


    it('should hide add and remove (<ListGroup>)', function() {

      // when
      createListGroupPanel(true);

      // then
      expect(domQuery('.bio-properties-panel-add-entry, .bio-properties-panel-remove-entry', container)).not.to.exist;
    });


    it('should not render editable items (<ListGroup>)', function() {

      // when
      createListGroupPanel(true);

      // then
      expect(getEditableControls(container)).to.be.empty;
    });


    it('should expand list (<ListGroup>)', async function() {

      // given
      createListGroupPanel(true);

      // when
      await act(() => domQuery('.bio-properties-panel-group-header', container).click());

      // then
      expect(domQuery('.bio-properties-panel-list.open', container)).to.exist;
    });


    it('should expand list item (<ListGroup>)', async function() {

      // given
      createListGroupPanel(true);

      // when
      await act(() => domQuery('.bio-properties-panel-collapsible-entry-header', container).click());

      // then
      expect(domQuery('.bio-properties-panel-collapsible-entry.open', container)).to.exist;
    });


    it('should show add and remove if not read-only (<ListGroup>)', function() {

      // when
      createPanel({
        container,
        groups: [ {
          id: 'list-group',
          label: 'List',
          component: ListGroup,
          add: noop,
          items: [ { id: 'item-1', label: 'Item 1', remove: noop, entries: [] } ]
        } ]
      });

      // then
      expect(domQuery('.bio-properties-panel-add-entry', container)).to.exist;
      expect(domQuery('.bio-properties-panel-remove-entry', container)).to.exist;
    });


    it('should hide add and remove (<ListEntry>)', function() {

      // given
      const entry = {
        id: 'entry',
        component: ListEntry,
        label: 'List',
        items: [ { name: 'a' }, { name: 'b' } ],
        onAdd: noop,
        onRemove: noop,
        open: true
      };

      // when
      createPanel({
        container,
        readOnly: true,
        groups: [ { id: 'group', label: 'Group', entries: [ { ...entry, component: ListItemsEntry } ] } ]
      });

      // then
      expect(domQueryAll('.bio-properties-panel-list-entry-item', container)).to.have.length(2);
      expect(domQuery('.bio-properties-panel-add-entry', container)).not.to.exist;
      expect(domQuery('.bio-properties-panel-remove-entry', container)).not.to.exist;
    });


    it('should show add and remove if not read-only (<ListEntry>)', function() {

      // when
      createPanel({
        container,
        groups: [ {
          id: 'group',
          label: 'Group',
          entries: [ {
            id: 'entry',
            component: ListItemsEntry,
            label: 'List',
            items: [ { name: 'a' } ],
            onAdd: noop,
            onRemove: noop,
            open: true
          } ]
        } ]
      });

      // then
      expect(domQuery('.bio-properties-panel-add-entry', container)).to.exist;
      expect(domQuery('.bio-properties-panel-remove-entry', container)).to.exist;
    });

  });


  describe('validation', function() {

    const VALIDATED = [
      'TextField',
      'TextArea',
      'NumberField',
      'Select',
      'JsonEditor',
      'Templating',
      'Feel (static text)',
      'Feel (expression)',
      'FeelNumber',
      'FeelTextArea',
      'FeelTemplating'
    ];

    VALIDATED.forEach(function(name) {

      describe(name, function() {

        let validate;

        beforeEach(function() {
          validate = sinonSpy(() => 'invalid');
        });

        function create(readOnly, eventBus) {
          return createPanel({
            container,
            readOnly,
            eventBus,
            groups: [ createGroup({ ...ENTRIES[ name ], validate }) ]
          });
        }


        it('should validate and show errors by default', function() {

          // when
          create(false);

          // then
          expect(validate).to.have.been.called;
          expect(domQuery('.bio-properties-panel-entry.has-error', container)).to.exist;
        });


        it('should not validate in read-only mode', function() {

          // when
          create(true);

          // then
          expect(validate).not.to.have.been.called;
          expect(domQuery('.bio-properties-panel-entry.has-error', container)).not.to.exist;
        });


        it('should not show external diagnostics in read-only mode', async function() {

          // given
          const eventBus = new EventBus();

          create(true, eventBus);

          // when
          await act(() => {
            eventBus.fire('propertiesPanel.setDiagnostics', {
              diagnostics: { entry: [ { message: 'external', severity: 'error' } ] }
            });
          });

          // then
          expect(domQuery('.bio-properties-panel-entry.has-error', container)).not.to.exist;
          expect(domQuery('.bio-properties-panel-group-header.has-error', container)).not.to.exist;
        });

      });

    });


    it('should not show built-in JSON errors in read-only mode', function() {

      // when
      createPanel({
        container,
        readOnly: true,
        groups: [ createGroup({ component: JsonEditorEntry, getValue: () => '{ foo' }) ]
      });

      // then
      expect(domQuery('.bio-properties-panel-entry.has-error', container)).not.to.exist;
    });

  });


  describe('hooks and context', function() {

    function ReadOnlyProbe() {
      const readOnly = useReadOnly();
      const contextValue = useContext(ReadOnlyContext);

      return <span class="probe">{ String(readOnly) }:{ String(contextValue) }</span>;
    }

    function createProbePanel(readOnly) {
      return createPanel({
        container,
        readOnly,
        groups: [ {
          id: 'group',
          label: 'Group',
          entries: [ { id: 'probe', component: ReadOnlyProbe } ]
        } ]
      });
    }


    it('should expose <readOnly> to custom entries', function() {

      // when
      createProbePanel(true);

      // then
      expect(domQuery('.probe', container).textContent).to.eql('true:true');
    });


    it('should default to <false>', function() {

      // when
      createProbePanel(undefined);

      // then
      expect(domQuery('.probe', container).textContent).to.eql('false:false');
    });

  });

});


// helpers //////////

function ListItemsEntry(props) {
  return (
    <ListEntry
      { ...props }
      component={ ({ item }) => <span class="item">{ item.name }</span> } />
  );
}

function createPanel(options) {
  const {
    container,
    eventBus = new EventBus(),
    groups,
    readOnly
  } = options;

  return render(
    <PropertiesPanel
      element={ element }
      groups={ groups }
      eventBus={ eventBus }
      readOnly={ readOnly } />,
    { container }
  );
}

function createGroup(entry) {
  return {
    id: 'group',
    label: 'Group',
    shouldOpen: true,
    entries: [ {
      id: 'entry',
      label: 'Entry',
      setValue: noop,
      ...entry
    } ]
  };
}


/**
 * Anything a user may interact with to modify the value, or to trigger a popup.
 */
function getEditableControls(container) {
  return domQueryAll([
    '.bio-properties-panel-group-entries input:not(:disabled)',
    '.bio-properties-panel-group-entries textarea:not(:disabled)',
    '.bio-properties-panel-group-entries select:not(:disabled)',
    '.bio-properties-panel-group-entries .bio-properties-panel-feel-icon:not(:disabled):not([title="FEEL expression is mandatory"])',
    '.bio-properties-panel-group-entries .bio-properties-panel-open-feel-popup',
    '.bio-properties-panel-group-entries [contenteditable="true"]'
  ].join(', '), container);
}
