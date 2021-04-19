// todo: make dynamic
import ServiceTaskIcon from '../../icons/ServiceTask.svg';


export default function Header(props) {

  const {
    element
  } = props;

  const label = typeToLabel(element.type);

  return (<div class="bio-properties-panel-header">
    <div class="bio-properties-panel-header-icon">
      <ServiceTaskIcon width="36" height="36" viewBox="0 0 54 54" />
    </div>
    <div>
      {

        // todo: make dynamic
        <div class="bio-properties-panel-header-label">{ element.businessObject.name || '<empty label>' }</div>
      }
      <span class="bio-properties-panel-header-type">{ label }</span>
    </div>
  </div>);
}


// helper ////////////////

function typeToLabel(type) {
  return type.split(':')[1]
    .replace(/([A-Z])/g, ' $1')
    .toUpperCase();
}