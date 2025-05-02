import { FEEL_POPUP_WIDTH, FEEL_POPUP_HEIGHT } from './FeelPopup';

function getPopupTitle({ element, label }) {
  let popupTitle = '';

  if (element && element.type) {
    popupTitle = `${element.type} / `;
  }

  return `${popupTitle}${label}`;
}

function calculatePopupPosition() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return {
    left: Math.max(0, (viewportWidth - FEEL_POPUP_WIDTH) / 2),
    top: Math.max(0, (viewportHeight - FEEL_POPUP_HEIGHT) / 2)
  };
}

export { getPopupTitle, calculatePopupPosition };