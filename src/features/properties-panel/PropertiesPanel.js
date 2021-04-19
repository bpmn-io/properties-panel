import Header from './Header';

function renderGroup(props) {
  const {
    id,
    component: GroupComponent,
    entries,
    label
  } = props;

  return <GroupComponent id={ id } label={ label }>
    { entries.map(e => e.component) }
  </GroupComponent>;
}


export default function PropertiesPanel(props) {
  const {
    element,
    elementIcons,
    groups,
    getElementLabel
  } = props;

  if (!element) {
    return <div class="bio-properties-panel-placeholder">Select an element to edit its properties.</div>;
  }

  return <div class="bio-properties-panel">
    <Header
      element={ element }
      elementIcons={ elementIcons }
      getElementLabel={ getElementLabel } />
    <div class="bio-properties-panel-scroll-container">
      {
        groups.map(renderGroup)
      }
    </div>
  </div>;
}
