import BpmnPropertiesPanel from './BpmnPropertiesPanel';

import {
  render
} from 'preact';

import {
  query as domQuery
} from 'min-dom';

const DEFAULT_PRIORITY = 1000;



function PropertiesPanel(config, injector, eventBus) {

  let { parent: parentNode } = config;

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  this._eventBus = eventBus;

  render(<BpmnPropertiesPanel
    injector={ injector }
    getProviders={ this._getProviders.bind(this) } />, parentNode);
}

/**
 * @param {number} [priority]
 * @param { { getTabs: any[] | (any) => (any[]) => any[]) } } provider
 */
PropertiesPanel.prototype.registerProvider = function(priority, provider) {

  if (!provider) {
    provider = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on('propertiesPanel.getProviders', priority, function(event) {
    event.providers.push(provider);
  });

  this._eventBus.fire('propertiesPanel.providersChanged');
};

PropertiesPanel.prototype._getProviders = function() {

  const event = this._eventBus.createEvent({
    type: 'propertiesPanel.getProviders',
    providers: []
  });

  this._eventBus.fire(event);

  return event.providers;
};

PropertiesPanel.$inject = ['config.propertiesPanel', 'injector', 'eventBus'];


export default {
  __init__: [
    'propertiesPanel'
  ],
  propertiesPanel: [ 'type', PropertiesPanel ]
};