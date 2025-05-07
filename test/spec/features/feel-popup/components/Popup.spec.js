import {
  act,
  fireEvent,
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

import { Popup } from 'src/features/feel-popup/components';

insertCoreStyles();


describe('<Popup>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // when
    render(<Popup />, { container });

    const popup = domQuery('.bio-properties-panel-popup', container);

    // then
    expect(popup).to.exist;
  });


  it('should render width', function() {

    // given
    const width = 200;

    // when
    render(<Popup width={ width } />, { container });

    const popup = domQuery('.bio-properties-panel-popup', container);

    const bounds = popup.getBoundingClientRect();

    // then
    expect(bounds.width).to.eql(width);
  });


  it('should render height', function() {

    // given
    const height = 200;

    // when
    render(<Popup height={ height } />, { container });

    const popup = domQuery('.bio-properties-panel-popup', container);

    const bounds = popup.getBoundingClientRect();

    // then
    expect(bounds.height).to.eql(height);
  });


  it('should render children', function() {

    // when
    render(<Popup><div class="foo">bar</div></Popup>, { container });

    const popup = domQuery('.bio-properties-panel-popup', container);

    // then
    expect(popup.querySelector('.foo')).to.exist;
  });


  it('should add title', function() {

    // when
    render(<Popup title="foo" />, { container });

    const popup = domQuery('.bio-properties-panel-popup', container);

    // then
    expect(popup.getAttribute('aria-label')).to.eql('foo');
  });


  it('should activate focus trap', async function() {

    // given
    const focusSpy = sinon.spy();

    // when
    await act(() => {
      render(<Popup onPostActivate={ focusSpy }><input name="foo"></input></Popup>, { container });
    });

    // then
    expect(focusSpy).to.have.been.called;
  });


  it('should close on ESC', async function() {

    // given
    const closeSpy = sinon.spy();

    await act(() => {
      render(<Popup onClose={ closeSpy }><input name="foo"></input></Popup>, { container });
    });

    const popup = domQuery('.bio-properties-panel-popup', container);
    const input = domQuery('input', popup);

    // when
    fireEvent.keyDown(input, { key: 'Escape' });

    // then
    expect(closeSpy).to.have.been.called;
  });


  it('should NOT close on ESC (closeOnEscape=false)', async function() {

    // given
    const closeSpy = sinon.spy();

    await act(() => {
      render(<Popup closeOnEscape={ false } onClose={ closeSpy }><input name="foo"></input></Popup>, { container });
    });

    const popup = domQuery('.bio-properties-panel-popup', container);
    const input = domQuery('input', popup);

    // when
    fireEvent.keyDown(input, { key: 'Escape' });

    // then
    expect(closeSpy).to.not.have.been.called;
  });


  it('should not bubble keyboard events to parent', async function() {

    // given
    const keyDownSpy = sinon.spy();

    container.addEventListener('keydown', keyDownSpy);

    await act(() => {
      render(<Popup container={ container }><input name="foo"></input></Popup>, { container });
    });

    const popup = domQuery('.bio-properties-panel-popup', container);
    const input = domQuery('input', popup);

    // when
    fireEvent.keyDown(input, { key: 'A' });

    // then
    expect(keyDownSpy).to.not.have.been.called;
  });


  describe('Popup.Title', function() {

    it('should render children', function() {

      // when
      render(<Popup.Title><div class="foo">bar</div></Popup.Title>, { container });

      const header = domQuery('.bio-properties-panel-popup__header', container);

      // then
      expect(header.querySelector('.foo')).to.exist;
    });


    it('should render close button', function() {

      // when
      render(
        <Popup container={ container }>
          <Popup.Title title={ 'test close button' } showCloseButton={ true } closeButtonTooltip={ 'test close button tooltip' } />
        </Popup>,
        { container }
      );

      const header = domQuery('.bio-properties-panel-popup__header', container);
      const closeButton = domQuery('.bio-properties-panel-popup__close', header);
      const closeButonTitle = closeButton.getAttribute('title');

      // then
      expect(closeButton).to.exist;
      expect(closeButonTitle).to.eql('test close button tooltip');
    });


    it('should render custom class', function() {

      // when
      render(<Popup.Title className="foo" />, { container });

      const header = domQuery('.bio-properties-panel-popup__header', container);

      // then
      expect(header.classList.contains('foo')).to.be.true;
    });


    describe('draggable', function() {

      it('should not render dragger', function() {

        // when
        render(<Popup.Title />, { container });

        const header = domQuery('.bio-properties-panel-popup__header', container);
        const dragger = domQuery('.bio-properties-panel-popup__drag-handle', header);

        // then
        expect(dragger).not.to.exist;
      });


      it('should render dragger', function() {

        // when
        render(<Popup.Title draggable={ true } />, { container });

        const header = domQuery('.bio-properties-panel-popup__header', container);
        const dragger = domQuery('.bio-properties-panel-popup__drag-handle', header);

        // then
        expect(dragger).to.exist;
      });


      it('should support dragging via dragger', function() {

        // given
        render(
          <Popup container={ container }>
            <Popup.Title draggable={ true } />
          </Popup>,
          { container }
        );

        const popup = domQuery('.bio-properties-panel-popup', container);
        const header = domQuery('.bio-properties-panel-popup__header', container);
        const dragger = domQuery('.bio-properties-panel-popup__drag-handle', header);

        const oldBounds = popup.getBoundingClientRect();
        const draggerBounds = dragger.getBoundingClientRect();

        // when
        startDragging(dragger);
        moveDragging(dragger, { clientX: draggerBounds.x + 20, clientY: draggerBounds.y });
        endDragging(dragger);

        const newBounds = popup.getBoundingClientRect();

        // then
        expect(newBounds.x).to.eql(oldBounds.x + 20);
      });


      it('should support dragging via header', function() {

        // given
        render(
          <Popup container={ container }>
            <Popup.Title draggable={ true } />
          </Popup>,
          { container }
        );

        const popup = domQuery('.bio-properties-panel-popup', container);
        const header = domQuery('.bio-properties-panel-popup__header', container);

        const oldBounds = popup.getBoundingClientRect();
        const headerBounds = header.getBoundingClientRect();

        // when
        startDragging(header);
        moveDragging(header, { clientX: headerBounds.x + 20, clientY: headerBounds.y });
        endDragging(header);

        const newBounds = popup.getBoundingClientRect();

        // then
        expect(newBounds.x).to.eql(oldBounds.x + 20);
      });


      it('should not bubble dragging events to parent', function() {

        // given
        const dragStartSpy = sinon.spy();
        const dragOverSpy = sinon.spy();
        const dragEnterSpy = sinon.spy();

        container.addEventListener('dragstart', dragStartSpy);
        container.addEventListener('dragover', dragOverSpy);
        container.addEventListener('dragenter', dragEnterSpy);

        render(
          <Popup container={ container }>
            <Popup.Title draggable={ true } />
          </Popup>,
          { container }
        );

        const header = domQuery('.bio-properties-panel-popup__header', container);
        const dragger = domQuery('.bio-properties-panel-popup__drag-handle', header);

        const draggerBounds = dragger.getBoundingClientRect();

        // when
        startDragging(dragger);
        moveDragging(dragger, { clientX: draggerBounds.x + 20, clientY: draggerBounds.y });
        endDragging(dragger);

        // then
        expect(dragStartSpy).to.not.have.been.called;
        expect(dragOverSpy).to.not.have.been.called;
        expect(dragEnterSpy).to.not.have.been.called;
      });


    });

  });


  describe('<Popup.Body>', function() {

    it('should render children', function() {

      // when
      render(<Popup.Body><div class="foo">bar</div></Popup.Body>, { container });

      const body = domQuery('.bio-properties-panel-popup__body', container);

      // then
      expect(body.querySelector('.foo')).to.exist;
    });


    it('should render custom class', function() {

      // when
      render(<Popup.Body className="foo" />, { container });

      const body = domQuery('.bio-properties-panel-popup__body', container);

      // then
      expect(body.classList.contains('foo')).to.be.true;
    });

  });


  describe('<Popup.Footer>', function() {

    it('should render children', function() {

      // when
      render(<Popup.Footer><div class="foo">bar</div></Popup.Footer>, { container });

      const footer = domQuery('.bio-properties-panel-popup__footer', container);

      // then
      expect(footer.querySelector('.foo')).to.exist;
    });


    it('should render custom class', function() {

      // when
      render(<Popup.Footer className="foo" />, { container });

      const footer = domQuery('.bio-properties-panel-popup__footer', container);

      // then
      expect(footer.classList.contains('foo')).to.be.true;
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = render(
        <><Popup title="my popup" container={ container }><Popup.Title draggable title="My popup" /><Popup.Body>
          <label for="foo">bar</label>
          <input id="foo" name="foo" />
        </Popup.Body><Popup.Footer>
          <button type="button">OK</button>
        </Popup.Footer>
        </Popup></>,
        { container }
      );

      // then
      await expectNoViolations(node);
    });

  });

});


// helper //////////////

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