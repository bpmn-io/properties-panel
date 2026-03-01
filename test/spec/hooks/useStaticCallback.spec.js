import { expect } from 'chai';

import {
  render,
  renderHook
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import { useStaticCallback } from 'src/hooks';


describe('hooks/useStaticCallback', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should return stable function reference', function() {

    // given
    const { result, rerender } = renderHook(
      (value) => useStaticCallback(() => value),
      'first'
    );

    const firstRef = result.current;

    // when
    rerender('second');

    // then
    expect(result.current).to.equal(firstRef);
  });


  it('should call latest callback', function() {

    // given
    const { result, rerender } = renderHook(
      (value) => useStaticCallback(() => value),
      'first'
    );

    // when
    rerender('second');

    // then
    expect(result.current()).to.equal('second');
  });


  it('should not update ref during render - prevents values leaking on element change', function() {

    // given
    let stableCallback;
    let callDuringRender = false;
    const results = [];

    function Component({ value }) {
      const cb = useStaticCallback(() => value);
      stableCallback = cb;

      if (callDuringRender) {
        results.push(stableCallback());
      }

      return null;
    }

    render(<Component value="first" />, { container });

    expect(stableCallback()).to.equal('first');

    // when - call stable callback mid-render, simulating blur during unmount
    callDuringRender = true;
    render(<Component value="second" />, { container });

    // then
    expect(stableCallback()).to.equal('second');
    expect(results[0]).to.equal('first');
  });
});
