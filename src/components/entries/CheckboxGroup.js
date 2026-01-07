import Description from './Description';
import Tooltip from './Tooltip';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * Wrapper component for a set of `CheckboxEntry` components.
 *
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.label
 * @param {String} [props.description]
 * @param {string|import('preact').Component} [props.tooltip]
 * @param {import('preact').ComponentChildren} props.children
 */
export default function CheckboxGroup(props) {
  const {
    element,
    id,
    label,
    description,
    tooltip,
    children
  } = props;

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-checkbox-group" data-entry-id={ id }>
      <div class="bio-properties-panel-group-header">
        <p class="bio-properties-panel-label">
          <Tooltip value={ tooltip } forId={ id } element={ element }>
            { label }
          </Tooltip>
        </p>
      </div>
      <div class="bio-properties-panel-checkbox-group-entries">
        { children }
      </div>
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}
