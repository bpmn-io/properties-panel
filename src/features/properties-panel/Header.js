export default function Header(props) {

  const {
    element,
    elementIcons,
    getElementLabel
  } = props;

  const {
    type
  } = element;

  const label = typeToLabel(type);

  const ElementIcon = elementIcons[type] || elementIcons['default'];

  return (<div class="bio-properties-panel-header">
    <div class="bio-properties-panel-header-icon">
      <ElementIcon width="48" height="48" viewBox="0 0 48 48" />
    </div>
    <div>
      <div class="bio-properties-panel-header-label">{ getElementLabel(element) || '<empty label>' }</div>
      <span class="bio-properties-panel-header-type">{ label }</span>
    </div>
  </div>);
}


// helper ////////////////

function typeToLabel(type) {
  return type.split(':')[1]
    .replace(/([A-Z])/g, ' $1')
    .toUpperCase();
}