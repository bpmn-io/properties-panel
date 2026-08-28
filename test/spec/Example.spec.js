import { render } from 'preact';
import { useReducer, useCallback, useState } from 'preact/hooks';

import TestContainer from 'mocha-test-container-support';

import {
  insertCoreStyles,
  insertCSS
} from 'test/TestHelper';

import PropertiesPanel from 'src/PropertiesPanel';

import Header from 'src/components/Header';

import ListGroup from 'src/components/ListGroup';

import {
  TextFieldEntry,
  isTextFieldEntryEdited,
  TextAreaEntry,
  isTextAreaEntryEdited,
  CheckboxEntry,
  isCheckboxEntryEdited,
  JsonEditorEntry,
  isJsonEditorEntryEdited,
  NumberFieldEntry,
  isNumberFieldEntryEdited,
  SelectEntry,
  isSelectEntryEdited,
  ToggleSwitchEntry,
  isToggleSwitchEntryEdited,
  FeelEntry,
  FeelTemplatingEntry,
  isFeelEntryEdited
} from 'src/components/entries';

import EventBus from 'diagram-js/lib/core/EventBus';

import { FeelLanguageContext } from 'src/context';

import { Popup } from 'src/features/popup/Popup';
import { PopupRenderer } from 'src/features/popup/PopupRenderer';

insertCoreStyles();

insertCSS('example.css', `
  body:has(.bio-properties-panel-example) {
    box-sizing: border-box;
    height: calc(100vh - 16px);
    margin: 8px;
  }

  .test-container:has(.bio-properties-panel-example) {
    box-sizing: border-box;
    height: 100% !important;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .test-content-container:has(.bio-properties-panel-example) {
    flex: 1;
    min-height: 0;
  }

  .bio-properties-panel-example {
    display: flex;
    flex-direction: column;
    width: 350px;
    height: 100%;
    margin-left: auto;
    border-left: solid 2px #CCC;
  }

  .bio-properties-panel-example__panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .bio-properties-panel-example__panel > .bio-properties-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
`);

const singleStart = window.__env__?.SINGLE_START === 'example';

describe('Example', function() {

  let container;

  beforeEach(function() {
    container = document.createElement('div');
    container.classList.add('bio-properties-panel-example');

    TestContainer.get(this).appendChild(container);
  });

  (singleStart ? it.only : it.skip)('should render properties panel', async function() {

    this.timeout(0);

    // when
    render(<ExampleApp />, container);

    // then — keep open for interactive use with SINGLE_START
    await new Promise(() => {});
  });
});


// demo app ////////////////////

const element = {
  id: 'Element_1',
  name: 'My Service Task',
  type: 'bpmn:ServiceTask',
  implementation: 'java',
  className: 'com.example.MyDelegate',
  documentation: '',
  templateLabel: 'Hello {{name}}, welcome!',
  exampleData: '{\n  "orderId": "12345",\n  "customer": {\n    "name": "Jane Doe",\n    "email": "jane@example.com"\n  },\n  "items": [\n    { "id": 1, "price": 29.99 },\n    { "id": 2, "price": 49.99 }\n  ]\n}',
  retryCount: 3,
  async: false,
  expression: '=fromAi(myVariable)',
  conditionExpression: '',
  inputParameters: [
    { id: 'input-1', name: 'customerId', value: '=customer.id' },
    { id: 'input-2', name: 'orderTotal', value: '=sum(order.items.price)' }
  ],
  outputParameters: [
    { id: 'output-1', name: 'result', value: '=response.data' }
  ]
};

const eventBus = new EventBus();
const layoutConfig = {};
const noop = () => {};

/**
 * Collect the ids of all entries across groups (including nested list items).
 */
function collectEntryIds(groups) {
  const ids = [];

  groups.forEach(group => {
    (group.entries || []).forEach(entry => ids.push(entry.id));
    (group.items || []).forEach(item => {
      (item.entries || []).forEach(entry => ids.push(entry.id));
    });
  });

  return ids;
}

new Popup(eventBus, {});
new PopupRenderer(eventBus);

function ExampleApp() {
  const [ , forceUpdate ] = useReducer(x => x + 1, 0);

  const [ showErrors, setShowErrors ] = useState(false);

  const updateElement = useCallback((key, value) => {
    element[key] = value;
    forceUpdate();
  }, [ element ]);

  const groups = [
    {
      id: 'general',
      label: 'General',
      entries: [
        {
          id: 'name',
          component: TextFieldComponent,
          isEdited: isTextFieldEntryEdited,
          label: 'Name',
          description: 'The display name of the element.',
          updateElement,
          element
        },
        {
          id: 'documentation',
          component: TextAreaComponent,
          isEdited: isTextAreaEntryEdited,
          label: 'Documentation',
          description: 'Documentation for this element.',
          updateElement,
          element
        }
      ]
    },
    {
      id: 'templating',
      label: 'Templating',
      entries: [
        {
          id: 'templateLabel',
          component: FeelTemplatingComponent,
          isEdited: isFeelEntryEdited,
          label: 'Template Label',
          updateElement,
          element
        }
      ]
    },
    {
      id: 'feel-expressions',
      label: 'FEEL Expressions',
      entries: [
        {
          id: 'expression',
          component: FeelEntryComponent,
          isEdited: isFeelEntryEdited,
          label: 'Expression',
          description: 'A FEEL expression to evaluate. `fromAi` requires Camunda 8.8+.',
          feel: 'required',
          updateElement,
          element
        },
        {
          id: 'conditionExpression',
          component: FeelEntryComponent,
          isEdited: isFeelEntryEdited,
          label: 'Condition',
          description: 'Optional FEEL condition (toggle FEEL mode with = prefix).',
          feel: 'optional',
          updateElement,
          element
        }
      ]
    },
    {
      id: 'details',
      label: 'Details',
      entries: [
        {
          id: 'implementation',
          component: SelectComponent,
          isEdited: isSelectEntryEdited,
          label: 'Implementation',
          description: 'How this task is implemented.',
          updateElement,
          element,
          options: [
            { value: '', label: '<none>' },
            { value: 'java', label: 'Java Class' },
            { value: 'expression', label: 'Expression' },
            { value: 'delegate', label: 'Delegate Expression' }
          ]
        },
        {
          id: 'className',
          component: TextFieldComponent,
          isEdited: isTextFieldEntryEdited,
          label: 'Java Class',
          description: 'Fully qualified class name.',
          updateElement,
          element
        },
        {
          id: 'retryCount',
          component: NumberFieldComponent,
          isEdited: isNumberFieldEntryEdited,
          label: 'Retry Count',
          description: 'Number of retries on failure.',
          updateElement,
          element
        }
      ]
    },
    {
      id: 'code',
      label: 'Example Data',
      entries: [
        {
          id: 'exampleData',
          component: JsonEditorComponent,
          isEdited: isJsonEditorEntryEdited,
          label: 'Example Data (JSON)',
          description: 'Provide example output data as a JSON object.',
          updateElement,
          element
        }
      ]
    },
    {
      id: 'inputs',
      label: 'Input Parameters',
      component: ListGroup,
      add: createInputParameter(element, forceUpdate),
      items: element.inputParameters.map(param => ({
        id: param.id,
        label: param.name,
        entries: [
          {
            id: `${param.id}-name`,
            component: ParameterNameEntry,
            param
          },
          {
            id: `${param.id}-value`,
            component: ParameterValueEntry,
            param
          }
        ]
      }))
    },
    {
      id: 'flags',
      label: 'Flags',
      entries: [
        {
          id: 'async',
          component: CheckboxComponent,
          isEdited: isCheckboxEntryEdited,
          label: 'Asynchronous',
          description: 'Execute this task asynchronously.',
          updateElement,
          element
        },
        {
          id: 'exclusive',
          component: ToggleSwitchComponent,
          isEdited: isToggleSwitchEntryEdited,
          label: 'Exclusive',
          description: 'Exclusive job execution.',
          updateElement,
          element
        }
      ]
    }
  ];

  const toggleErrors = event => {
    const active = event.target.checked;

    setShowErrors(active);

    const errors = active ? collectEntryIds(groups).reduce((acc, id) => {
      acc[id] = 'This field is invalid.';

      return acc;
    }, {}) : {};

    eventBus.fire('propertiesPanel.setErrors', { errors });
  };

  return (
    <div class="bio-properties-panel" style="display: flex; flex-direction: column; height: 100%;">
      <div style="padding: 6px 8px; border-bottom: 1px solid #ccc;">
        <label style="font-size: 12px; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" checked={ showErrors } onChange={ toggleErrors } />
          Show errors on all controls
        </label>
      </div>
      <div style="border: 2px dashed #888; margin: 4px;">
        <div style="font-size: 11px; color: #555; padding: 4px 8px; background: #f5f5f5;">
          standalone &lt;Header&gt;
        </div>
        <Header element={ element } headerProvider={ ExampleHeaderProvider } />
      </div>
      <div class="bio-properties-panel-example__panel" style="border: 2px dashed #0a7; margin: 4px; flex: 1; min-height: 0;">
        <div style="font-size: 11px; color: #555; padding: 4px 8px; background: #f5f5f5;">
          &lt;PropertiesPanel&gt; without built-in header
        </div>
        <FeelLanguageContext.Provider value={ { engines: { camunda: '8.6' } } }>
          <PropertiesPanel
            element={ element }
            placeholderProvider={ ExamplePlaceholderProvider }
            groups={ groups }
            eventBus={ eventBus }
            layoutConfig={ layoutConfig }
            layoutChanged={ noop }
          />
        </FeelLanguageContext.Provider>
      </div>
    </div>
  );
}


// entry components ////////////////////

function TextFieldComponent(props) {
  const { id, element, label, description, updateElement } = props;

  return TextFieldEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    getValue: () => element[id] || '',
    setValue: (val) => updateElement(id, val)
  });
}

function TextAreaComponent(props) {
  const { id, element, label, description, updateElement } = props;

  return TextAreaEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => updateElement(id, val)
  });
}

function CheckboxComponent(props) {
  const { id, element, label, description, updateElement } = props;

  return CheckboxEntry({
    id,
    element,
    label,
    description,
    getValue: () => element[id] ?? false,
    setValue: (val) => updateElement(id, val)
  });
}

function NumberFieldComponent(props) {
  const { id, element, label, description, updateElement } = props;

  return NumberFieldEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => updateElement(id, val)
  });
}

function SelectComponent(props) {
  const { id, element, label, description, options, updateElement } = props;

  return SelectEntry({
    id,
    element,
    label,
    description,
    getValue: () => element[id] ?? '',
    setValue: (val) => updateElement(id, val),
    getOptions: () => options
  });
}

function ToggleSwitchComponent(props) {
  const { id, element, label, description, updateElement } = props;

  return ToggleSwitchEntry({
    id,
    element,
    label,
    description,
    getValue: () => element[id] ?? false,
    setValue: (val) => updateElement(id, val)
  });
}

function FeelEntryComponent(props) {
  const { id, element, label, description, feel, updateElement } = props;

  return FeelEntry({
    id,
    element,
    label,
    description,
    feel,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => updateElement(id, val),
    variables: [
      { name: 'myVariable', info: 'A sample variable' },
      { name: 'customer', info: 'Customer context object' },
      { name: 'order', info: 'Current order data' }
    ]
  });
}

function JsonEditorComponent(props) {
  const { id, element, label, description, updateElement } = props;

  return JsonEditorEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    tooltip: 'Enter a JSON object representing example output data for this element.',
    placeholder: '{ }',
    getValue: () => element[id] ?? '',
    setValue: (val) => updateElement(id, val)
  });
}

function FeelTemplatingComponent(props) {
  const { id, element, label, updateElement } = props;

  return FeelTemplatingEntry({
    id,
    element,
    label,
    singleLine: true,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => updateElement(id, val),
    variables: [
      { name: 'name', info: 'User name' },
      { name: 'orderId', info: 'Order identifier' }
    ]
  });
}

function ParameterNameEntry(props) {
  const { element, param } = props;

  return TextFieldEntry({
    id: `${param.id}-name`,
    element,
    label: 'Name',
    debounce: fn => fn,
    getValue: () => param.name,
    setValue: (val) => { param.name = val; }
  });
}

function ParameterValueEntry(props) {
  const { element, param } = props;

  return FeelEntry({
    id: `${param.id}-value`,
    element,
    label: 'Value',
    feel: 'optional',
    debounce: fn => fn,
    getValue: () => param.value,
    setValue: (val) => { param.value = val; },
    variables: [
      { name: 'customer', info: 'Customer context object' },
      { name: 'order', info: 'Current order data' },
      { name: 'response', info: 'Response from service call' }
    ]
  });
}

function createInputParameter(element, forceUpdate) {
  return function() {
    const newId = `input-${element.inputParameters.length + 1}`;
    element.inputParameters.push({
      id: newId,
      name: '',
      value: ''
    });
    forceUpdate();
  };
}

// providers ////////////////////

class ExampleHeaderProvider {
  static getElementLabel(element) {
    return element.name || element.id;
  }

  static getElementIcon() {
    return ({ width, height }) => (
      <span style={ `font-size: ${ width || 32 }px; line-height: ${ height || 32 }px;` }>
        &#9881;
      </span>
    );
  }

  static getTypeLabel(element) {
    return element.type;
  }
}

class ExamplePlaceholderProvider {
  static getEmpty() {
    return {
      text: 'Select an element to edit its properties.'
    };
  }

  static getMultiple() {
    return {
      text: 'Multiple elements selected.'
    };
  }
}