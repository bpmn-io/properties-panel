import {
  createContext
} from 'preact';

const TooltipContext = createContext({
  tooltip: {},
  getTooltipForId: () => {}
});

export default TooltipContext;
