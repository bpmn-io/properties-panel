import { expect } from 'chai';

import { renderHook } from '@testing-library/preact';

import { useAllDiagnostics, useDiagnostics } from 'src/hooks';

import {
  useDisplayedDiagnostic,
  useGroupDiagnostic,
  useListDiagnostic
} from 'src/hooks/useDiagnostics';

import { DiagnosticsContext, ErrorsContext } from 'src/context';


describe('hooks/useDiagnostics', function() {

  describe('useDiagnostics', function() {

    it('should get diagnostics through context', function() {

      // given
      const diagnostic = { severity: 'warning', message: 'bar' };

      const diagnostics = {
        foo: [ diagnostic ]
      };

      // when
      const { result } = renderHook(() => useDiagnostics('foo'), {
        wrapper: WithContexts({ diagnostics })
      });

      // then
      expect(result.current).to.eql([ diagnostic ]);
    });


    it('should get no diagnostics for unknown entry', function() {

      // when
      const { result } = renderHook(() => useDiagnostics('foo'), {
        wrapper: WithContexts({})
      });

      // then
      expect(result.current).to.be.empty;
    });


    it('should fall back to deprecated errors', function() {

      // given
      const errors = {
        foo: 'bar'
      };

      // when
      const { result } = renderHook(() => useDiagnostics('foo'), {
        wrapper: WithContexts({ errors })
      });

      // then
      expect(result.current).to.eql([ { severity: 'error', message: 'bar' } ]);
    });


    it('should prefer diagnostics over deprecated errors', function() {

      // given
      const diagnostics = {
        foo: [ { severity: 'warning', message: 'diagnostic' } ]
      };

      const errors = {
        foo: 'error'
      };

      // when
      const { result } = renderHook(() => useDiagnostics('foo'), {
        wrapper: WithContexts({ diagnostics, errors })
      });

      // then
      expect(result.current).to.eql([ { severity: 'warning', message: 'diagnostic' } ]);
    });

  });


  describe('useAllDiagnostics', function() {

    it('should get diagnostics of all entries', function() {

      // given
      const diagnostics = {
        foo: [ { severity: 'error', message: 'foo' } ]
      };

      const errors = {
        bar: 'bar'
      };

      // when
      const { result } = renderHook(() => useAllDiagnostics(), {
        wrapper: WithContexts({ diagnostics, errors })
      });

      // then
      expect(result.current).to.eql({
        foo: [ { severity: 'error', message: 'foo' } ],
        bar: [ { severity: 'error', message: 'bar' } ]
      });
    });

  });


  describe('useDisplayedDiagnostic', function() {

    it('should get the most severe diagnostic of an entry', function() {

      // given
      const diagnostics = {
        foo: [
          { severity: 'warning', message: 'warning' },
          { severity: 'error', message: 'error' }
        ]
      };

      // when
      const { result } = renderHook(() => useDisplayedDiagnostic('foo'), {
        wrapper: WithContexts({ diagnostics })
      });

      // then
      expect(result.current).to.eql({ severity: 'error', message: 'error' });
    });


    it('should get null for unknown entry', function() {

      // when
      const { result } = renderHook(() => useDisplayedDiagnostic('foo'), {
        wrapper: WithContexts({})
      });

      // then
      expect(result.current).to.be.null;
    });

  });


  describe('useGroupDiagnostic', function() {

    it('should get the most severe diagnostic across a group\'s entries', function() {

      // given
      const diagnostics = {
        foo: [ { severity: 'warning', message: 'warning' } ],
        bar: [ { severity: 'error', message: 'error' } ]
      };

      const entries = [ { id: 'foo' }, { id: 'bar' } ];

      // when
      const { result } = renderHook(() => useGroupDiagnostic(entries), {
        wrapper: WithContexts({ diagnostics })
      });

      // then
      expect(result.current).to.eql({ severity: 'error', message: 'error' });
    });

  });


  describe('useListDiagnostic', function() {

    it('should get the most severe diagnostic across a list group\'s items', function() {

      // given
      const diagnostics = {
        foo: [ { severity: 'warning', message: 'warning' } ],
        bar: [ { severity: 'error', message: 'error' } ]
      };

      const items = [ { id: 'foo' }, { id: 'bar' } ];

      // when
      const { result } = renderHook(() => useListDiagnostic(items), {
        wrapper: WithContexts({ diagnostics })
      });

      // then
      expect(result.current).to.eql({ severity: 'error', message: 'error' });
    });

  });

});


// helpers //////////

function WithContexts({ diagnostics = {}, errors = {} }) {
  return function Wrapper(props) {
    const { children } = props;

    return (
      <DiagnosticsContext.Provider value={ { diagnostics } }>
        <ErrorsContext.Provider value={ { errors } }>
          { children }
        </ErrorsContext.Provider>
      </DiagnosticsContext.Provider>
    );
  };
}
