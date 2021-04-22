import {
  useCallback
} from 'preact/hooks';


export default function Header(props) {

  const {
    element,
    headerProvider
  } = props;

  const {
    type
  } = element;

  const getElementLabel = useCallback(headerProvider.getElementLabel, [ headerProvider.getElementLabel]);
  const getElementIcon = useCallback(headerProvider.getElementIcon, [ headerProvider.getElementIcon]);

  const typeLabel = typeToLabel(type);

  const ElementIcon = getElementIcon(element);

  return (<div class="bio-properties-panel-header">
    <div class="bio-properties-panel-header-icon">
      <ElementIcon width="48" height="48" viewBox="0 0 48 48" />
    </div>
    <div>
      <div class="bio-properties-panel-header-label">{ getElementLabel(element) || '<empty label>' }</div>
      <span class="bio-properties-panel-header-type">{ typeLabel }</span>
    </div>
  </div>);
}


// helper ////////////////

function typeToLabel(type) {
  return type.split(':')[1]
    .replace(/([A-Z])/g, ' $1')
    .toUpperCase();
}