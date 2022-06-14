export function FeelIndicator(props) {
  const {
    active
  } = props;

  if (!active) {
    return null;
  }

  return <span class="FeelIndicator">
    <button disabled>=</button>
  </span>;
}