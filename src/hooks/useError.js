import { useContext } from 'preact/hooks';

import { ErrorsContext } from '../context';

export function useError(id) {
  const { errors } = useContext(ErrorsContext);

  return errors[ id ];
}

export function useErrors() {
  const { errors } = useContext(ErrorsContext);

  return errors;
}