import { renderHook } from '@testing-library/preact';

import { useError } from 'src/hooks';

import { ErrorsContext } from 'src/context';


describe('hooks/useError', function() {

  it('should get error through context', function() {

    // given
    const errors = {
      foo: 'bar'
    };

    // when
    const { result } = renderHook(() => useError('foo'), { wrapper: WithErrorsContext(errors) });

    const value = result.current;

    // then
    expect(value).to.equal('bar');
  });

});


// helpers //////////

function WithErrorsContext(errors = {}) {
  return function Wrapper(props) {
    const { children } = props;

    const errorsContext = {
      errors
    };

    return (
      <ErrorsContext.Provider value={ errorsContext }>
        { children }
      </ErrorsContext.Provider>
    );
  };
}
