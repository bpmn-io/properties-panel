import Header from './Header';


export default function PropertiesPanel(props) {
  const {
    element,
    groups
  } = props;

  if (!element) {
    return <div class="bio-properties-panel-placeholder">Select an element to edit its properties.</div>;
  }

  return <div class="bio-properties-panel">
    <Header element={ element } />
    <div class="bio-properties-panel-scroll-container">
      {
        groups
      }
    </div>
  </div>;
}
