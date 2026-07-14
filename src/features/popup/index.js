import { Popup } from './Popup';
import { PopupRenderer } from './PopupRenderer';

export default {
  __init__: [ 'feelPopup', 'feelPopupRenderer' ],
  feelPopup: [ 'type', Popup ],
  feelPopupRenderer: [ 'type', PopupRenderer ],
};
