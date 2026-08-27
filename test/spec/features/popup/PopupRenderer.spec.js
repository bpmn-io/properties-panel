import { expect } from 'chai';

import { query as domQuery } from 'min-dom';

import TestContainer from 'mocha-test-container-support';

import { useState } from 'preact/hooks';

import FeelPopupModule from '../../../../src/features/popup';

import { FeelPopup, TextPopup } from '../../../../src/features/popup/components';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

describe('PopupRenderer', function() {

  beforeEach(bootstrapDiagram({
    modules: [ FeelPopupModule ]
  }));

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);

    const other = document.createElement('div');

    other.classList.add('other');

    container.appendChild(other);
  });


  it('should render popup on <propertiesPanelPopup.open> (container = HTMLElement)', inject(function(eventBus) {

    // when
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      config: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel',
        component: FeelPopup
      }
    });

    // then
    const popup = domQuery('.bio-properties-panel-feel-popup', container);

    expect(popup).to.exist;
    expect(popup.parentElement.classList.contains('bio-properties-panel-popup-container')).to.be.true;

    expect(domQuery('.other', container)).to.exist;
  }));


  it('should render popup on <propertiesPanelPopup.open> (container = string)', inject(function(eventBus) {

    // given
    container.classList.add('foo');

    // when
    eventBus.fire('propertiesPanelPopup.open', {
      container: '.foo',
      config: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel',
        component: FeelPopup
      }
    });

    // then
    const popup = domQuery('.bio-properties-panel-feel-popup', container);

    expect(popup).to.exist;
    expect(popup.parentElement.classList.contains('bio-properties-panel-popup-container')).to.be.true;

    expect(domQuery('.other', container)).to.exist;
  }));


  it('should render text area popup on <propertiesPanelPopup.open> (no feel type)', inject(function(eventBus) {

    // when
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      config: {
        entryId: 'foo',
        component: TextPopup
      }
    });

    // then
    expect(domQuery('.bio-properties-panel-text-popup', container)).to.exist;
    expect(domQuery('.bio-properties-panel-feel-popup', container)).not.to.exist;
  }));


  it('should update popup props without resetting component state', inject(function(eventBus) {

    // given
    function TestPopup({ value }) {
      const [ count, setCount ] = useState(0);

      return <button class="test-popup" onClick={ () => setCount(count + 1) }>{ value } { count }</button>;
    }

    eventBus.fire('propertiesPanelPopup.open', {
      container,
      config: {
        component: TestPopup,
        value: 'before'
      }
    });

    const popup = domQuery('.test-popup', container);
    popup.click();

    // when
    eventBus.fire('propertiesPanelPopup.update', {
      config: {
        value: 'after'
      }
    });

    // then
    expect(domQuery('.test-popup', container)).to.equal(popup);
    expect(popup.textContent).to.equal('after 1');
  }));


  it('should remove popup on <propertiesPanelPopup.close>', inject(function(eventBus) {

    // given
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      config: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel',
        component: FeelPopup
      }
    });

    // when
    eventBus.fire('propertiesPanelPopup.close');

    // then
    expect(domQuery('.bio-properties-panel-feel-popup', container)).not.to.exist;
    expect(domQuery('.bio-properties-panel-popup-container', container)).not.to.exist;

    expect(domQuery('.other', container)).to.exist;
  }));

});