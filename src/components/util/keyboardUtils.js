/**
 * @param {KeyboardEvent} event
 * @return {boolean}
 */
export function isCmd(event) {

  // ensure we don't react to AltGr
  // (mapped to CTRL + ALT)
  if (event.altKey) {
    return false;
  }

  return event.ctrlKey || event.metaKey;
}

export function isCmdWithChar(event) {
  return isCmd(event) && event.key.length === 1 && /^[a-zA-Z]$/.test(event.key);
}