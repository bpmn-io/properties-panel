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
import { act } from 'preact/test-utils';

import { TooltipContext } from '../../../src/context';

insertCoreStyles();


describe('<Tooltip>', function() {

  let container, parent, clock;

  beforeEach(function() {
    parent = TestContainer.get(this);
    parent.style.marginLeft = 'auto';
    parent.style.width = '50vw';

    container = document.createElement('div');
    container.classList.add('bio-properties-panel');

    parent.appendChild(container);
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    cleanup();
    clock.restore();
  });

  function openTooltip(element) {
    return act(() => {
      fireEvent.mouseEnter(element);
      clock.tick(200);
    });
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
      fireEvent.mouseMove(container, {
        clientX: 16,
        clientY: 16,
      });

      // expect
      expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
    });


    it('should not render if trigger element no longer hovered - scroll', async function() {

      // given
      createTooltip({ container });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      expect(domQuery('.bio-properties-panel-tooltip')).to.exist;

      // when
      fireEvent.wheel(container);

      // expect
      expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
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


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      const { container: node } = createTooltip({ container });

      // then
      return waitFor(() => {
        expectNoViolations(node);
      }, 5000);
    });


    it('should have no violations - tooltip shown', async function() {

      // given
      createTooltip({ container });

      // when
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
      await openTooltip(wrapper);

      // then
      return waitFor(() => {
        expectNoViolations(domQuery('.bio-properties-panel-tooltip', container));
      }, 5000);
    });

  });

});


// helpers ////////////////////

function createTooltip(options = {}, renderFn = render) {
  const {
    value = 'tooltip text',
    id = 'componentId',
    container,
    tooltipConfig = {},
    getTooltipForId = ()=>{},
  } = options;

  const tooltipContext = {
    tooltip: tooltipConfig,
    getTooltipForId
  };

  return renderFn(
    <TooltipContext.Provider value={ tooltipContext }>
      <Tooltip forId={ id } value={ value }>
        <div id={ id }>foo</div>
      </Tooltip>
    </TooltipContext.Provider>,
    {
      container
    }
  );
}
