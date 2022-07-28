import {
  render
} from '@testing-library/preact/pure';

import axe from 'axe-core';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import { DropdownButton } from 'src/components/DropdownButton';

import { clickInput } from 'test/TestHelper';

insertCoreStyles();


describe('<DropdownButton>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('rendering', function() {

    it('should render', function() {

      // when
      const rendered = render(<DropdownButton>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);

      // then
      expect(dropdownButtonNode).to.exist;
    });


    it('should render menu items', function() {

      // given
      const menuItems = [
        { entry: <span id="my-menu-item">hello</span> }
      ];

      // when
      const rendered = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      const menuItemNode = domQuery('#my-menu-item', rendered.container);

      // then
      expect(menuItemNode).to.exist;
    });


    it('should render action item', function() {

      // given
      const menuItems = [
        { entry: 'Click me', action() {} }
      ];

      // when
      const rendered = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      const actionNode = domQuery(
        '.bio-properties-panel-dropdown-button__menu-item--actionable', rendered.container);

      // then
      expect(actionNode).to.exist;
    });


    it('should render separator', function() {

      // given
      const menuItems = [
        { separator: true }
      ];

      // when
      const rendered = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      const separatorNode = domQuery(
        '.bio-properties-panel-dropdown-button__menu-item--separator', rendered.container);

      // then
      expect(separatorNode).to.exist;
    });
  });


  describe('open/close', function() {

    it('should open when clicked', function() {

      // given
      const rendered = render(<DropdownButton>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);

      // when
      clickInput(dropdownButtonNode);

      // then
      expect(dropdownButtonNode.className).to.contain('open');
    });


    it('should close when clicked again', function() {

      // given
      const rendered = render(<DropdownButton>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);

      // when
      clickInput(dropdownButtonNode);
      clickInput(dropdownButtonNode);

      // then
      expect(dropdownButtonNode.className).not.to.contain('open');
    });


    it('should close when action item is clicked', function() {

      // given
      const menuItems = [
        { entry: 'Click me', action() {} }
      ];
      const rendered = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);
      clickInput(dropdownButtonNode);

      // when
      const actionNode = domQuery(
        '.bio-properties-panel-dropdown-button__menu-item--actionable', rendered.container);
      clickInput(actionNode);

      // then
      expect(dropdownButtonNode.className).not.to.contain('open');
    });


    it('should close when clicked outside of menu', function() {

      // given
      const rendered = render(<DropdownButton>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);
      clickInput(dropdownButtonNode);

      // when
      clickInput(container);

      // then
      expect(dropdownButtonNode.className).not.to.contain('open');
    });


    it('should NOT close when clicked inside of menu', function() {

      // given
      const menuItems = [
        { entry: <span id="my-menu-item">hello</span> }
      ];
      const rendered = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);
      clickInput(dropdownButtonNode);

      // when
      const menuItemNode = domQuery('#my-menu-item', rendered.container);
      clickInput(menuItemNode);

      // then
      expect(dropdownButtonNode.className).to.contain('open');
    });
  });


  describe('action', function() {

    it('should call action item is clicked', function() {

      // given
      const spy = sinon.spy();
      const menuItems = [
        { entry: 'Click me', action: spy }
      ];
      const rendered = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      const dropdownButtonNode = domQuery('.bio-properties-panel-dropdown-button', rendered.container);
      clickInput(dropdownButtonNode);

      // when
      const actionNode = domQuery(
        '.bio-properties-panel-dropdown-button__menu-item--actionable', rendered.container);
      clickInput(actionNode);

      // then
      expect(spy).to.have.been.calledOnce;
    });
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      // given
      const menuItems = [
        { entry: 'Click me' }
      ];

      const { container: node } = render(
        <DropdownButton menuItems={ menuItems }>Click</DropdownButton>, { container });

      // when
      const results = await axe.run(node, {
        runOnly: [ 'best-practice', 'wcag2a', 'wcag2aa' ]
      });

      // then
      expect(results.passes).to.be.not.empty;
      expect(results.violations).to.be.empty;
    });

  });
});
