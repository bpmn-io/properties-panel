export default function InputOutputParameter(props) {

  const {
    parameter
  } = props;

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-list-item">
      <div class="bio-properties-panel-list-item-title bio-properties-panel-label">{parameter.target}</div>
    </div>
  );
}