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

  const {
    getElementLabel,
    getTypeLabel,
    getElementIcon
  } = headerProvider;

  const label = getElementLabel(element);
  const type = getTypeLabel(element);
  const ElementIcon = getElementIcon(element);

  return (<div class="bio-properties-panel-header">
    <div class="bio-properties-panel-header-icon">
      <ElementIcon width="48" height="48" viewBox="0 0 48 48" />
    </div>
    <div class="bio-properties-panel-header-labels">
      { getElementLabel(element) ?
        <div title={ label } class="bio-properties-panel-header-label">{ label }</div> :
        null
      }
      <div title={ type } class="bio-properties-panel-header-type">{ type }</div>
    </div>
  </div>);
}