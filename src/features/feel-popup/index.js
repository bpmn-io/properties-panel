import { FeelPopupManager } from './FeelPopupManager';
import { FeelPopupRenderer } from './FeelPopupRenderer';

export const FeelPopupModule = {
  __init__: [ 'feelPopupManager', 'feelPopupRenderer' ],
  feelPopupManager: [ 'type', FeelPopupManager ],
  feelPopupRenderer: [ 'type', FeelPopupRenderer ],
};

export * from './components';