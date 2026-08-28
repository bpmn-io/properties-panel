import { FEEL_POPUP_WIDTH, FEEL_POPUP_HEIGHT } from './FeelPopup';

export function getPopupTitle({ element, label }) {
  let popupTitle = '';

  if (element && element.type) {
    popupTitle = `${element.type} / `;
  }

  return `${popupTitle}${label}`;
}

export function getPopupPosition(
    width = FEEL_POPUP_WIDTH,
    height = FEEL_POPUP_HEIGHT
) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return {
    left: Math.max(0, (viewportWidth - width) / 2),
    top: Math.max(0, (viewportHeight - height) / 2)
  };
}