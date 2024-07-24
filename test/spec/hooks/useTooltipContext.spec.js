import {
  renderHook
} from '@testing-library/preact';

import {
  useTooltipContext
} from 'src/hooks';

import {
  TooltipContext
} from 'src/context';

const noop = () => {};


describe('hooks/useTooltipContext', function() {

  it('should get from tooltip context', function() {

    // given
    const tooltip = {
      input1: () => 'foobar'
    };

    const getTooltipForId = (id, element) => tooltip[id](element);

    const id = 'input1';

    const wrapper = createTooltip({
      getTooltipForId,
      tooltip
    });

    // when
    const { result } = renderHook(() =>
      useTooltipContext(id, undefined, undefined), { wrapper });

    const value = result.current;

    // then
    expect(value).to.eql('foobar');
  });


  it('should return undefined if id not found in tooltip context', function() {

    // given
    const tooltip = {
      input1: () => 'foobar'
    };

    const getTooltipForId = (id, element) => tooltip[id] && tooltip[id](element);

    const id = 'input2';

    const wrapper = createTooltip({
      getTooltipForId,
      tooltip
    });

    // when
    const { result } = renderHook(() =>
      useTooltipContext(id, undefined, undefined), { wrapper });

    const value = result.current;

    // then
    expect(value).to.be.undefined;
  });


  it('should pass element argument', function() {

    // given
    const getTooltipSpy = sinon.spy();

    const tooltip = {
      input1: getTooltipSpy
    };

    const getTooltipForId = (id, element) => tooltip[id](element);

    const id = 'input1';

    const wrapper = createTooltip({
      getTooltipForId,
      tooltip
    });

    const element = { id: 'someElement' };

    // when
    renderHook(() =>
      useTooltipContext(id, element), { wrapper });

    // then
    expect(getTooltipSpy).to.have.been.calledWith(element);
    expect(getTooltipSpy).to.have.been.calledOnce;
  });

});


// helper ////////////////////

function createTooltip(props = {}) {
  const {
    tooltip = {},
    getTooltipForId = noop
  } = props;

  const context = {
    tooltip,
    getTooltipForId
  };

  return ({ children }) => <TooltipContext.Provider value={ context }>{children}</TooltipContext.Provider>;
}
