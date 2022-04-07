/* eslint-disable no-unused-vars */

import { renderHook } from '@testing-library/preact-hooks';

import { useLocalValue } from 'src/hooks';


describe('hooks/useLocalValue', function() {

  it('should not return local value if not focused', function() {

    // given
    let localValue,
        localOnInput,
        onFocus,
        onBlur;

    const onInput = () => {};

    const { rerender } = renderHook(({ value }) => {
      ([
        localValue,
        localOnInput,
        onFocus,
        onBlur
      ] = useLocalValue(value, onInput));

      return null;
    }, {
      initialProps: { value: 'foo' }
    });

    // when
    rerender({ value: 'bar' });

    // then
    expect(localValue).to.equal('bar');
  });


  it('should return local value if focused', async function() {

    // given
    let localValue,
        localOnInput,
        onFocus,
        onBlur;

    const onInput = () => {};

    const { rerender } = renderHook(({ value }) => {
      ([
        localValue,
        localOnInput,
        onFocus,
        onBlur
      ] = useLocalValue(value, onInput));

      return null;
    }, {
      initialProps: { value: 'foo' }
    });

    // when
    onFocus();

    rerender({ value: 'bar' });

    // then
    expect(localValue).to.equal('foo');
  });


  it('should not return local value if blurred', async function() {

    // given
    let localValue,
        localOnInput,
        onFocus,
        onBlur;

    const onInput = () => {};

    const { rerender } = renderHook(({ value }) => {
      ([
        localValue,
        localOnInput,
        onFocus,
        onBlur
      ] = useLocalValue(value, onInput));

      return null;
    }, {
      initialProps: { value: 'foo' }
    });

    // assume
    onFocus();

    rerender({ value: 'bar' });

    expect(localValue).to.equal('foo');

    // when
    onBlur();

    rerender({ value: 'bar' });

    // then
    expect(localValue).to.equal('bar');
  });


  it('should set local value', function() {

    // given
    let localValue,
        localOnInput,
        onFocus,
        onBlur;

    const onInput = () => {};

    const { rerender } = renderHook(({ value }) => {
      ([
        localValue,
        localOnInput,
        onFocus,
        onBlur
      ] = useLocalValue(value, onInput));

      return null;
    }, {
      initialProps: { value: 'foo' }
    });

    onFocus();

    // when
    localOnInput({ target: { value: 'bar' } });

    rerender({ value: 'baz' });

    // then
    expect(localValue).to.equal('bar');
  });


  it('should propagate local value', function() {

    // given
    let localValue,
        localOnInput,
        onFocus,
        onBlur;

    const onInput = sinon.spy();

    renderHook(({ value }) => {
      ([
        localValue,
        localOnInput,
        onFocus,
        onBlur
      ] = useLocalValue(value, onInput));

      return null;
    }, {
      initialProps: { value: 'foo' }
    });

    // when
    localOnInput({ target: { value: 'bar' } });

    // then
    expect(onInput).to.have.been.calledOnceWith('bar');
  });

});