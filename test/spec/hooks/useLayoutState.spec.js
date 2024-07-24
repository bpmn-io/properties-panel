import {
  act,
  renderHook
} from '@testing-library/preact';

import {
  assign,
  get,
  set
} from 'min-dash';

import {
  useLayoutState
} from 'src/hooks';

import {
  LayoutContext
} from 'src/context';
import { useContext, useState } from 'preact/hooks';


describe('hooks/useLayoutState', function() {

  it('should get from layout context', function() {

    // given
    const layout = {
      a: {
        b: 'foo'
      }
    };

    const getLayoutForKey = (path) => get(layout, path);

    const path = [ 'a', 'b' ];

    const wrapper = createLayout({
      getLayoutForKey,
      layout
    });

    // when
    const { result } = renderHook(() => useLayoutState(path), { wrapper });

    const value = result.current[0];

    // then
    expect(value).to.eql('foo');
  });


  it('should get default value', function() {

    // given
    const layout = {};

    const getLayoutForKey = (path, defaultValue) => get(layout, path, defaultValue);

    const path = [ 'a', 'b' ];

    const wrapper = createLayout({
      getLayoutForKey
    });

    // when
    const { result } = renderHook(() => useLayoutState(path, 'default'), { wrapper });

    const [ value ] = result.current;

    // then
    expect(value).to.equal('default');
  });


  it('should set to layout context', async function() {

    // given
    const layout = {
      a: {
        b: 'foo'
      }
    };

    const path = [ 'a', 'b' ];

    const wrapper = createLayout({
      layout
    });

    const { result } = renderHook(() => {
      return {
        state: useLayoutState(path),
        context: useContext(LayoutContext)
      };
    }, { wrapper });

    const [ , setState ] = result.current.state;

    const newValue = 'newValue';

    // when
    act(() => {
      setState(newValue);
    });

    const [ value ] = result.current.state;
    const newLayout = result.current.context.layout;


    // then
    expect(value).to.eql(newValue);
    expect(newLayout).to.eql({
      a: {
        b: newValue
      }
    });
  });

});


// helper ////////////////////

function createLayout(props = {}) {

  return ({ children }) => {
    const {
      layout = {},
    } = props;

    const [ _layout, setLayout ] = useState(layout);

    const getLayoutForKey = props.getLayoutForKey || function(path, defaultValue) {
      return get(_layout, path) || defaultValue;
    };

    const setLayoutForKey = props.setLayoutForKey || function(path, value) {
      const newLayout = assign({}, layout);
      set(newLayout, path, value);
      setLayout(newLayout);
    };

    const context = {
      layout: _layout,
      getLayoutForKey,
      setLayoutForKey
    };

    return <LayoutContext.Provider value={ context }>{children}</LayoutContext.Provider>;
  };
}
