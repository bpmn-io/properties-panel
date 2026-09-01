export function getPopupTitle({ element, label }) {
  let popupTitle = '';

  if (element && element.type) {
    popupTitle = `${element.type} / `;
  }

  return `${popupTitle}${label}`;
}