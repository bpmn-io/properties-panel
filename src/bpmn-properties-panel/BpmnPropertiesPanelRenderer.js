import BpmnPropertiesPanel from './BpmnPropertiesPanel';

import {
  render
} from 'preact';

import {
  query as domQuery
} from 'min-dom';

const DEFAULT_PRIORITY = 1000;

/**
 * @typedef { import('../properties-panel/PropertiesPanel').GroupDefinition } GroupDefinition
 * @typedef { import('../properties-panel/PropertiesPanel').ListGroupDefinition } ListGroupDefinition
 * @typedef { { getGroups: (ModdleElement) => (Array{GroupDefinition|ListGroupDefinition}) => Array{GroupDefinition|ListGroupDefinition}) } PropertiesProvider
 */

export default class BpmnPropertiesPanelRenderer {

  constructor(config, injector, eventBus) {
    let {
      parent: parentNode,
      layout: layoutConfig
    } = config || {};

    if (typeof parentNode === 'string') {
      parentNode = domQuery(parentNode);
    }

    this._eventBus = eventBus;

    render(
      <BpmnPropertiesPanel
        injector={ injector }
        getProviders={ this._getProviders.bind(this) }
        layoutConfig={ layoutConfig }
      />,
      parentNode
    );
  }

  /**
   * @param {Number} [priority]
   * @param {PropertiesProvider} provider
   */
  registerProvider(priority, provider) {

    if (!provider) {
      provider = priority;
      priority = DEFAULT_PRIORITY;
    }

    this._eventBus.on('propertiesPanel.getProviders', priority, function(event) {
      event.providers.push(provider);
    });

    this._eventBus.fire('propertiesPanel.providersChanged');
  }

  _getProviders() {
    const event = this._eventBus.createEvent({
      type: 'propertiesPanel.getProviders',
      providers: []
    });

    this._eventBus.fire(event);

    return event.providers;
  }

  attach() {}

  detach() {}
}

BpmnPropertiesPanelRenderer.$inject = ['config.propertiesPanel', 'injector', 'eventBus'];