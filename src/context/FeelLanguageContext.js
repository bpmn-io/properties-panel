import {
  createContext
} from 'preact';

/**
 * @typedef { {
 *   parserDialect?: import('@bpmn-io/feel-editor').ParserDialect,
 *   builtins?: import('@bpmn-io/feel-editor').Variable[],
 *   dialect?: import('@bpmn-io/feel-editor').Dialect
 * } } FeelLanguageContextType
 */

/**
 * @type {import('preact').Context<FeelLanguageContextType>}
 */
const FeelLanguageContext = createContext({});

export default FeelLanguageContext;
