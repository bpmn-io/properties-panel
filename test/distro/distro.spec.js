import { expect } from 'chai';


describe('distro', function() {

  it('should expose the core public exports and vendored preact', async function() {

    // when
    const bundle = await import('../../dist/index.esm.js');
    const preact = await import('../../preact/dist/preact.module.js');
    const preactHooks = await import('../../preact/hooks/dist/hooks.module.js');

    // then
    expect(bundle.PropertiesPanel).to.be.a('function');
    expect(bundle).to.have.property('PropertiesPanel');

    expect(preact).to.exist;
    expect(preact.h).to.be.a('function');
    expect(preact.Fragment).to.exist;

    expect(preactHooks).to.exist;
    expect(preactHooks.useCallback).to.be.a('function');
  });

});
