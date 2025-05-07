import { query as domQuery } from 'min-dom';

import TestContainer from 'mocha-test-container-support';

import FeelPopupModule from '../../../../src/features/feel-popup';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

describe('FeelPopupRenderer', function() {

  beforeEach(bootstrapDiagram({
    modules: [ FeelPopupModule ]
  }));

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render popup on <propertiesPanelPopup.open> (container = HTMLElement)', inject(function(eventBus) {

    // when
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      props: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel'
      }
    });

    // then
    expect(domQuery('.bio-properties-panel-feel-popup', container)).to.exist;
  }));


  it('should render popup on <propertiesPanelPopup.open> (container = string)', inject(function(eventBus) {

    // given
    container.classList.add('foo');

    // when
    eventBus.fire('propertiesPanelPopup.open', {
      container: '.foo',
      props: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel'
      }
    });

    // then
    expect(domQuery('.bio-properties-panel-feel-popup', container)).to.exist;
  }));


  it('should remove popup on <propertiesPanelPopup.close>', inject(function(eventBus) {

    // given
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      props: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel'
      }
    });

    // when
    eventBus.fire('propertiesPanelPopup.close');

    // then
    expect(domQuery('.bio-properties-panel-feel-popup', container)).not.to.exist;
  }));

});