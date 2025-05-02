import { FEEL_POPUP_WIDTH } from './FeelPopup';

function getPopupTitle({ element, label }) {
  let popupTitle = '';

  if (element && element.type) {
    popupTitle = `${element.type} / `;
  }

  return `${popupTitle}${label}`;
}

function calculatePopupPosition({ sourceElement }) {
  const { top, left } = sourceElement.getBoundingClientRect();

  return {
    left: left - FEEL_POPUP_WIDTH - 20,
    top: top
  };
}

export { getPopupTitle, calculatePopupPosition };