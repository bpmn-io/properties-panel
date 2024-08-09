import { isArray } from 'min-dash';
import { ExternalLinkIcon } from './icons';

/**
 * @typedef { {
 *  getElementLabel: (element: object) => string,
 *  getTypeLabel: (element: object) => string,
 *  getElementIcon: (element: object) => import('preact').Component,
 *  getDocumentationRef: (element: object) => string
 * } } HeaderProvider
 */

/**
 * @param {Object} props
 * @param {Object} props.element,
 * @param {HeaderProvider} props.headerProvider
 */
export default function Header(props) {

  const {
    element,
    headerProvider
  } = props;

  const elements = isArray(element) ? element : [ element ];

  const {
    getElementIcon,
    getDocumentationRef,
    getElementLabel,
    getTypeLabel,
    getMultiElementIcon,
    getMultiElementDocumentationRef,
    getMultiElementLabel,
    getMultiElementTypeLabel
  } = headerProvider;

  const label = elements.length > 1 ? getMultiElementLabel(elements) : getElementLabel(element);
  const type = elements.length > 1 ? getMultiElementTypeLabel(elements) : getTypeLabel(element);
  const documentationRef = getDocumentationRef && (elements.length > 1 ? getMultiElementDocumentationRef(elements) : getDocumentationRef(element));

  const ElementIcon = elements.length > 1 ? getMultiElementIcon(elements) : getElementIcon(element);

  return (<div class="bio-properties-panel-header">
    <div class="bio-properties-panel-header-icon">
      { ElementIcon && <ElementIcon width="32" height="32" viewBox="0 0 32 32" /> }
    </div>
    <div class="bio-properties-panel-header-labels">
      <div title={ type } class="bio-properties-panel-header-type">{ type }</div>
      { label ?
        <div title={ label } class="bio-properties-panel-header-label">{ label }</div> :
        null
      }
    </div>
    <div class="bio-properties-panel-header-actions">
      { documentationRef ?
        <a
          rel="noopener"
          class="bio-properties-panel-header-link"
          href={ documentationRef }
          title="Open documentation"
          target="_blank">
          <ExternalLinkIcon />
        </a> :
        null
      }
    </div>
  </div>);
}