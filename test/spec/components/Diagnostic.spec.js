import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import {
  fireEvent,
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import { DiagnosticMessage } from 'src/components';

insertCoreStyles();


describe('<DiagnosticMessage>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render nothing without diagnostic', function() {

    // when
    const result = render(<DiagnosticMessage forId="foo" />, { container });

    // then
    expect(result.container.innerHTML).to.eql('');
  });


  it('should render info message with icon', function() {

    // given
    const diagnostic = { severity: 'info', message: 'foo' };

    // when
    const result = render(<DiagnosticMessage diagnostic={ diagnostic } forId="foo" />, { container });

    // then
    expect(domQuery('.bio-properties-panel-info', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-diagnostic-icon', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-diagnostic-message', result.container).textContent).to.eql('foo');
  });


  it('should render warning message without icon', function() {

    // given
    const diagnostic = { severity: 'warning', message: 'foo' };

    // when
    const result = render(<DiagnosticMessage diagnostic={ diagnostic } forId="foo" />, { container });

    // then
    expect(domQuery('.bio-properties-panel-warning', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-diagnostic-icon', result.container)).not.to.exist;
  });


  it('should trigger action', function() {

    // given
    const onClick = sinonSpy();

    const diagnostic = {
      severity: 'error',
      message: 'foo',
      action: { label: 'Fix', onClick }
    };

    const result = render(<DiagnosticMessage diagnostic={ diagnostic } forId="foo" />, { container });

    // when
    fireEvent.click(domQuery('.bio-properties-panel-diagnostic-action', result.container));

    // then
    expect(onClick).to.have.been.calledOnce;
  });

});
