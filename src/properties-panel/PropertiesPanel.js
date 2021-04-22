import Header from './Header';

function renderGroup(props) {
  const {
    component: GroupComponent,
    entries
  } = props;

  return <GroupComponent { ...props }>
    { entries.map(e => e.component) }
  </GroupComponent>;
}


export default function PropertiesPanel(props) {
  const {
    element,
    headerProvider,
    groups,
  } = props;

  if (!element) {
    return <div class="bio-properties-panel-placeholder">Select an element to edit its properties.</div>;
  }

  return <div class="bio-properties-panel">
    <Header
      element={ element }
      headerProvider={ headerProvider } />
    <div class="bio-properties-panel-scroll-container">
      {
        groups.map(renderGroup)
      }
    </div>
  </div>;
}
