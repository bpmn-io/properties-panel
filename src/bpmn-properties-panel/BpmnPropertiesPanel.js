import {
  useState,
  useMemo,
  useCallback,
  useEffect
} from 'preact/hooks';

import {
  find,
  reduce
} from 'min-dash';

import PropertiesPanel from '../properties-panel';

import {
  BpmnPropertiesPanelContext
} from './context';

import PanelHeaderProvider from './PanelHeaderProvider';

/**
 * @param {Object} props
 * @param {ModdleElement} [props.element]
 * @param {Injector} props.injector
 * @param { (ModdleElement) => Array<PropertiesProvider> } props.getProviders
 * @param {Object} props.layoutConfig
 */
export default function BpmnPropertiesPanel(props) {
  const {
    element,
    injector,
    getProviders,
    layoutConfig
  } = props;

  const eventBus = injector.get('eventBus');

  const canvas = injector.get('canvas');

  const [ state, setState ] = useState({
    selectedElement: element
  });

  const selectedElement = state.selectedElement;

  const _update = useCallback((element) => {

    let newSelectedElement = element || selectedElement;

    if (newSelectedElement && newSelectedElement.type === 'label') {
      newSelectedElement = newSelectedElement.labelTarget;
    }

    setState({
      ...state,
      selectedElement: newSelectedElement
    });

    // notify interested parties on property panel updates
    eventBus.fire('propertiesPanel.updated');

  }, [ selectedElement ]);


  // (2) react on element changes
  useEffect(() => {

    const onSelectionChanged = (e) => {
      const newElement = e.newSelection[0];

      const rootElement = canvas.getRootElement();

      if (isImplicitRoot(rootElement)) {
        return;
      }

      _update(newElement || rootElement);
    };

    const onElementsChanged = (e) => {
      const elements = e.elements;

      const updatedElement = findElement(elements, selectedElement);

      if (updatedElement) {
        _update(updatedElement);
      }
    };

    const onProvidersChanged = () => {
      _update();
    };


    eventBus.on('selection.changed', onSelectionChanged);
    eventBus.on('elements.changed', onElementsChanged);
    eventBus.on('propertiesPanel.providersChanged', onProvidersChanged);

    return () => {
      eventBus.off('selection.changed', onSelectionChanged);
      eventBus.off('elements.changed', onElementsChanged);
      eventBus.off('propertiesPanel.providersChanged', onProvidersChanged);
    };
  }, [ eventBus, selectedElement ]);

  eventBus.on('root.added', function(e) {
    const { element } = e;

    if (isImplicitRoot(element)) {
      return;
    }

    _update(element);
  });

  // (2) create properties panel context
  const bpmnPropertiesPanelContext = {
    selectedElement,
    injector,
    getService(type, strict) { return injector.get(type, strict); }
  };

  // (3) retrieve groups for selected element
  const providers = getProviders(selectedElement);

  const groups = useMemo(() => {
    return reduce(providers, function(groups, provider) {
      const updater = provider.getGroups(selectedElement);

      return updater(groups);
    }, []);
  }, [ providers, selectedElement ]);

  // (4) notify layout changes
  const onLayoutChanged = (layout) => {
    eventBus.fire('propertiesPanel.layoutChanged', {
      layout
    });
  };


  return <BpmnPropertiesPanelContext.Provider value={ bpmnPropertiesPanelContext }>
    <PropertiesPanel
      element={ selectedElement }
      headerProvider={ PanelHeaderProvider }
      groups={ groups }
      layoutConfig={ layoutConfig }
      layoutChanged={ onLayoutChanged } />
  </BpmnPropertiesPanelContext.Provider>;
}


// helpers //////////////////////////

function isImplicitRoot(element) {
  return element && element.id === '__implicitroot';
}

function findElement(elements, element) {
  return find(elements, (e) => e === element);
}
