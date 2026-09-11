import { expect } from 'chai';

import {
  getMostSevere,
  getMostSevereForIds,
  toDiagnostic,
  toErrorDiagnostic
} from 'src/components/util/diagnostics';


describe('components/util/diagnostics', function() {

  describe('toDiagnostic', function() {

    it('should assume <error> for a message', function() {

      // when
      const diagnostic = toDiagnostic('foo');

      // then
      expect(diagnostic).to.eql({ severity: 'error', message: 'foo' });
    });


    it('should assume given severity for a message', function() {

      // when
      const diagnostic = toDiagnostic('foo', 'warning');

      // then
      expect(diagnostic).to.eql({ severity: 'warning', message: 'foo' });
    });


    it('should keep severity and action', function() {

      // given
      const action = { label: 'Fix', onClick: () => {} };

      // when
      const diagnostic = toDiagnostic({ severity: 'info', message: 'foo', action });

      // then
      expect(diagnostic).to.eql({ severity: 'info', message: 'foo', action });
    });


    it('should assume <error> for an unknown severity', function() {

      // when
      const diagnostic = toDiagnostic({ severity: 'warn', message: 'foo' });

      // then
      expect(diagnostic.severity).to.eql('error');
    });


    it('should return null for no value', function() {

      // when
      const diagnostic = toDiagnostic(null);

      // then
      expect(diagnostic).to.be.null;
    });

  });


  describe('toErrorDiagnostic', function() {

    it('should create an <error>', function() {

      // when
      const diagnostic = toErrorDiagnostic('foo');

      // then
      expect(diagnostic).to.eql({ severity: 'error', message: 'foo' });
    });


    it('should NOT keep action', function() {

      // when
      const diagnostic = toErrorDiagnostic({
        message: 'foo',
        action: { label: 'Fix', onClick: () => {} }
      });

      // then
      expect(diagnostic).to.eql({ severity: 'error', message: 'foo' });
    });

  });


  describe('getMostSevere', function() {

    it('should rank <error> over <warning> over <info>', function() {

      // given
      const diagnostics = [
        { severity: 'info', message: 'info' },
        { severity: 'warning', message: 'warning' },
        { severity: 'error', message: 'error' }
      ];

      // when
      const diagnostic = getMostSevere(diagnostics);

      // then
      expect(diagnostic.message).to.eql('error');
    });


    it('should keep the first of equal severity', function() {

      // given
      const diagnostics = [
        { severity: 'error', message: 'first' },
        { severity: 'error', message: 'second' }
      ];

      // when
      const diagnostic = getMostSevere(diagnostics);

      // then
      expect(diagnostic.message).to.eql('first');
    });


    it('should ignore empty values', function() {

      // given
      const diagnostics = [ null, undefined, { severity: 'warning', message: 'warning' } ];

      // when
      const diagnostic = getMostSevere(diagnostics);

      // then
      expect(diagnostic.message).to.eql('warning');
    });


    it('should normalize messages', function() {

      // when
      const diagnostic = getMostSevere([ 'foo' ]);

      // then
      expect(diagnostic).to.eql({ severity: 'error', message: 'foo' });
    });


    it('should return null without diagnostics', function() {

      // when
      const diagnostic = getMostSevere([]);

      // then
      expect(diagnostic).to.be.null;
    });

  });


  describe('getMostSevereForIds', function() {

    it('should rank across entries', function() {

      // given
      const diagnostics = {
        foo: [ { severity: 'warning', message: 'warning' } ],
        bar: [ { severity: 'error', message: 'error' } ]
      };

      // when
      const diagnostic = getMostSevereForIds(diagnostics, [ 'foo', 'bar' ]);

      // then
      expect(diagnostic.message).to.eql('error');
    });


    it('should ignore other entries', function() {

      // given
      const diagnostics = {
        foo: [ { severity: 'warning', message: 'warning' } ],
        bar: [ { severity: 'error', message: 'error' } ]
      };

      // when
      const diagnostic = getMostSevereForIds(diagnostics, [ 'foo' ]);

      // then
      expect(diagnostic.message).to.eql('warning');
    });

  });

});
