import { renderHook } from '@testing-library/preact-hooks';

import { useKeyFactory } from 'src/hooks';


describe('hooks/useKeyFactory', function() {

  it('should persist keys between calls', function() {

    // given
    const { result } = renderHook(() => useKeyFactory());
    const object = {};

    // when
    const firstKey = result.current(object);
    const secondKey = result.current(object);

    // then
    expect(firstKey).to.eql(secondKey);
  });


  it('should generate different keys for different objects', function() {

    // given
    const { result } = renderHook(() => useKeyFactory());

    // when
    const firstKey = result.current({});
    const secondKey = result.current({});

    // then
    expect(firstKey).not.to.eql(secondKey);
  });
});
