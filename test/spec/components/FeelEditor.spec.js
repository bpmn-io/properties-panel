import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import { useRef } from 'preact/hooks';
import { fireEvent } from '@testing-library/preact';

import FeelComponent from 'src/components/entries/FEEL/FeelEditor';

insertCoreStyles();

describe('<FeelEditor>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  it('should supply variables to editor', async function() {

    // given
    const variables = [
      { name: 'foo' },
      { name: 'bar' },
    ];

    render(<Wrapper variables={ variables } />, { container });

    // when
    const editor = domQuery('[role="textbox"]', container);
    editor.focus();
    fireEvent.keyDown(document.activeElement, { key: ' ', ctrlKey: true });

    // then
    await new Promise(res => setTimeout(res, 50));
    const suggestions = domQuery('.cm-tooltip-autocomplete > ul', container);
    expect(suggestions).to.exist;
    expect(suggestions.children).to.have.length(2);
  });


  it('should use correct variables after prop change', async function() {

    // given
    const variables = [
      { name: 'foo' },
      { name: 'bar' },
    ];

    const newVariables = [
      { name: 'baz' },
    ];

    const component = render(<Wrapper variables={ variables } />, { container });

    // when
    component.rerender(<Wrapper variables={ newVariables } />);

    const editor = domQuery('[role="textbox"]', container);

    editor.focus();
    fireEvent.keyDown(document.activeElement, { key: ' ', ctrlKey: true });

    // then
    await new Promise(res => setTimeout(res, 50));
    const suggestions = domQuery('.cm-tooltip-autocomplete', container);
    expect(suggestions).to.exist;
    expect(suggestions.children).to.have.length(1);
  });

});


// helpers ////////////////////

function Wrapper(props) {
  const ref = useRef();

  return <FeelComponent { ...props } ref={ ref } />;
}

