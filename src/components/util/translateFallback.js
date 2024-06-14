/**
 * @typedef { {
 *   [key: string]: string;
 * } } TranslateReplacements
 */

/**
 * A simple translation stub to be used for multi-language support.
 * Can be easily replaced with a more sophisticated solution.
 *
 * @param {string} template to interpolate
 * @param {TranslateReplacements} [replacements] a map with substitutes
 *
 * @return {string} the translated string
 */
export default function translateFallback(template, replacements) {

  replacements = replacements || {};

  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}';
  });
}