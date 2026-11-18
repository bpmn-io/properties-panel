import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import { render, cleanup, act } from '@testing-library/preact/pure';

import { query as domQuery } from 'min-dom';

import TestContainer from 'mocha-test-container-support';

import FeelPopupModule from '../../../../src/features/popup';
import PropertiesPanel from '../../../../src/PropertiesPanel';

import { FeelPopup, TextPopup } from '../../../../src/features/popup/components';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

describe('PopupRenderer', function() {

  beforeEach(bootstrapDiagram({
    modules: [ FeelPopupModule ]
  }));

  let container, layoutChanged;

  beforeEach(function() {
    container = TestContainer.get(this);

    const other = document.createElement('div');

    other.classList.add('other');

    container.appendChild(other);

    const panelContainer = document.createElement('div');
    container.appendChild(panelContainer);
    layoutChanged = sinonSpy();
    render(
      <PropertiesPanel
        element={ {} }
        groups={ [] }
        eventBus={ getDiagramJS().get('eventBus') }
        layoutChanged={ layoutChanged }
      />,
      { container: panelContainer }
    );
  });

  afterEach(function() {
    act(() => getDiagramJS().get('eventBus').fire('propertiesPanelPopup.close'));
    cleanup();
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


  it('should render before notifying that the popup opened', inject(function(eventBus) {

    // given
    const opened = sinonSpy(({ domNode }) => {
      expect(domQuery('.bio-properties-panel-text-popup', domNode)).to.exist;
    });
    eventBus.on('feelPopup.opened', opened);

    // when
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      config: { component: TextPopup, type: 'text' }
    });

    // then
    expect(domQuery('.bio-properties-panel-text-popup', container)).to.exist;
    expect(opened).to.have.been.calledOnce;
  }));


  [
    [ 'feel', FeelPopup ],
    [ 'text', TextPopup ]
  ].forEach(([ type, component ]) => {

    it(`should render ${type} popup without a properties panel`, inject(function(eventBus) {

      // given
      cleanup();
      const opened = sinonSpy();
      eventBus.on('feelPopup.opened', opened);

      // when
      eventBus.fire('propertiesPanelPopup.open', {
        container,
        config: { component, type, entryId: 'foo' }
      });

      // then
      const popup = domQuery(`.bio-properties-panel-${type}-popup`, container);
      expect(popup).to.exist;
      expect(opened).to.have.been.calledOnce;
    }));

  });


  it('should not save zero dimensions when already detached', inject(function(eventBus) {

    // given
    eventBus.fire('propertiesPanelPopup.open', {
      container,
      config: { component: TextPopup, type: 'text' }
    });
    domQuery('.bio-properties-panel-popup-container', container).remove();
    layoutChanged.resetHistory();

    // when
    eventBus.fire('propertiesPanelPopup.close');

    // then
    expect(layoutChanged).not.to.have.been.called;
  }));

});