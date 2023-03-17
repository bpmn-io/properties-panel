import {
  act,
  renderHook
} from '@testing-library/preact-hooks';

import {
  get,
  set
} from 'min-dash';

import {
  useLayoutState
} from 'src/hooks';

import {
  LayoutContext
} from 'src/context';

const noop = () => {};


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


  it('should set to layout context', function() {

    // given
    const layout = {
      a: {
        b: 'foo'
      }
    };

    const setLayoutForKey = (path, value) => set(layout, path, value);

    const path = [ 'a', 'b' ];

    const wrapper = createLayout({
      setLayoutForKey,
      layout
    });

    const { result } = renderHook(() => useLayoutState(path), { wrapper });

    const [ , setState ] = result.current;

    const newValue = 'newValue';

    // when
    act(() => {
      setState(newValue);
    });

    const [ value ] = result.current;

    // then
    expect(value).to.eql(newValue);
    expect(layout).to.eql({
      a: {
        b: newValue
      }
    });
  });

});


// helper ////////////////////

function createLayout(props = {}) {
  const {
    layout = {},
    getLayoutForKey = noop,
    setLayoutForKey = noop
  } = props;

  const context = {
    layout,
    getLayoutForKey,
    setLayoutForKey
  };

  return ({ children }) => <LayoutContext.Provider value={ context }>{children}</LayoutContext.Provider>;
}
