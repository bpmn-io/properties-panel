import {
  renderHook
} from '@testing-library/preact';

import {
  useDescriptionContext
} from 'src/hooks';

import {
  DescriptionContext
} from 'src/context';

const noop = () => {};


describe('hooks/useDescriptionContext', function() {

  it('should get from description context', function() {

    // given
    const description = {
      input1: () => 'foobar'
    };

    const getDescriptionForId = (id, element) => description[id](element);

    const id = 'input1';

    const wrapper = createDescription({
      getDescriptionForId,
      description
    });

    // when
    const { result } = renderHook(() =>
      useDescriptionContext(id, undefined, undefined), { wrapper });

    const value = result.current;

    // then
    expect(value).to.eql('foobar');
  });


  it('should return undefined if id not found in description context', function() {

    // given
    const description = {
      input1: () => 'foobar'
    };

    const getDescriptionForId = (id, element) => description[id] && description[id](element);

    const id = 'input2';

    const wrapper = createDescription({
      getDescriptionForId,
      description
    });

    // when
    const { result } = renderHook(() =>
      useDescriptionContext(id, undefined, undefined), { wrapper });

    const value = result.current;

    // then
    expect(value).to.be.undefined;
  });


  it('should pass element argument', function() {

    // given
    const getDescriptionSpy = sinon.spy();

    const description = {
      input1: getDescriptionSpy
    };

    const getDescriptionForId = (id, element) => description[id](element);

    const id = 'input1';

    const wrapper = createDescription({
      getDescriptionForId,
      description
    });

    const element = { id: 'someElement' };

    // when
    renderHook(() =>
      useDescriptionContext(id, element), { wrapper });

    // then
    expect(getDescriptionSpy).to.have.been.calledWith(element);
    expect(getDescriptionSpy).to.have.been.calledOnce;
  });

});


// helper ////////////////////

function createDescription(props = {}) {
  const {
    description = {},
    getDescriptionForId = noop
  } = props;

  const context = {
    description,
    getDescriptionForId
  };

  return ({ children }) => <DescriptionContext.Provider value={ context }>{children}</DescriptionContext.Provider>;
}
