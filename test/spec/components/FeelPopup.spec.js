import {
  act,
  fireEvent,
  render,
  waitFor
} from '@testing-library/preact/pure';

import { useContext, useRef } from 'preact/hooks';

import TestContainer from 'mocha-test-container-support';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import { FeelPopupContext } from 'src/components/entries/FEEL/context';

import FEELPopupRoot from 'src/components/entries/FEEL/FeelPopup';

insertCoreStyles();

const noopElement = {
  id: 'foo',
  type: 'foo'
};


describe('<FeelPopup>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render children', function() {

    // when
    createFeelPopup({}, container);

    const childComponent = domQuery('.child-component', container);

    // then
    expect(childComponent).to.exist;
  });


  it('should render popup in container', async function() {

    // given
    const parent = document.createElement('div');

    // when
    createFeelPopup({ popupContainer: parent }, container);

    const childComponent = domQuery('.child-component', container);

    const btn = domQuery('button', childComponent);

    // when
    await act(() => {
      btn.click();
    });

    // assume
    expect(domQuery('.bio-properties-panel-feel-editor-container', parent)).to.exist;

    // then
    expect(childComponent).to.exist;
  });


  it('should render links', async function() {

    // given
    const parent = document.createElement('div');

    // when
    createFeelPopup({
      popupContainer: parent,
      getPopupLinks: (type) => {
        if (type === 'foo') {
          return [
            { href: 'https://foo.com/', title: 'Foo' },
            { href: 'https://bar.com/', title: 'Bar' }
          ];
        }

        return [];
      },
      type: 'foo'
    }, container);

    const childComponent = domQuery('.child-component', container);

    const btn = domQuery('button', childComponent);

    // when
    await act(() => {
      btn.click();
    });

    // then
    const links = domQueryAll('.bio-properties-panel-feel-popup__title-link', parent);

    expect(links.length).to.equal(2);

    expect(links[0].href).to.equal('https://foo.com/');
    expect(links[0].textContent).to.equal('Foo');

    expect(links[1].href).to.equal('https://bar.com/');
    expect(links[1].textContent).to.equal('Bar');
  });


  it('should restore focus on source element', async function() {

    // given
    createFeelPopup({}, container);

    const childComponent = domQuery('.child-component', container);
    const btn = domQuery('button', childComponent);

    await act(() => {
      btn.click();
    });

    const closeBtn = domQuery('.bio-properties-panel-popup__close', document.body);

    // when
    await act(() => {
      closeBtn.click();
    });

    // then
    await waitFor(() => {
      expect(document.activeElement).to.eql(btn);
    });
  });


  it('should close popup on element change', async function() {

    // given
    const result = createFeelPopup({ type: 'feel' }, container);

    const childComponent = domQuery('.child-component', container);
    const btn = domQuery('button', childComponent);

    // when
    await act(() => {
      btn.click();
    });

    // assume
    expect(getFeelEditor(document.body)).to.exist;

    // and when
    await act(() => {
      result.rerender({ element: { id: 'bar', type: 'bar' } });
    });

    // then
    expect(getFeelEditor(document.body)).to.not.exist;
  });


  it('should not bubble keyboard events to parent', async function() {

    // given
    const keyDownSpy = sinon.spy();

    container.addEventListener('keydown', keyDownSpy);

    const result = createFeelPopup({ type: 'feel', popupContainer: container }, container);

    const childComponent = domQuery('.child-component', container);
    const btn = domQuery('button', childComponent);

    await act(() => {
      btn.click();
    });

    const editor = getFeelEditor(result.container);

    // when
    fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'A' });

    // then
    expect(keyDownSpy).to.not.have.been.called;
  });


  describe('events', function() {

    function expectDraggingEvent(event) {

      it('should listen on <' + event + '>', async function() {

        // given
        const eventBus = new EventBus();

        const spy = sinon.spy();

        eventBus.on(event, spy);

        createFeelPopup({ popupContainer: container, eventBus }, container);

        // assume
        expect(getFeelEditor(container)).to.not.exist;

        // when
        await act(() => {
          eventBus.fire('feelPopup._open');
        });

        const header = domQuery('.bio-properties-panel-popup__header', container);
        const dragger = domQuery('.bio-properties-panel-popup__drag-handle', header);
        const draggerBounds = dragger.getBoundingClientRect();

        // when
        startDragging(dragger);
        moveDragging(dragger, { clientX: draggerBounds.x + 20, clientY: draggerBounds.y });
        endDragging(dragger);

        // then
        expect(spy).to.have.been.calledOnce;
      });
    }


    it('should listen on <feelPopup.opened>', async function() {

      // given
      const eventBus = new EventBus();

      const openSpy = sinon.spy();
      const openedSpy = sinon.spy();

      eventBus.on('feelPopup.open', openSpy);
      eventBus.on('feelPopup.opened', openedSpy);

      createFeelPopup({ eventBus }, container);

      // assume
      expect(getPopup(document.body)).to.not.exist;

      // when
      await act(() => {
        eventBus.fire('feelPopup._open');
      });

      // then
      expect(openSpy).to.have.been.calledOnce;
      expect(openedSpy).to.have.been.calledOnce;
      expect(openedSpy).to.have.been.calledWith(sinon.match.has('domNode'));
    });


    it('should listen on <feelPopup.closed>', async function() {

      // given
      const eventBus = new EventBus();

      const closeSpy = sinon.spy();
      const closedSpy = sinon.spy();

      eventBus.on('feelPopup.close', closeSpy);
      eventBus.on('feelPopup.closed', closedSpy);

      createFeelPopup({ eventBus }, container);

      // assume
      expect(getPopup(document.body)).to.not.exist;

      // when
      await act(() => {
        eventBus.fire('feelPopup._open');
      });

      await act(() => {
        eventBus.fire('feelPopup._close');
      });

      // then
      expect(closeSpy).to.have.been.calledOnce;
      expect(closeSpy).to.have.been.calledWith(sinon.match.has('domNode'));
      expect(closedSpy).to.have.been.calledOnce;
    });


    it('lifecycle events',async function() {

      // given
      const eventBus = new EventBus();
      createFeelPopup({ eventBus }, container);

      // List of lifecycle events and expected popup visibility
      const expectedEvents = [
        [ 'feelPopup.open', false ],
        [ 'feelPopup.opened', true ],
        [ 'feelPopup.close', true ],
        [ 'feelPopup.closed', false ]
      ];

      const firedEvents = [];
      expectedEvents.forEach(([ eventName ]) => {

        // Track fired events and wether the popup is visible at the time
        eventBus.on(eventName , () =>{
          firedEvents.push([ eventName, !!getPopup(document.body) ]);
        });
      });

      // when
      await act(() => {
        eventBus.fire('feelPopup._open');
      });

      await act(() => {
        eventBus.fire('feelPopup._close');
      });

      // then
      expect(firedEvents).to.eql(expectedEvents);
    });


    expectDraggingEvent('feelPopup.dragstart');


    expectDraggingEvent('feelPopup.dragover');


    expectDraggingEvent('feelPopup.dragend');


    it('<feelPopup.open>', async function() {

      // given
      const eventBus = new EventBus();

      createFeelPopup({ eventBus }, container);

      // assume
      expect(getFeelEditor(document.body)).to.not.exist;

      // when
      await act(() => {
        eventBus.fire('feelPopup._open', {
          entryId: 'foo',
          popupConfig: {
            type: 'feel'
          },
          sourceElement: container
        });
      });

      // then
      expect(getFeelEditor(document.body)).to.exist;
    });


    it('<feelPopup._close>', async function() {

      // given
      const eventBus = new EventBus();

      createFeelPopup({ eventBus }, container);

      await act(() => {
        eventBus.fire('feelPopup._open', {
          entryId: 'foo',
          popupConfig: {
            type: 'feel'
          },
          sourceElement: container
        });
      });

      // assume
      expect(getFeelEditor(document.body)).to.exist;

      await act(() => {
        eventBus.fire('feelPopup._close');
      });

      // assume
      expect(getFeelEditor(document.body)).to.not.exist;
    });


    it('<feelPopup._isOpen>', async function() {

      // given
      const eventBus = new EventBus();

      createFeelPopup({ eventBus }, container);

      // assume
      expect(eventBus.fire('feelPopup._isOpen')).to.be.false;

      await act(() => {
        eventBus.fire('feelPopup._open', {
          entryId: 'foo',
          popupConfig: {
            type: 'feel'
          },
          sourceElement: container
        });
      });

      // assume
      expect(eventBus.fire('feelPopup._isOpen')).to.be.true;

      await act(() => {
        eventBus.fire('feelPopup._close');
      });

      // assume
      expect(eventBus.fire('feelPopup._isOpen')).to.be.false;
    });

  });


  describe('<feel>', function() {

    it('should open <feel> editor', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // assume
      expect(getFeelEditor(document.body)).to.not.exist;

      // when
      await act(() => {
        btn.click();
      });

      // then
      expect(getFeelEditor(document.body)).to.exist;
    });


    it('should focus <feel> editor', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      // then
      expect(document.activeElement).to.eql(domQuery('.cm-content', editor));
    });


    it('should autosuggest in <feel> editor', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      // assume
      expect(editor).to.exist;

      // when
      fireEvent.keyDown(document.activeElement, { key: ' ', ctrlKey: true });

      // then
      let suggestions;
      await waitFor(() => {
        suggestions = domQuery('.cm-tooltip-autocomplete > ul', editor);
        expect(suggestions).to.exist;
      });
    });


    it('should NOT close <feel> editor on ESC (autosuggest)', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      expect(editor).to.exist;

      fireEvent.keyDown(domQuery('.cm-content', editor), { key: ' ', ctrlKey: true });

      // assume
      let suggestions;
      await waitFor(() => {
        suggestions = domQuery('.cm-tooltip-autocomplete > ul', editor);
        expect(suggestions).to.exist;
      });

      // when
      fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'Escape' });

      // then
      expect(getFeelEditor(document.body)).to.exist;
    });


    it('should close <feel> editor on ESC (no autosuggest)', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      // when
      fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'Escape' });

      // then
      expect(getFeelEditor(document.body)).to.not.exist;
    });


    it('should close <feel> editor on btn click', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      // assume
      expect(getFeelEditor(document.body)).to.exist;

      const closeBtn = domQuery('.bio-properties-panel-popup__close', document.body);

      // when
      await act(() => {
        closeBtn.click();
      });

      // then
      expect(getFeelEditor(document.body)).to.not.exist;
    });

  });


  describe('<feelers>', function() {

    it('should open <feelers> editor', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // assume
      expect(getFeelersEditor(document.body)).to.not.exist;

      // when
      await act(() => {
        btn.click();
      });

      // then
      expect(getFeelersEditor(document.body)).to.exist;
    });


    it('should focus <feelers> editor', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const editor = getFeelersEditor(document.body);

      // then
      expect(document.activeElement).to.eql(domQuery('.cm-content', editor));
    });


    it('should close <feelers> editor on ESC (no autosuggest)', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelersEditor(document.body);

      // when
      fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'Escape' });

      // then
      expect(getFeelersEditor(document.body)).to.not.exist;
    });


    it('should close <feelers> editor on btn click', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      // assume
      expect(getFeelersEditor(document.body)).to.exist;

      const closeBtn = domQuery('.bio-properties-panel-popup__close', document.body);

      // when
      await act(() => {
        closeBtn.click();
      });

      // then
      expect(getFeelersEditor(document.body)).to.not.exist;
    });

  });


  describe('a11y', function() {

    it('should have no violations - open feel', async function() {

      // given
      this.timeout(5000);

      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const popup = domQuery('.bio-properties-panel-feel-popup', document.body);

      // then
      // @Note(pinussilvestrus): we ignore this rule until
      // https://github.com/bpmn-io/feel-editor/issues/36 is fixed
      await expectNoViolations(popup, {
        rules: {
          'aria-input-field-name': { enabled: false }
        }
      });
    });


    it('should have no violations - open feelers', async function() {

      // given
      this.timeout(5000);

      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const popup = domQuery('.bio-properties-panel-feel-popup', document.body);

      // then
      await expectNoViolations(popup);
    });

  });

});


// helper //////////////

function createFeelPopup(props, container) {
  const {
    popupContainer,
    getPopupLinks,
    element = noopElement,
    eventBus = new EventBus(),
    type
  } = props;

  return render(
    <FEELPopupRoot popupContainer={ popupContainer } getPopupLinks={ getPopupLinks } element={ element } eventBus={ eventBus }>
      <ChildComponent type={ type } />
    </FEELPopupRoot>,
    { container }
  );
}

function ChildComponent(props) {
  const {
    type = 'feel'
  } = props;

  const {
    open
  } = useContext(FeelPopupContext);

  const btnRef = useRef(null);

  const onClick = () => {
    open('foo', {
      id: 'foo',
      title: 'Foo',
      type,
      value: 'foo'
    }, btnRef.current);
  };

  return <div class="child-component">
    <button type="button" ref={ btnRef } onClick={ onClick }>Open popup</button>
  </div>;
}

function getPopup(container) {
  return domQuery('.bio-properties-panel-feel-popup', container);
}

function getFeelEditor(container) {
  return domQuery('.bio-properties-panel-feel-editor-container', container);
}

function getFeelersEditor(container) {
  return domQuery('.bio-properties-panel-feelers-editor-container', container);
}

function dispatchEvent(element, type, options = {}) {
  const event = document.createEvent('Event');

  event.initEvent(type, true, true);

  Object.keys(options).forEach(key => event[ key ] = options[ key ]);

  element.dispatchEvent(event);
}

function startDragging(node, position) {
  if (!position) {
    const bounds = node.getBoundingClientRect();
    position = {
      clientX: bounds.x,
      clientY: bounds.y
    };
  }

  dispatchEvent(node, 'dragstart', position);
}

function moveDragging(node, position) {
  if (!position) {
    const bounds = node.getBoundingClientRect();
    position = {
      clientX: bounds.x + 20,
      clientY: bounds.y + 20
    };
  }

  dispatchEvent(node, 'dragover', position);
}

function endDragging(node) {
  dispatchEvent(node, 'dragend');
}