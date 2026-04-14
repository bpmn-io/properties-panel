import { render } from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  insertCoreStyles
} from 'test/TestHelper';

import PropertiesPanel from 'src/PropertiesPanel';

import ListGroup from 'src/components/ListGroup';

import {
  TextFieldEntry,
  TextAreaEntry,
  CheckboxEntry,
  JsonEditorEntry,
  NumberFieldEntry,
  SelectEntry,
  ToggleSwitchEntry,
  FeelEntry
} from 'src/components/entries';

import { EventContext } from 'src/context';

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

    // given
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

    const groups = [
      {
        id: 'general',
        label: 'General',
        entries: [
          {
            id: 'name',
            component: TextFieldComponent,
            label: 'Name',
            description: 'The display name of the element.',
            element
          },
          {
            id: 'documentation',
            component: TextAreaComponent,
            label: 'Documentation',
            description: 'Documentation for this element.',
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
            label: 'Expression',
            description: 'A FEEL expression to evaluate.',
            feel: 'required',
            element
          },
          {
            id: 'conditionExpression',
            component: FeelEntryComponent,
            label: 'Condition',
            description: 'Optional FEEL condition (toggle FEEL mode with = prefix).',
            feel: 'optional',
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
            label: 'Implementation',
            description: 'How this task is implemented.',
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
            label: 'Java Class',
            description: 'Fully qualified class name.',
            element
          },
          {
            id: 'retryCount',
            component: NumberFieldComponent,
            label: 'Retry Count',
            description: 'Number of retries on failure.',
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
            label: 'Example Data (JSON)',
            description: 'Provide example output data as a JSON object.',
            element
          }
        ]
      },
      {
        id: 'inputs',
        label: 'Input Parameters',
        component: ListGroup,
        add: createInputParameter(element),
        items: element.inputParameters.map(param => ({
          id: param.id,
          label: param.name,
          entries: [
            {
              id: `${param.id}-name`,
              component: createParameterNameEntry(element, param),
              isEdited: () => !!param.name
            },
            {
              id: `${param.id}-value`,
              component: createParameterValueEntry(element, param),
              isEdited: () => !!param.value
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
            label: 'Asynchronous',
            description: 'Execute this task asynchronously.',
            element
          },
          {
            id: 'exclusive',
            component: ToggleSwitchComponent,
            label: 'Exclusive',
            description: 'Exclusive job execution.',
            element
          }
        ]
      }
    ];

    // when
    render(
      <EventContext.Provider value={ { eventBus } }>
        <PropertiesPanel
          element={ element }
          headerProvider={ ExampleHeaderProvider }
          placeholderProvider={ ExamplePlaceholderProvider }
          groups={ groups }
          layoutConfig={ {} }
          layoutChanged={ () => {} }
        />
      </EventContext.Provider>,
      { container }
    );

    // then — keep open for interactive use with SINGLE_START
    await new Promise(() => {});
  });
});

function TextFieldComponent(props) {
  const { id, element, label, description } = props;

  return TextFieldEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    getValue: () => element[id] || '',
    setValue: (val) => { element[id] = val; }
  });
}

function TextAreaComponent(props) {
  const { id, element, label, description } = props;

  return TextAreaEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => { element[id] = val; }
  });
}

function CheckboxComponent(props) {
  const { id, element, label, description } = props;

  return CheckboxEntry({
    id,
    element,
    label,
    description,
    getValue: () => element[id] ?? false,
    setValue: (val) => { element[id] = val; }
  });
}

function NumberFieldComponent(props) {
  const { id, element, label, description } = props;

  return NumberFieldEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => { element[id] = val; }
  });
}

function SelectComponent(props) {
  const { id, element, label, description, options } = props;

  return SelectEntry({
    id,
    element,
    label,
    description,
    getValue: () => element[id] ?? '',
    setValue: (val) => { element[id] = val; },
    getOptions: () => options
  });
}

function ToggleSwitchComponent(props) {
  const { id, element, label, description } = props;

  return ToggleSwitchEntry({
    id,
    element,
    label,
    description,
    getValue: () => element[id] ?? false,
    setValue: (val) => { element[id] = val; }
  });
}

function FeelEntryComponent(props) {
  const { id, element, label, description, feel } = props;

  return FeelEntry({
    id,
    element,
    label,
    description,
    feel,
    debounce: fn => fn,
    getValue: () => element[id] ?? '',
    setValue: (val) => { element[id] = val; },
    variables: [
      { name: 'myVariable', info: 'A sample variable' },
      { name: 'customer', info: 'Customer context object' },
      { name: 'order', info: 'Current order data' }
    ]
  });
}

function createParameterNameEntry(element, param) {
  return function ParameterNameEntry(props) {
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

function createParameterValueEntry(element, param) {
  return function ParameterValueEntry(props) {
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

function createInputParameter(element) {
  return function() {
    const newId = `input-${element.inputParameters.length + 1}`;
    element.inputParameters.push({
      id: newId,
      name: '',
      value: ''
    });
  };
}

function JsonEditorComponent(props) {
  const { id, element, label, description } = props;

  return JsonEditorEntry({
    id,
    element,
    label,
    description,
    debounce: fn => fn,
    tooltip: 'Enter a JSON object representing example output data for this element.',
    placeholder: '{ }',
    getValue: () => element[id] ?? '',
    setValue: (val) => { element[id] = val; }
  });
}

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