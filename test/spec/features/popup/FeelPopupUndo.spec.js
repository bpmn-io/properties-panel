import { expect } from 'chai';

import { act, render, cleanup } from '@testing-library/preact/pure';

import { useMemo, useState } from 'preact/hooks';

import { useFakeTimers } from 'sinon';

import { debounce as minDebounce } from 'min-dash';

import { EventContext } from 'src/context';
import FeelField from 'src/components/entries/FEEL';
import FeelPopupModule from 'src/features/popup';

import {
  bootstrapDiagram,
  getDiagramJS,
  insertCoreStyles
} from 'test/TestHelper';

insertCoreStyles();


describe('FEEL popup undo/redo', function() {

  [
    [ 'no debounce', 0 ],
    [ 'debounced', 300 ]
  ].forEach(([ name, debounceMs ]) => {

    describe(name, function() {

      let container, eventBus, model, commits, clock;

      beforeEach(function() {
        container = document.createElement('div');
        document.body.appendChild(container);

        bootstrapDiagram({
          modules: [ FeelPopupModule ],
          propertiesPanel: {
            feelPopupContainer: container
          }
        }).call(this);

        eventBus = getDiagramJS().get('eventBus');
        clock = useFakeTimers({ shouldClearNativeTimers: true });

        model = '=foo';
        commits = [];
      });

      afterEach(function() {
        act(() => eventBus.fire('propertiesPanel.closePopup'));
        cleanup();
        container.remove();
        clock.restore();
      });

      async function flushDebounce() {
        await act(() => { clock.tick(debounceMs + 200); });
      }

      function Host() {
        const [ value, setValue ] = useState(model);
        const element = useMemo(() => ({}), []);
        const debounce = useMemo(() => debounceMs ? fn => minDebounce(fn, debounceMs) : fn => fn, []);

        return (
          <EventContext.Provider value={ { eventBus } }>
            <FeelField
              element={ element }
              id="foo"
              label="Foo"
              feel="required"
              debounce={ debounce }
              getValue={ () => value }
              setValue={ v => {
                commits.push(v);
                model = v;
                setValue(v);
              } } />
          </EventContext.Provider>
        );
      }

      function mainEditorText() {
        return container.querySelector('.bio-properties-panel-feel-container .cm-content').textContent;
      }

      function popupEditor() {
        return document.querySelector('.bio-properties-panel-feel-popup .cm-content');
      }


      it('should not commit undone popup changes', async function() {

        // given
        render(<Host />, { container });

        await act(() => container.querySelector('.bio-properties-panel-open-feel-popup').click());

        expect(popupEditor()).to.exist;

        const editor = popupEditor();
        editor.focus();

        const selection = document.getSelection();
        selection.selectAllChildren(editor.querySelector('.cm-line'));
        selection.collapseToEnd();

        // when
        // Native editing populates undo history; changeInput only supports input values.
        await act(() => { document.execCommand('insertText', false, 'bar'); });
        await flushDebounce();

        expect(editor.textContent).to.eql('foobar');

        await act(() => { document.execCommand('undo'); });
        await flushDebounce();

        expect(editor.textContent, 'popup after undo').to.eql('foo');

        await act(() => document.querySelector('.bio-properties-panel-popup__close').click());

        expect(popupEditor()).not.to.exist;
        await flushDebounce();

        // then
        expect(model, 'model, commits: ' + JSON.stringify(commits)).to.eql('=foo');
        expect(mainEditorText(), 'properties panel').to.eql('foo');
      });

      it('should commit once on close', async function() {

        // given
        render(<Host />, { container });

        await act(() => container.querySelector('.bio-properties-panel-open-feel-popup').click());

        expect(popupEditor()).to.exist;

        const editor = popupEditor();
        editor.focus();

        const selection = document.getSelection();
        selection.selectAllChildren(editor.querySelector('.cm-line'));
        selection.collapseToEnd();

        // when
        await act(() => {
          document.execCommand('insertText', false, 'b');
          document.execCommand('insertText', false, 'a');
          document.execCommand('insertText', false, 'r');
        });
        await flushDebounce();

        // then
        expect(commits, 'while open').to.eql([]);

        // when
        await act(() => document.querySelector('.bio-properties-panel-popup__close').click());

        expect(popupEditor()).not.to.exist;
        await flushDebounce();

        // then
        expect(commits, 'after close').to.eql([ '=foobar' ]);
        expect(mainEditorText()).to.eql('foobar');
      });


      describe('keyboard', function() {

        const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

        const isWindows = /Win/.test(navigator.platform);

        // CodeMirror binds redo to Ctrl-y on Windows, Mod-Shift-z elsewhere
        function pressRedo(editor) {
          if (isWindows) {
            pressKey(editor, 'y');
          } else {
            pressKey(editor, 'z', { shift: true });
          }
        }

        function pressKey(editor, key, { shift = false } = {}) {
          editor.dispatchEvent(new KeyboardEvent('keydown', {
            key,
            ctrlKey: !isMac,
            metaKey: isMac,
            shiftKey: shift,
            bubbles: true,
            cancelable: true
          }));
        }

        async function openPopupAtEnd() {
          render(<Host />, { container });

          await act(() => container.querySelector('.bio-properties-panel-open-feel-popup').click());

          expect(popupEditor()).to.exist;

          const editor = popupEditor();
          editor.focus();

          const selection = document.getSelection();
          selection.selectAllChildren(editor.querySelector('.cm-line'));
          selection.collapseToEnd();

          return editor;
        }


        it('should undo and redo via keyboard, commit restored value once on close', async function() {

          // given
          const editor = await openPopupAtEnd();

          await act(() => { document.execCommand('insertText', false, 'bar'); });
          await flushDebounce();

          // when
          await act(() => pressKey(editor, 'z'));
          await flushDebounce();

          // then
          expect(editor.textContent, 'after undo').to.eql('foo');

          // when
          await act(() => pressRedo(editor));
          await flushDebounce();

          // then
          expect(editor.textContent, 'after redo').to.eql('foobar');
          expect(commits, 'while open').to.eql([]);

          // when
          await act(() => document.querySelector('.bio-properties-panel-popup__close').click());

          expect(popupEditor()).not.to.exist;
          await flushDebounce();

          // then
          expect(commits, 'after close').to.eql([ '=foobar' ]);
          expect(mainEditorText()).to.eql('foobar');
        });


        it('should not commit when undone via keyboard', async function() {

          // given
          const editor = await openPopupAtEnd();

          await act(() => { document.execCommand('insertText', false, 'bar'); });
          await flushDebounce();

          // when
          await act(() => pressKey(editor, 'z'));
          await flushDebounce();

          await act(() => document.querySelector('.bio-properties-panel-popup__close').click());

          expect(popupEditor()).not.to.exist;
          await flushDebounce();

          // then
          expect(commits).to.eql([]);
          expect(model).to.eql('=foo');
          expect(mainEditorText()).to.eql('foo');
        });

      });

    });

  });

});
