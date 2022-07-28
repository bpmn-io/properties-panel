import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import Placeholder from 'src/components/Placeholder';

insertCoreStyles();


describe('<Placeholder>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // when
    const result = render(<Placeholder />, { container });

    const placeholderNode = domQuery('.bio-properties-panel-placeholder', result.container);

    // then
    expect(placeholderNode).to.exist;
  });


  it('should render text', function() {

    // given
    const text = 'foo';

    // when
    const result = render(<Placeholder text={ text } />, { container });

    const placeholderText = domQuery('.bio-properties-panel-placeholder-text', result.container);

    // then
    expect(placeholderText).to.exist;
    expect(placeholderText.innerText).to.eql(text);
  });


  it('should render icon', function() {

    // given
    const Icon = (props) => <svg class={ props.class } />;

    // when
    const result = render(<Placeholder icon={ Icon } />, { container });

    const placeholderIcon = domQuery('.bio-properties-panel-placeholder-icon', result.container);

    // then
    expect(placeholderIcon).to.exist;
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      // when
      const { container: node } = render(<Placeholder text="foo" />, { container });

      // then
      await expectNoViolations(node);
    });

  });

});