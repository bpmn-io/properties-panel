import {
  useState,
  useMemo,
  useCallback
} from 'preact/hooks';

import {
  find,
  reduce
} from 'min-dash';

import PropertiesPanel from '../properties-panel';

import {
  PropertiesPanelContext
} from './context';

// todo: collect somewhere else
const ELEMENT_ICON_MAP = {
  'bpmn:ServiceTask': require('../../icons/ServiceTask.svg').default,
  'bpmn:StartEvent': require('../../icons/StartEvent.svg').default,
  'default': require('../../icons/DefaultElement.svg').default
};


export default function BpmnPropertiesPanel(props) {
  const {
    element,
    injector,
    getProviders
  } = props;

  // (1) create properties panel context
  const [ state, setState ] = useState({
    selectedElement: element
  });

  const setSelectedElement = useCallback((element) => {

    setState({
      ...state,
      selectedElement: element.type === 'label' ? element.labelTarget : element
    });
  }, [ state.selectedElement ]);

  const selectedElement = useMemo(() => state.selectedElement, [ state.selectedElement ]);

  const propertiesPanelContext = {
    selectedElement,
    setSelectedElement,
    injector,
    getService(type) { return injector.get(type); }
  };

  // (2) react on element changes
  const eventBus = injector.get('eventBus');

  const canvas = injector.get('canvas');

  eventBus.on('root.added', function(e) {
    const { element } = e;

    if (isImplicitRoot(element)) {
      return;
    }

    setSelectedElement(element);
  });

  eventBus.on('selection.changed', function(e) {
    const newElement = e.newSelection[0];

    const rootElement = canvas.getRootElement();

    if (isImplicitRoot(rootElement)) {
      return;
    }

    setSelectedElement(newElement || rootElement);
  });

  eventBus.on('elements.changed', function(e) {
    const elements = e.elements;

    const updatedElement = findElement(elements, selectedElement);

    if (updatedElement) {
      setSelectedElement(updatedElement);
    }
  });

  // (3) retrieve groups for selected element
  const providers = useMemo(() => getProviders(selectedElement), [ getProviders(selectedElement) ]);

  const groups = useMemo(() => {
    return reduce(providers, function(groups, provider) {
      const updater = provider.getGroups(selectedElement);
      return updater(groups);
    }, []);
  }, [ providers ]);


  return <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
    <PropertiesPanel
      element={ selectedElement }
      elementIcons={ ELEMENT_ICON_MAP }
      getElementLabel={ (element) => element.businessObject.name } // todo: do via context
      groups={ groups } />
  </PropertiesPanelContext.Provider>;
}


// helper //////////////////////////

function isImplicitRoot(element) {
  return element.id === '__implicitroot';
}

function findElement(elements, element) {
  return find(elements, (e) => e === element);
}
