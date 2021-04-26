import {
  useCallback
} from 'preact/hooks';

/**
 * @typedef { { getElementLabel: Function, getTypeLabel: Function, getElementIcon: Function } } HeaderProvider
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

  const getElementLabel = useCallback(headerProvider.getElementLabel, [ headerProvider.getElementLabel]);
  const getTypeLabel = useCallback(headerProvider.getTypeLabel, [ headerProvider.getTypeLabel]);
  const getElementIcon = useCallback(headerProvider.getElementIcon, [ headerProvider.getElementIcon]);

  const ElementIcon = getElementIcon(element);

  return (<div class="bio-properties-panel-header">
    <div class="bio-properties-panel-header-icon">
      <ElementIcon width="48" height="48" viewBox="0 0 48 48" />
    </div>
    <div>
      <div class="bio-properties-panel-header-label">{ getElementLabel(element) || '<empty label>' }</div>
      <span class="bio-properties-panel-header-type">{ getTypeLabel(element) }</span>
    </div>
  </div>);
}