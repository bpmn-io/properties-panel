import Group from './Group';

/**
 * @param {import('../PropertiesPanel').ListItemDefinition} props
 */
export default function ListItem(props) {

  return (
    <div class="bio-properties-panel-list-item">
      <Group { ...props } />
    </div>
  );

}