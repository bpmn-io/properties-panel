import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import { act } from 'preact/test-utils';

import {
  render
} from '@testing-library/preact/pure';

import { createElement } from 'preact';

import {
  useState,
  useCallback
} from 'preact/hooks';

import {
  query as domQuery
} from 'min-dom';

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


  it('should NOT leak values when blur fires during element switch', async function() {

    // This test reproduces the Chrome-only bug where switching elements
    // causes the old input's blur to write its value into the new element.
    //
    // Sequence:
    //   1. Render TextFieldEntry with elementA (value = 'valueA')
    //   2. Focus the input
    //   3. Re-render with elementB (value = 'valueB')
    //      - Preact unmounts old <input> (key changed) → Chrome fires blur
    //      - blur handler calls onInput → useStaticCallback → setValue
    //   4. setValue should NOT be called with 'valueA' for elementB

    const setValueSpy = sinonSpy();

    const elements = {
      a: { id: 'a' },
      b: { id: 'b' }
    };

    const values = {
      a: 'valueA',
      b: 'valueB'
    };

    function getValue(element) {
      return values[element.id];
    }

    function setValue(value) {
      setValueSpy(value);
    }

    // render with element A
    const result = render(createElement(TestTextField, {
      element: elements.a,
      getValue,
      setValue,
    }), { container });

    const input = domQuery('.test-input', container);

    // focus the input (so blur will fire on removal)
    await act(() => {
      input.focus();
    });

    // switch to element B — this causes Preact to unmount the old input
    // (keyed by element), which fires blur in Chrome
    setValueSpy.resetHistory();

    await act(() => {
      result.rerender(createElement(TestTextField, {
        element: elements.b,
        getValue,
        setValue,
      }));
    });

    // then — setValue should NOT have been called with the old value
    // Before the fix, blur would fire during unmount and write 'valueA'
    // through the already-updated useStaticCallback ref.
    const leakedCall = setValueSpy.getCalls().find(
      call => call.args[0] === 'valueA'
    );

    expect(leakedCall, 'old value should not leak to new element').to.not.exist;
  });


  it('should still commit value on intentional blur', async function() {

    // Ensure that useStaticCallback updates to the latest callback
    // after layout effects run, so normal user interactions work correctly.

    const setValueSpy = sinonSpy();

    const element = { id: 'a' };

    function getValue() {
      return '';
    }

    function setValue(value) {
      setValueSpy(value);
    }

    render(createElement(TestTextField, {
      element,
      getValue,
      setValue,
    }), { container });

    const input = domQuery('.test-input', container);

    // when — user types, which triggers onInput through handleInput
    await act(() => {
      input.focus();
      input.value = 'typed value';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // then — setValue should have been called through the useStaticCallback
    expect(setValueSpy).to.have.been.calledWith('typed value');
  });

});


// Test component that mimics the Entry → Inner component pattern:
// - Entry level uses useStaticCallback for onInput (closes over element)
// - Inner component is keyed by element (unmounts/remounts on change)
// - Inner component calls onInput on blur

function TestTextField(props) {
  const {
    element,
    getValue,
    setValue
  } = props;

  const value = getValue(element);

  const onInput = useStaticCallback((newValue) => {
    const currentValue = getValue(element);

    if (newValue !== currentValue) {
      setValue(newValue);
    }
  });

  return createElement(TestInput, {
    key: element,
    value: value,
    onInput: onInput
  });
}

function TestInput(props) {
  const {
    value,
    onInput
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const handleBlur = useCallback((e) => {
    onInput(e.target.value);
  }, [ onInput ]);

  const handleInput = useCallback((e) => {
    setLocalValue(e.target.value);
    onInput(e.target.value);
  }, [ onInput ]);

  return createElement('input', {
    class: 'test-input',
    value: localValue,
    onBlur: handleBlur,
    onInput: handleInput
  });
}


// helpers ////////////////////

/**
 * Simple renderHook helper (similar to @testing-library/preact's renderHook)
 * that allows passing an argument to the hook and re-rendering with a new one.
 */
function renderHook(hookFn, initialArg) {
  const result = { current: undefined };

  function Wrapper({ arg }) {
    result.current = hookFn(arg);
    return null;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  const rendered = render(
    createElement(Wrapper, { arg: initialArg }),
    { container }
  );

  return {
    result,
    rerender: (newArg) => {
      rendered.rerender(createElement(Wrapper, { arg: newArg }));
    },
    unmount: () => {
      rendered.unmount();
      document.body.removeChild(container);
    }
  };
}
