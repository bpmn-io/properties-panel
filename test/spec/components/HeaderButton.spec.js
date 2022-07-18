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

import { HeaderButton } from 'src/components/HeaderButton';

insertCoreStyles();


describe('<HeaderButton>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // when
    const rendered = render(<HeaderButton />, { container });

    const headerButtonNode = domQuery('.bio-properties-panel-group-header-button', rendered.container);

    // then
    expect(headerButtonNode).to.exist;
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = render(<HeaderButton>foo</HeaderButton>, { container });

      // then
      await expectNoViolations(node);
    });

  });

});
