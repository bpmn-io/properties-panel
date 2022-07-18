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

import Header from 'src/components/Header';

insertCoreStyles();


describe('<Header>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const provider = {
      getElementLabel: () => 'name',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const headerNode = domQuery('.bio-properties-panel-header', result.container);

    // then
    expect(headerNode).to.exist;
  });


  it('should render label', function() {

    // given
    const provider = {
      getElementLabel: () => 'name',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const labelNode = domQuery('.bio-properties-panel-header-label', result.container);

    // then
    expect(labelNode).to.exist;
    expect(labelNode.innerHTML).to.equal('name');
  });


  it('should NOT render label - not given', function() {

    // given
    const provider = {
      getElementLabel: () => null,
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const labelNode = domQuery('.bio-properties-panel-header-label', result.container);

    // then
    expect(labelNode).to.not.exist;
  });


  it('should NOT render label - empty string', function() {

    // given
    const provider = {
      getElementLabel: () => '',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const labelNode = domQuery('.bio-properties-panel-header-label', result.container);

    // then
    expect(labelNode).to.not.exist;
  });


  it('should render type', function() {

    // given
    const provider = {
      getElementLabel: () => 'name',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const typeNode = domQuery('.bio-properties-panel-header-type', result.container);

    // then
    expect(typeNode).to.exist;
    expect(typeNode.innerHTML).to.equal('type');
  });


  it('should render icon', function() {

    // given
    const provider = {
      getElementLabel: () => 'name',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const iconNode = domQuery('.bio-properties-panel-header-icon', result.container);

    // then
    expect(iconNode).to.exist;
  });

  it('should NOT render documentation ref', function() {

    // given
    const provider = {
      getElementLabel: () => 'name',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const documentationNode = domQuery('.bio-properties-panel-header-link', result.container);

    // then
    expect(documentationNode).to.not.exist;
  });


  it('should render documentation ref', function() {

    // given
    const provider = {
      getElementLabel: () => 'name',
      getTypeLabel: () => 'type',
      getElementIcon: () => 'icon',
      getDocumentationRef: () => 'https://example.com'
    };

    // when
    const result = render(<Header headerProvider={ provider } />, { container });

    const documentationNode = domQuery('.bio-properties-panel-header-link', result.container);

    // then
    expect(documentationNode).to.exist;
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const provider = {
        getElementLabel: () => 'name',
        getTypeLabel: () => 'type',
        getElementIcon: () => 'icon'
      };

      const { container: node } = render(<Header headerProvider={ provider } />, { container });

      // then
      await expectNoViolations(node);
    });

  });

});