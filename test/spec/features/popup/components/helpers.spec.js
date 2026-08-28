import { expect } from 'chai';

import {
  FEEL_POPUP_HEIGHT,
  FEEL_POPUP_WIDTH
} from '../../../../../src/features/popup/components';
import { getPopupPosition } from '../../../../../src/features/popup/components/helpers';

describe('popup helpers', function() {

  describe('#getPopupPosition', function() {

    it('should center popup using provided dimensions', function() {

      // given
      const width = 900;
      const height = 640;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // when
      const position = getPopupPosition(width, height);

      // then
      expect(position).to.eql({
        left: Math.max(0, (viewportWidth - width) / 2),
        top: Math.max(0, (viewportHeight - height) / 2)
      });
    });


    it('should use FEEL popup dimensions by default', function() {

      // given
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // when
      const position = getPopupPosition();

      // then
      expect(position).to.eql({
        left: Math.max(0, (viewportWidth - FEEL_POPUP_WIDTH) / 2),
        top: Math.max(0, (viewportHeight - FEEL_POPUP_HEIGHT) / 2)
      });
    });
  });
});