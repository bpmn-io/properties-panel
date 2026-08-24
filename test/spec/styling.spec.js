import { expect } from 'chai';

import TestContainer from 'mocha-test-container-support';

import { insertCoreStyles } from 'test/TestHelper';

insertCoreStyles();


describe('styling (CSS)', function() {

  let container;

  beforeEach(function() {
    container = document.createElement('div');
    container.classList.add('bio-properties-panel');
    container.style.width = '280px';
    container.style.padding = '10px';

    TestContainer.get(this).appendChild(container);
  });


  // visual playground for manual review (un-skip and open the Karma debug page)
  it.skip('severity states (visual)', function() {
    container.innerHTML = `
      <div class="bio-properties-panel-entry has-warning" style="margin-bottom: 16px">
        <label class="bio-properties-panel-label">has-warning input</label>
        <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="focus me" />
        <div class="bio-properties-panel-warning">warning message</div>
      </div>

      <div class="bio-properties-panel-entry has-error" style="margin-bottom: 16px">
        <label class="bio-properties-panel-label">has-error input</label>
        <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="focus me" />
        <div class="bio-properties-panel-error">error message</div>
      </div>

      <div class="bio-properties-panel-entry has-warning has-error" style="margin-bottom: 16px">
        <label class="bio-properties-panel-label">has-warning + has-error (error wins)</label>
        <input class="bio-properties-panel-input bio-properties-panel-focus-ring" type="text" value="focus me" />
        <div class="bio-properties-panel-warning">warning message</div>
        <div class="bio-properties-panel-error">error message</div>
      </div>

      <div class="bio-properties-panel-entry" style="display: flex; align-items: center; gap: 6px; margin-bottom: 16px">
        <label class="bio-properties-panel-label">dots</label>
        <span class="bio-properties-panel-dot"></span>
        <span class="bio-properties-panel-dot bio-properties-panel-dot--warning"></span>
        <span class="bio-properties-panel-dot bio-properties-panel-dot--error"></span>
      </div>

      <div class="bio-properties-panel-entry" style="display: flex; align-items: center; gap: 6px; margin-bottom: 16px">
        <label class="bio-properties-panel-label">list badges</label>
        <span class="bio-properties-panel-list-badge">3</span>
        <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--warning">3</span>
        <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--error">3</span>
        <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--warning">99</span>
        <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--error">99</span>
      </div>

      <div class="bio-properties-panel-entry" style="display: flex; align-items: center; gap: 6px">
        <label class="bio-properties-panel-label">badge token swatches (on-surface text)</label>
        <span style="padding: 2px 8px; border-radius: 11px; background: var(--warning-badge-background-color); color: var(--warning-badge-color)">Aa 3</span>
        <span style="padding: 2px 8px; border-radius: 11px; background: var(--error-badge-background-color); color: var(--error-badge-color)">Aa 3</span>
        <span style="padding: 2px 8px; border-radius: 11px; background: var(--list-badge-background-color); color: var(--list-badge-color)">Aa 3</span>
      </div>

      <div class="bio-properties-panel-entry" style="display: flex; align-items: center; gap: 6px">
        <label class="bio-properties-panel-label">badge hover swatches</label>
        <span style="padding: 2px 8px; border-radius: 11px; background: var(--warning-badge-hover-background-color); color: var(--warning-badge-color)">Aa 3</span>
        <span style="padding: 2px 8px; border-radius: 11px; background: var(--error-badge-hover-background-color); color: var(--error-badge-color)">Aa 3</span>
      </div>
    `;
  });


  // enforce WCAG AA text contrast so a regression (e.g. white-on-amber) fails CI
  it('list badges meet WCAG AA text contrast', function() {

    // given
    container.innerHTML = `
      <span class="bio-properties-panel-list-badge" data-variant="neutral">3</span>
      <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--warning" data-variant="warning">3</span>
      <span class="bio-properties-panel-list-badge bio-properties-panel-list-badge--error" data-variant="error">3</span>

      <span data-variant="warning-hover" style="background: var(--warning-badge-hover-background-color); color: var(--warning-badge-color)">3</span>
      <span data-variant="error-hover" style="background: var(--error-badge-hover-background-color); color: var(--error-badge-color)">3</span>
    `;

    // then
    [
      'neutral',
      'warning',
      'error',
      'warning-hover',
      'error-hover'
    ].forEach(function(variant) {
      const badge = container.querySelector(`[data-variant="${variant}"]`);
      const style = getComputedStyle(badge);

      const ratio = contrastRatio(style.color, style.backgroundColor);

      expect(ratio, `${variant} list-badge contrast`).to.be.at.least(4.5);
    });
  });

});


// helpers /////////////////////////////

function parseRgb(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);

  if (!match) {
    throw new Error('unexpected color value: ' + value);
  }

  return match[1].split(',').slice(0, 3).map(function(part) {
    return parseFloat(part.trim());
  });
}

function relativeLuminance(rgb) {
  const [ r, g, b ] = rgb.map(function(channel) {
    const c = channel / 255;

    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const l1 = relativeLuminance(parseRgb(foreground));
  const l2 = relativeLuminance(parseRgb(background));

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}
