import BpmnPropertiesPanelRenderer from './BpmnPropertiesPanelRenderer';

import Commands from './cmd';

export default {
  __depends__: [
    Commands
  ],
  __init__: [
    'propertiesPanel'
  ],
  propertiesPanel: [ 'type', BpmnPropertiesPanelRenderer ]
};