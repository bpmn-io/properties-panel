import {
  render,
  cleanup
} from '@testing-library/preact/pure';

import { fireEvent, waitFor } from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import Tooltip from 'src/components/entries/Tooltip';

import { TooltipContext } from '../../../src/context';
import { useRef } from 'preact/hooks';

insertCoreStyles();


describe('<Tooltip>', function() {

  let container, parent;

  beforeEach(function() {
    parent = TestContainer.get(this);
    parent.style.marginLeft = 'auto';
    parent.style.width = '50vw';

    container = document.createElement('div');
    container.classList.add('bio-properties-panel');

    parent.appendChild(container);
  });

  afterEach(function() {
    cleanup();
  });

  async function openTooltip(element, focus = false) {
    focus ? element.focus() : fireEvent.mouseEnter(element);

    await waitFor(() => expect(domQuery('.bio-properties-panel-tooltip')).to.exist);
  }


  describe('render', function() {

    it('should not render by default', function() {

      // given
      const result = createTooltip({ container });

      // then
      expect(domQuery('.bio-properties-panel-tooltip-wrapper', result.container)).to.exist;
      expect(domQuery('.bio-properties-panel-tooltip', result.container)).to.not.exist;
    });


    it('should render if trigger element is hovered', async function() {

      // given
      createTooltip({ container });
      const element = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(element);

      // then
      expect(domQuery('.bio-properties-panel-tooltip')).to.exist;
    });


    it('should not render if trigger element no longer hovered - mouse', async function() {

      // given
      createTooltip({ container });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      expect(domQuery('.bio-properties-panel-tooltip')).to.exist;

      // when
      fireEvent.mouseLeave(wrapper);

      // expect
      expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
    });


    it('should render inside parent if defined', async function() {

      // given
      render(<TooltipWithParent />,{ container });

      const element = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(element);

      // then
      expect(domQuery('.bio-properties-panel-tooltip')).to.exist;
      expect(domQuery('.bio-properties-panel-tooltip').parentElement).to.equal(domQuery('#parent'));
    });

  });


  describe('position', function() {

    it('should render beside trigger element', async function() {

      // given
      createTooltip({ container });
      const element = domQuery('#componentId', container);
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const elementRect = element.getBoundingClientRect();
      const tooltipRect = domQuery('.bio-properties-panel-tooltip').getBoundingClientRect();

      expect(tooltipRect.top).to.equal(elementRect.top - 10);
      expect(tooltipRect.right).to.equal(elementRect.x);
    });


    it('should allow position override', async function() {

      // given
      createTooltip({ container, position: 'right: 100px; top: 0' });

      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const tooltip = domQuery('.bio-properties-panel-tooltip');
      expect(tooltip.style.right).to.equal('100px');
      expect(tooltip.style.top).to.equal('0px');

    });

  });


  describe('direction', function() {

    it('should render to the right by default', async function() {

      // given
      createTooltip({ container });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const tooltip = domQuery('.bio-properties-panel-tooltip');
      expect(tooltip.classList.contains('right')).to.be.true;
    });


    it('should attach direction class to tooltip', async function() {

      // given
      createTooltip({ container, direction: 'left' });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const tooltip = domQuery('.bio-properties-panel-tooltip');
      expect(tooltip.classList.contains('left')).to.be.true;
    });

  });


  describe('content', function() {

    it('should render tooltip content', async function() {

      // given
      const tooltipContent = <div>
        <div>tooltip text</div>
        <a href="#">some link</a>
      </div>;

      createTooltip({ container, value: tooltipContent });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const tooltipContentNode = domQuery('.bio-properties-panel-tooltip-content');
      expect(tooltipContentNode).to.exist;
      expect(tooltipContentNode.innerHTML).to.equal(
        '<div><div>tooltip text</div><a href="#">some link</a></div>'
      );
    });

  });


  it('should render with tooltip if set per context', async function() {

    // given
    const tooltipConfig = { tooltipCheckbox: (element) => 'myContextDesc' };

    createTooltip({
      container,
      id: 'tooltipCheckbox',
      value: null,
      tooltipConfig,
      getTooltipForId: (id, element) => tooltipConfig[id](element)
    });

    const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

    // then
    await openTooltip(wrapper);

    const tooltipContentNode = domQuery('.bio-properties-panel-tooltip-content');
    expect(tooltipContentNode).to.exist;
    expect(tooltipContentNode.textContent).to.equal('myContextDesc');
  });


  it('should render tooltip set per props over context', async function() {

    // given
    const tooltipConfig = { tooltipCheckbox: (element) => 'myContextDesc' };

    createTooltip({
      container,
      id: 'tooltipCheckbox',
      value: 'myPropsTooltip',
      tooltipConfig,
      getTooltipForId: (id, element) => tooltipConfig[id](element)
    });

    const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

    // then
    await openTooltip(wrapper);

    const tooltipContentNode = domQuery('.bio-properties-panel-tooltip-content');
    expect(tooltipContentNode).to.exist;
    expect(tooltipContentNode.textContent).to.equal('myPropsTooltip');
  });


  describe('focus', function() {

    describe('trigger element', function() {

      it('should not persist tooltip when opened with mouse', async function() {

        // given
        createTooltip({ container });
        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
        await openTooltip(wrapper);

        // when
        fireEvent.mouseLeave(wrapper);

        // then
        expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
      });


      it('should not persist tooltip when opened with mouse - render portal', async function() {

        // given
        render(<TooltipWithParent />,{ container });

        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

        // when
        await openTooltip(wrapper);

        // when
        wrapper.focus();
        fireEvent.mouseLeave(wrapper);

        // then
        expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
      });


      it('should persist tooltip when opened with keyboard focus', async function() {

        // given
        createTooltip({ container });
        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
        await openTooltip(wrapper, true);

        // when
        fireEvent.mouseMove(wrapper);

        // then
        expect(domQuery('.bio-properties-panel-tooltip')).to.exist;
      });


      it('should persist tooltip when opened with keyboard focus - render portal', async function() {

        // given
        render(<TooltipWithParent />,{ container });

        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

        // when
        await openTooltip(wrapper, true);

        // when
        fireEvent.mouseMove(container);

        // then
        expect(domQuery('.bio-properties-panel-tooltip')).to.exist;
      });

    });


    describe('tooltip content', function() {

      it('should not persist tooltip - mouse focus', async function() {

        // given
        const tooltipContent = <div>
          <a id="link" href="#">some link</a>
        </div>;

        createTooltip({ container, value: tooltipContent });
        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
        await openTooltip(wrapper);

        // when
        const link = domQuery('#link', container);

        link.focus();
        fireEvent.mouseLeave(wrapper);

        // then
        expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
      });


      it('should persist tooltip - keyboard focus', async function() {

        // given
        const tooltipContent = <div>
          <a id="link" href="#">some link</a>
        </div>;

        createTooltip({ container, value: tooltipContent });
        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
        await openTooltip(wrapper, true);

        // when
        const link = domQuery('#link', container);
        link.focus();
        fireEvent.mouseMove(wrapper);

        // then
        expect(domQuery('.bio-properties-panel-tooltip')).to.exist;
      });

    });

  });


  describe('a11y', function() {

    it('should have no violations (tooltip not shown)', async function() {

      // given
      createTooltip({ container });

      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      expect(wrapper).to.exist;

      // then
      await expectNoViolations(wrapper);
    });


    it('should have no violations (tooltip shown)', async function() {

      // given
      createTooltip({ container });

      // when
      let wrapper;

      await waitFor(() => {
        wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

        expect(wrapper).to.exist;
      });

      await openTooltip(wrapper);

      // then
      await expectNoViolations(wrapper);
    });

  });

});


// helpers ////////////////////

function TooltipComponent(props) {
  const {
    value = 'tooltip text',
    id = 'componentId',
    tooltipConfig = {},
    getTooltipForId = ()=>{},
    parent,
    direction,
    position
  } = props;

  const tooltipContext = {
    tooltip: tooltipConfig,
    getTooltipForId
  };

  return (
    <TooltipContext.Provider value={ tooltipContext }>
      <Tooltip forId={ id } value={ value } parent={ parent } direction={ direction } position={ position }>
        <div id={ id }>foo</div>
      </Tooltip>
    </TooltipContext.Provider>
  );
}

function TooltipWithParent() {
  const ref = useRef();

  return <div id="parent" ref={ ref }>
    <TooltipComponent parent={ ref } />
  </div>;
}


function createTooltip(options = {}, renderFn = render) {
  const {
    container
  } = options;

  return renderFn(<TooltipComponent { ...options } />,{ container });
}

