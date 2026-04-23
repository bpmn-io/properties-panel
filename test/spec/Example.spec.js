import { render } from 'preact';
import { useReducer, useCallback } from 'preact/hooks';

import TestContainer from 'mocha-test-container-support';

import {
  insertCoreStyles
} from 'test/TestHelper';

import PropertiesPanel from 'src/PropertiesPanel';

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
  isFeelEntryEdited
} from 'src/components/entries';

import EventBus from 'diagram-js/lib/core/EventBus';

insertCoreStyles();

const singleStart = window.__env__?.SINGLE_START;

describe('Example', function() {

  let container;

  beforeEach(function() {
    container = document.createElement('div');
    container.style.width = '350px';
    container.style.marginLeft = 'auto';

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
  exampleData: '{\n  "orderId": "12345",\n  "customer": {\n    "name": "Jane Doe",\n    "email": "jane@example.com"\n  },\n  "items": [\n    { "id": 1, "price": 29.99 },\n    { "id": 2, "price": 49.99 }\n  ]\n}',
  retryCount: 3,
  async: false,
  expression: '=myVariable + 10',
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

function ExampleApp() {
  const [ , forceUpdate ] = useReducer(x => x + 1, 0);

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
      id: 'feel-expressions',
      label: 'FEEL Expressions',
      entries: [
        {
          id: 'expression',
          component: FeelEntryComponent,
          isEdited: isFeelEntryEdited,
          label: 'Expression',
          description: 'A FEEL expression to evaluate.',
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
            component: createParameterNameEntry(param),
          },
          {
            id: `${param.id}-value`,
            component: createParameterValueEntry(param),
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

  return (
    <PropertiesPanel
      element={ element }
      headerProvider={ ExampleHeaderProvider }
      placeholderProvider={ ExamplePlaceholderProvider }
      groups={ groups }
      eventBus={ eventBus }
      layoutConfig={ layoutConfig }
      layoutChanged={ noop }
    />
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

function createParameterNameEntry(param) {
  return function ParameterNameEntry(props) {
    const { element } = props;

    return TextFieldEntry({
      id: `${param.id}-name`,
      element,
      label: 'Name',
      debounce: fn => fn,
      getValue: () => param.name,
      setValue: (val) => { param.name = val; }
    });
  };
}

function createParameterValueEntry(param) {
  return function ParameterValueEntry(props) {
    const { element } = props;

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
  };
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
    return () => <span>&#9881;</span>;
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