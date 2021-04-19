import {
  useContext
} from 'preact/hooks';

import { PropertiesPanelContext } from '../context';


export default function(type) {
  const {
    getService
  } = useContext(PropertiesPanelContext);

  return getService(type);
}