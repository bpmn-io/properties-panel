import {
  useDescriptionContext
} from '../../hooks';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.forId - id of the entry the description is used for
 * @param {String} props.value
 */
export default function Description(props) {
  const {
    element,
    forId,
    value
  } = props;

  const contextDescription = useDescriptionContext(forId, element);

  const description = value || contextDescription;

  if (description) {
    return (
      <div class="bio-properties-panel-description">
        { description }
      </div>
    );
  }
}
