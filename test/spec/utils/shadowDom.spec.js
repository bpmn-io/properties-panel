import { isInShadowRoot, keepEventTarget } from 'src/utils/shadow-dom';
import { changeInput } from '../../TestHelper';

describe('ShadowDom', () => {
  const { container, input } = initialTestContainer();

  describe('Determine whether it is in the shadowRoot', () => {

    it('should determine to be true', () => {
      expect(isInShadowRoot(input)).to.be.true;
    });

    it('should determine to be false', () => {
      expect(isInShadowRoot(container)).to.be.false;
    });
  });

  describe('Keep event target', () => {

    it('should get shadow root element after next task queue', async function() {
      let event;

      input.addEventListener('input', (ev) => event = ev);

      changeInput(input, 'foo');

      this.timeout(1000);

      expect(event.target).to.equal(container);
    });

    it('should keep event target after next task queue', async function() {
      let event;

      input.addEventListener('input', keepEventTarget((ev) => event = ev));

      changeInput(input, 'foo');

      this.timeout(1000);

      expect(event.target).to.equal(input);
    });
  });

});

// helpers ////////////////////

function initialTestContainer() {
  const container = document.createElement('div');
  container.className = 'test-container';
  document.body.append(container);

  const shadowRoot = container.attachShadow({ mode: 'open' });

  const input = document.createElement('input');
  shadowRoot.append(input);

  document.body.append(container);

  return {
    container,
    input,
  };
}
