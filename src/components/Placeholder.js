/**
 * @typedef { {
 *  text: (element: object) => string,
 *  icon?: (element: Object) => import('preact').Component
 * } } PlaceholderDefinition
 *
 * @param { PlaceholderDefinition } props
 */
export default function Placeholder(props) {
  const {
    text,
    icon: Icon
  } = props;

  return (
    <div class="bio-properties-panel open">
      <section class="bio-properties-panel-placeholder">
        { Icon && <Icon class="bio-properties-panel-placeholder-icon" /> }
        <p class="bio-properties-panel-placeholder-text">{ text }</p>
      </section>
    </div>
  );
}