import {
  createContext
} from 'preact';

const ErrorsContext = createContext({
  errors: {}
});

export default ErrorsContext;