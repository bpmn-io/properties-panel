import { expect } from 'chai';

import TestContainer from 'mocha-test-container-support';

import axe from 'axe-core';

import {
  insertCoreStyles,
  insertCSS
} from 'test/TestHelper';

insertCoreStyles();

insertCSS('styling.spec.css', `
  .bio-properties-panel-styles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .bio-properties-panel-styles-section {
    display: grid;
    gap: 8px;
    padding: 12px;
  }

  .bio-properties-panel-styles-section-title {
    margin: 0 0 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--group-bottom-border-color);
    font-size: var(--text-size-base);
    font-weight: 500;
  }

  .bio-properties-panel-styles-field {
    display: grid;
    gap: 4px;
  }

  .bio-properties-panel-styles-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 22px;
  }

  .bio-properties-panel-styles-swatch {
    padding: 2px 8px;
    border-radius: 11px;
  }
`);

const singleStart = window.__env__?.SINGLE_START === 'styles';


describe('styling (CSS)', function() {

  let container;

  beforeEach(function() {
    container = document.createElement('div');
    container.classList.add('bio-properties-panel');
    container.style.width = '100%';
    container.style.padding = '10px';

    TestContainer.get(this).appendChild(container);
  });


  (singleStart ? it.only : it.skip)('severity states (visual)', function() {
    container.innerHTML = `
      <div class="bio-properties-panel-styles">
        <section class="bio-properties-panel-styles-section">
          <h2 class="bio-properties-panel-styles-section-title">Inputs</h2>
          <div class="bio-properties-panel-entry">
            <label class="bio-properties-panel-label">Text</label>
            <input class="bio-properties-panel-input" type="text" value="Text input" />
          </div>
          <div class="bio-properties-panel-entry">
            <label class="bio-properties-panel-label">Select</label>
            <select class="bio-properties-panel-input"><option>Select input</option></select>
          </div>
          <div class="bio-properties-panel-entry">
            <label class="bio-properties-panel-label">Text area</label>
            <textarea class="bio-properties-panel-input">Text area</textarea>
          </div>
          <div class="bio-properties-panel-entry bio-properties-panel-checkbox-entry">
            <label class="bio-properties-panel-checkbox">
              <input class="bio-properties-panel-input" type="checkbox" checked />
              <span class="bio-properties-panel-label">Checkbox</span>
            </label>
          </div>
        </section>

        <section class="bio-properties-panel-styles-section">
          <h2 class="bio-properties-panel-styles-section-title">Validation</h2>
          <div class="bio-properties-panel-entry has-warning">
            <label class="bio-properties-panel-label">Warning</label>
            <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="Focus me" />
            <div class="bio-properties-panel-warning">Warning message</div>
          </div>
          <div class="bio-properties-panel-entry has-error">
            <label class="bio-properties-panel-label">Error</label>
            <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="Focus me" />
            <div class="bio-properties-panel-error">Error message</div>
          </div>
          <div class="bio-properties-panel-entry">
            <label class="bio-properties-panel-label">Info</label>
            <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="Focus me" />
            <div class="bio-properties-panel-info">Info message</div>
          </div>
          <div class="bio-properties-panel-entry has-warning has-error">
            <label class="bio-properties-panel-label">Warning + error (CSS only)</label>
            <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="Focus me" />
            <div class="bio-properties-panel-warning">Warning message</div>
            <div class="bio-properties-panel-error">Error message</div>
          </div>
          <div class="bio-properties-panel-entry has-error">
            <label class="bio-properties-panel-label">Error with action</label>
            <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="PT30" />
            <div class="bio-properties-panel-error">
              <span class="bio-properties-panel-diagnostic-message">Value must be a valid ISO 8601 duration.</span>
              <button type="button" class="bio-properties-panel-diagnostic-action">Fix</button>
            </div>
          </div>
          <div class="bio-properties-panel-entry has-warning">
            <label class="bio-properties-panel-label">Warning with action</label>
            <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="25" />
            <div class="bio-properties-panel-warning">
              <span class="bio-properties-panel-diagnostic-message">Retry count exceeds recommended maximum of 10.</span>
              <button type="button" class="bio-properties-panel-diagnostic-action">Fix</button>
            </div>
          </div>
        </section>

        <section class="bio-properties-panel-styles-section">
          <h2 class="bio-properties-panel-styles-section-title">Status</h2>
          <div class="bio-properties-panel-styles-field">
            <span class="bio-properties-panel-label">Dots</span>
            <div class="bio-properties-panel-styles-row">
              <span class="bio-properties-panel-dot"></span>
              <span class="bio-properties-panel-dot bio-properties-panel-dot--warning"></span>
              <span class="bio-properties-panel-dot bio-properties-panel-dot--error"></span>
            </div>
          </div>
          <div class="bio-properties-panel-styles-field">
            <span class="bio-properties-panel-label">List badges</span>
            <div class="bio-properties-panel-styles-row">
              <span class="bio-properties-panel-list-badge">3</span>
              <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--warning">3</span>
              <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--error">3</span>
              <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--accent">Applied</span>
            </div>
          </div>
        </section>

        <section class="bio-properties-panel-styles-section">
          <h2 class="bio-properties-panel-styles-section-title">Actions</h2>
          <div class="bio-properties-panel-styles-field">
            <span class="bio-properties-panel-label">Create item</span>
            <div class="bio-properties-panel-styles-row">
              <button class="bio-properties-panel-group-header-button bio-properties-panel-add-entry" type="button" title="Create new list item">
                <svg viewBox="0 0 16 16" width="16" height="16"><path d="M7 2h2v5h5v2H9v5H7V9H2V7h5z" /></svg>
              </button>
              <span class="bio-properties-panel-list-badge">2</span>
            </div>
          </div>
        </section>

        <section class="bio-properties-panel-styles-section">
          <h2 class="bio-properties-panel-styles-section-title">Badge colors</h2>
          <div class="bio-properties-panel-styles-field">
            <span class="bio-properties-panel-label">Default</span>
            <div class="bio-properties-panel-styles-row">
              <span class="bio-properties-panel-styles-swatch" style="background: var(--warning-badge-background-color); color: var(--warning-badge-color)">Warning</span>
              <span class="bio-properties-panel-styles-swatch" style="background: var(--error-badge-background-color); color: var(--error-badge-color)">Error</span>
              <span class="bio-properties-panel-styles-swatch" style="background: var(--accent-badge-background-color); color: var(--accent-badge-color)">Accent</span>
            </div>
          </div>
          <div class="bio-properties-panel-styles-field">
            <span class="bio-properties-panel-label">Hover</span>
            <div class="bio-properties-panel-styles-row">
              <span class="bio-properties-panel-styles-swatch" style="background: var(--warning-badge-hover-background-color); color: var(--warning-badge-color)">Warning</span>
              <span class="bio-properties-panel-styles-swatch" style="background: var(--error-badge-hover-background-color); color: var(--error-badge-color)">Error</span>
              <span class="bio-properties-panel-styles-swatch" style="background: var(--accent-badge-hover-background-color); color: var(--accent-badge-color)">Accent</span>
            </div>
          </div>
        </section>

        <section class="bio-properties-panel-styles-section">
          <h2 class="bio-properties-panel-styles-section-title">Links</h2>
          <div class="bio-properties-panel-styles-field">
            <span class="bio-properties-panel-label">Description</span>
            <div class="bio-properties-panel-description">Configure this via the <a href="#">Documentation</a>.</div>
          </div>
        </section>
      </div>
    `;
  });


  // enforce WCAG AA text contrast so a regression (e.g. white-on-amber) fails CI
  it('badges and links meet WCAG AA text contrast', async function() {

    // given
    this.timeout(5000);

    container.innerHTML = `
      <span class="bio-properties-panel-list-badge" data-variant="neutral">3</span>
      <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--accent" data-variant="accent">3</span>
      <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--warning" data-variant="warning">3</span>
      <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--error" data-variant="error">3</span>

      <span data-variant="accent-hover" style="background: var(--accent-badge-hover-background-color); color: var(--accent-badge-color)">3</span>
      <span data-variant="warning-hover" style="background: var(--warning-badge-hover-background-color); color: var(--warning-badge-color)">3</span>
      <span data-variant="error-hover" style="background: var(--error-badge-hover-background-color); color: var(--error-badge-color)">3</span>

      <div class="bio-properties-panel-description">Configure this via the <a href="#" data-variant="link">documentation</a>.</div>
    `;

    // when
    const results = await axe.run(container, {
      runOnly: {
        type: 'rule',
        values: [ 'color-contrast' ]
      }
    });

    // then
    expect(results.violations).to.be.empty;
  });

});
