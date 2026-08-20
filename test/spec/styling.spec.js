import TestContainer from 'mocha-test-container-support';

import { insertCoreStyles } from 'test/TestHelper';

insertCoreStyles();


describe('styling (CSS)', function() {

  let container;

  beforeEach(function() {
    container = document.createElement('div');
    container.classList.add('bio-properties-panel');
    container.style.width = '250px';
    container.style.padding = '10px';

    TestContainer.get(this).appendChild(container);
  });

  it.skip('warning states', async function() {

    // when
    container.innerHTML = `
      <div class="bio-properties-panel-entry has-warning" style="margin-bottom: 20px">
        <label class="bio-properties-panel-label">has-warning input</label>
        <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="focus me" />
        <div class="bio-properties-panel-warning">warning message</div>
      </div>

      <div class="bio-properties-panel-entry has-error" style="margin-bottom: 20px">
        <label class="bio-properties-panel-label">has-error input</label>
        <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="focus me" />
        <div class="bio-properties-panel-error">error message</div>
      </div>

      <div class="bio-properties-panel-entry has-warning has-error" style="margin-bottom: 20px">
        <label class="bio-properties-panel-label">has-warning and has-error input - error wins</label>
        <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="focus me" />
        <div class="bio-properties-panel-warning">warning message</div>
        <div class="bio-properties-panel-error">error message</div>
      </div>

      <div class="bio-properties-panel-entry" style="display: flex; align-items: center; gap: 4px">
        <label class="bio-properties-panel-label">dot + badge</label>
        <span class="bio-properties-panel-dot bio-properties-panel-dot--warning"></span>
        <span class="bio-properties-panel-dot bio-properties-panel-dot--error"></span>
        <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--warning">3</span>
        <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--error">3</span>
      </div>
    `;
  });

});
