# Changelog

All notable changes to [`@bpmn-io/properties-panel`](https://github.com/bpmn-io/properties-panel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._


## 3.2.1

* `FIX`: do not clip tooltips in group headers ([#268](https://github.com/bpmn-io/properties-panel/pull/268))
* `FIX`: evaluate tooltip visibility on scroll ([#268](https://github.com/bpmn-io/properties-panel/pull/268))

## 3.2.0

* `FEAT`: suppport tooltip population via context ([#262](https://github.com/bpmn-io/properties-panel/pull/262))
* `FEAT`: suppport tooltips in group header labels ([#263](https://github.com/bpmn-io/properties-panel/pull/263))

## 3.1.0

* `FEAT`: added error markers to groups ([1332bb7a](https://github.com/bpmn-io/properties-panel/commit/1332bb7a82b184994ea26f74915c361888c0900f))
* `FEAT`: new tooltip component ([4dd14de1](https://github.com/bpmn-io/properties-panel/commit/4dd14de10e8034765e659ed93143eb609295fc74))
* `FEAT`: implemented tooltip API in fields ([ac84761f](https://github.com/bpmn-io/properties-panel/commit/ac84761ff9de77d0cca10d3b1f0b3a9a17618056))

## 3.0.0

* `FEAT`: treat FEEL fields as single expressions ([#254](https://github.com/bpmn-io/properties-panel/pull/254))
* `FEAT`: propagate invalid values ([#252](https://github.com/bpmn-io/properties-panel/pull/252))

__Breaking Changes__

* FEEL fields are now treated as single expressions, improving alignment with the DMN FEEL specification.
* `setValue` is now also called when `validate` returns an error. The error message is provided as a second argument to the `setValue` callback. This makes handling of invalid values an integration concern.

## 2.2.1

* `FIX`: improve FX toggle styles ([#249](https://github.com/bpmn-io/properties-panel/pull/249))

## 2.2.0 

* `FEAT`: add FEEL entry for number field ([#248](https://github.com/bpmn-io/properties-panel/pull/248))

## 2.1.0

* `FEAT`: introduce new FX toggle ([#240](https://github.com/bpmn-io/properties-panel/issues/240))
* `FEAT`: add FEEL entries for toggle switches and check boxes ([#194](https://github.com/bpmn-io/properties-panel/issues/194))
* `FEAT`: support `inline` for toggle switches ([#245](https://github.com/bpmn-io/properties-panel/issues/245))

## 2.0.0

* `CHORE`: remove `open` layout option ([#244](https://github.com/bpmn-io/properties-panel/pull/244))
* `FIX`: set sticky class when property panel was created detached ([#243](https://github.com/bpmn-io/properties-panel/pull/243))

__Breaking Changes__

* Open state is no longer handled by the library, the properties panel is now considered to be always open. Hiding the properties panel must be handled by the integrating application.

## 1.8.2

* `FIX`: do not break when propertiesPanel is initialized unmounted
* `DEPS`: update to `@bpmn-io/feel-editor@0.7.1`

## 1.8.1

* `FIX`: do not update sticky state when unmounted ([#238](https://github.com/bpmn-io/properties-panel/pull/238))
* `FIX`: perform layout updates in `useLayoutEffect` ([#238](https://github.com/bpmn-io/properties-panel/pull/238))

## 1.8.0

* `FEAT`: support local `TextArea#validate` hook ([#233](https://github.com/bpmn-io/properties-panel/issues/233))

## 1.7.0

* `FEAT`: support optional `TemplatingEntry` ([#235](https://github.com/bpmn-io/properties-panel/issues/235))
* `FEAT`: apply [#225](https://github.com/bpmn-io/properties-panel/pull/229) ([`439e9f3d`](https://github.com/bpmn-io/properties-panel/commit/439e9f3d968bb633d8326da9c33a7ee2cbea59d1))
* `FIX`: only call callbacks once on first render ([#228](https://github.com/bpmn-io/properties-panel/pull/228))
* `DEPS`: update to `feelers@0.1.0-alpha.8`

## 1.6.2

* `DEPS`: fix audit warnings

## 1.6.1

* `FIX`: don't expand `ListGroup` on external change ([#231](https://github.com/bpmn-io/properties-panel/pull/231))

## 1.6.0

* `FEAT`: enable `SelectEntry` validation ([#206](https://github.com/bpmn-io/properties-panel/issues/230))

## 1.5.1

* `FIX`: reverse [#225](https://github.com/bpmn-io/properties-panel/pull/225) ([#227](https://github.com/bpmn-io/properties-panel/issues/227))

## 1.5.0

* `FEAT`: feelers editor entry ([d47a738](https://github.com/bpmn-io/properties-panel/commit/d47a7387050171f9cada6c03d05456382ab1287a))
* `FEAT`: react to external layout change ([b5e7468](https://github.com/bpmn-io/properties-panel/commit/b5e74680e4a0046497a62582b1357c1f60807b77))

## 1.4.0

* `FEAT`: add `optgroup` option for selects ([#204](https://github.com/bpmn-io/properties-panel/pull/204))
* `FIX`: enfore general minimum `TextAreaEntry` height ([#220](https://github.com/bpmn-io/properties-panel/pull/220))
* `FIX`: style `pre` blocks in descriptions ([#219](https://github.com/bpmn-io/properties-panel/pull/219))

## 1.3.1

* `FIX`: don't grow `TextAreaEntry` on first input ([#216](https://github.com/bpmn-io/properties-panel/pull/216))

## 1.3.0

* `FEAT`: allow `TextAreaEntry` to be auto-resizeable ([#214](https://github.com/bpmn-io/properties-panel/pull/214))

## 1.2.0

* `FEAT`: enable `NumberFieldEntry` validation and linting ([#206](https://github.com/bpmn-io/properties-panel/issues/206))

## 1.1.1

* `FIX`: ensure `<Select />` always sets value ([#203](https://github.com/bpmn-io/properties-panel/pull/203))

## 1.1.0

* `DEPS`: update to `@bpmn-io/feel-editor@0.7.0`

## 1.0.1

* `FIX`: disable Grammarly extension ([#201](https://github.com/bpmn-io/properties-panel/pull/201))

## 1.0.0

_Re-release of 0.25.0 as stable._

## 0.25.0

* `FEAT`: allow to configure tooltip container ([#198](https://github.com/bpmn-io/properties-panel/pull/198))

## 0.24.1

* `FIX`: buffer all focus events for FEEL entries ([#197](https://github.com/bpmn-io/properties-panel/pull/197))
* `FIX`: maintain focus when variables passed to FEEL entry change ([#196](https://github.com/bpmn-io/properties-panel/issues/196))
* `DEPS`: update to `@bpmn-io/feel-editor@0.6.0`

## 0.24.0

* `FEAT`: expose `onFocus` and `onBlur` callbacks ([#191](https://github.com/bpmn-io/properties-panel/pull/191))
* `FIX`: uncheck `ToggleSwitch` when value is `undefined` ([#193](https://github.com/bpmn-io/properties-panel/pull/193))
* `CHORE`: show local FEEL error over global error ([#192](https://github.com/bpmn-io/properties-panel/pull/192))

## 0.23.0

* `DEPS`: update modeling utility dependencies

## 0.22.0

* `FIX`: scope `.cm-` styles
* `DEPS`: update to `@bpmn-io/feel-editor@0.4.1`

## 0.21.0

* `CHORE`: do not refire events during effect phase ([#186](https://github.com/bpmn-io/properties-panel/pull/186))

### BREAKING CHANGES

* events are not refired during effect phase anymore, you might have to use timeouts to ensure the events are being caught

## 0.20.3

* `FIX`: keep first character of FEEL required expression ([#183](https://github.com/bpmn-io/properties-panel/pull/183))

## 0.20.2

* `FIX`: ensure focus on `propertiesPanel.showError` ([#182](https://github.com/bpmn-io/properties-panel/pull/182))

## 0.20.1

* `FIX`: show FEEL syntax errors ([#173](https://github.com/bpmn-io/properties-panel/pull/173))
* `FIX`: focus FEEL container on click ([#179](https://github.com/bpmn-io/properties-panel/pull/179))
* `DEPS`: update to `diagram-js@8.9.0`
* `DEPS`: update to `min-dash@3.8.1`
* `DEPS`: update to `min-dom@3.2.1`

## 0.20.0

* `FEAT`: keep `FEEL` enabled state ([#174](https://github.com/bpmn-io/properties-panel/pull/174))
* `DEPS`: update to `@bpmn-io/feel-editor@0.3.0`

## 0.19.0

* `FEAT`: make group headers sticky ([#175](https://github.com/bpmn-io/properties-panel/pull/175))
* `CHORE`: use element as key for entries ([#176](https://github.com/bpmn-io/properties-panel/pull/176))

## 0.18.0

* `FEAT`: pass variables to FEEL editor ([#171](https://github.com/bpmn-io/properties-panel/pull/171))
* `FIX`: add error class to text area with error ([#165](https://github.com/bpmn-io/properties-panel/issues/165))
* `CHORE`: revert sticky headers ([#172](https://github.com/bpmn-io/properties-panel/pull/172))

## 0.17.0

* `FEAT`: add `FeelEntry` component ([#158](https://github.com/bpmn-io/properties-panel/pull/158))

### BREAKING CHANGES

* `TextFieldEntry` and `TextAreaEntry` no longer support the `feel` prop.
  Use `FeelEntry` or `FeelTextAreaEntry` instead.

## 0.16.0

* `FEAT`: set errors through context ([#160](https://github.com/bpmn-io/properties-panel/pull/160))
* `FEAT`: useShowEntryEvent hook uses ID ([#160](https://github.com/bpmn-io/properties-panel/pull/160))
* `FEAT`: useEvent hook subscribes immediately ([#160](https://github.com/bpmn-io/properties-panel/pull/160))
* `FEAT`: add focus and error to text area ([#160](https://github.com/bpmn-io/properties-panel/pull/160))

### BREAKING CHANGES

* useShowEntryEvent hook uses ID instead of callback
* useShowErrorEvent hook removed, add errors through context instead

## 0.15.0

* `FEAT`: pass props to `List` entries ([#157](https://github.com/bpmn-io/properties-panel/pull/157))
* `FIX`: correct cursor jumping on update ([#146](https://github.com/bpmn-io/properties-panel/issues/146))
* `CHORE`: use controlled inputs ([#155](https://github.com/bpmn-io/properties-panel/issues/155))

## 0.14.0

* `FEAT`: enable multiple and empty state ([#69](https://github.com/bpmn-io/properties-panel/issues/69))
* `FEAT`: make group headers sticky ([#151](https://github.com/bpmn-io/properties-panel/pull/151))
* `FIX`: fix outline on header buttons ([#148](https://github.com/bpmn-io/properties-panel/pull/148))

## 0.13.2

* `FIX`: remove unnecessary scroll padding ([#145](https://github.com/bpmn-io/properties-panel/pull/145))

## 0.13.1

* `FIX`: add accessible title for documentation ref ([#144](https://github.com/bpmn-io/properties-panel/pull/144))
* `FIX`: make event bus prop optional ([#143](https://github.com/bpmn-io/properties-panel/pull/143))

## 0.13.0

* `FEAT`: allow showing entries and errors through events ([#137](https://github.com/bpmn-io/properties-panel/pull/137))
* `FEAT`: allow opening groups per default ([#139](https://github.com/bpmn-io/properties-panel/pull/139))
* `FEAT`: add documentation ref ([#141](https://github.com/bpmn-io/properties-panel/pull/141))

## 0.12.0

* `FEAT`: allow addition of FEEL icon to TextFields and TextAreas ([#138](https://github.com/bpmn-io/properties-panel/pull/138))

## 0.11.0

* `FEAT`: all group and entry components specified as `component` are actual components, not elements ([#134](https://github.com/bpmn-io/properties-panel/pull/134))

### BREAKING CHANGES

* `component` property of an entry must be an actual component, not an element

## 0.10.2

* `FIX`: add missing aria label for `simple` component ([67f374](https://github.com/bpmn-io/properties-panel/commit/67f37491ab8dc8493c8dd1e749d7418d11825125))
* `CHORE`: add a11y tests ([0bdd6a](https://github.com/bpmn-io/properties-panel/commit/0bdd6a99a73047e9776da44ff834c524c66b9589) and [a2fc27](https://github.com/bpmn-io/properties-panel/commit/a2fc27530b2b5ec90f5d2e9ee0438a814e0f57e4))
* `STYLE`: use consistent add/arrow fill color ([272d4b](https://github.com/bpmn-io/properties-panel/commit/272d4be6585ee89c7f7c55c3e2e2346ad92618db))

## 0.10.1

* `FIX`: properly update layout ([#125](https://github.com/bpmn-io/properties-panel/pull/125))
* `FIX`: delete button now shows on tabbing ([#505](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/505))
* `FIX`: use POSIX paths when re-exporting preact on Windows ([#127](https://github.com/bpmn-io/properties-panel/issues/127))

## 0.10.0

* `FEAT`: reexport `preact` used in the package ([#124](https://github.com/bpmn-io/properties-panel/pull/124))
* `FEAT`: bundle library and expose components from single place ([#124](https://github.com/bpmn-io/properties-panel/pull/124))

### BREAKING CHANGES

* Internal structure of the library is no longer exposed.
  Use root exports instead. Note that names of some of the components have changed, e.g. `TextField` -> `TextFieldEntry`.
* To extend the library, import the vendored instance of `preact`, i.e. `@bpmn-io/properties-panel/preact`.

## 0.9.0

* `FEAT`: add `DescriptionContext` and `useDescriptionContext` hook ([#122](https://github.com/bpmn-io/properties-panel/pull/122))
* `FEAT`: add seperate `Description` entry ([#122](https://github.com/bpmn-io/properties-panel/pull/122))

## 0.8.1

* `CHORE`: add outline to checkboxes ([#120](https://github.com/bpmn-io/properties-panel/pull/120))
* `CHORE`: add missing description styles ([#121](https://github.com/bpmn-io/properties-panel/pull/121))

## 0.8.0

* `FEAT`: allow to disable textarea, select, and checkbox ([#118](https://github.com/bpmn-io/properties-panel/pull/118))

## 0.7.0

* `FEAT`: add dropdown button ([#116](https://github.com/bpmn-io/properties-panel/pull/116))
* `FEAT`: add header button ([#116](https://github.com/bpmn-io/properties-panel/pull/116))

## 0.6.1

* `FIX`: style disabled inputs ([#115](https://github.com/bpmn-io/properties-panel/pull/115))

## 0.6.0

* `FEAT`: accept callbacks instead of containers for `add` and `remove` props ([#108](https://github.com/bpmn-io/properties-panel/issues/108))
* `FIX`: use valid HTML in add/remove buttons ([#111](https://github.com/bpmn-io/properties-panel/pull/111))

### BREAKING CHANGES

* `ListGroup#add` changed to function instead of Preact component
* `Collapsible#remove` changed to function instead of Preact component

## 0.5.1

* `FIX`: allow custom selector for `ListEntry#autoFocusEntry` ([`4afae1`](https://github.com/bpmn-io/properties-panel/commit/4afae1ec0215417d961b176840f19e51ba8b9043))
* `CHORE`: add variable for monospace font ([`354fc9`](https://github.com/bpmn-io/properties-panel/commit/354fc99c8e54c1eb3c8cb2bca20630172e7fad7b))

## 0.5.0

* `FEAT`: add various design improvements ([#105](https://github.com/bpmn-io/properties-panel/pull/105))
* `FEAT`: add description for check boxes ([`f515016c`](https://github.com/bpmn-io/properties-panel/commit/f515016c3fedf59c9e629454a6a5e2fbbf2bfb79))

## 0.4.3

* `FEAT`: for `List` component, insert new items to bottom given there is no `compareFn` ([#104](https://github.com/bpmn-io/properties-panel/pull/104))
* `FEAT`: for `ListGroup` component, offer `shouldOpen` parameter ([#106](https://github.com/bpmn-io/properties-panel/pull/106))
* `FEAT`: for `ListGroup` component, insert new items to bottom given `shouldSort` is false ([#106](https://github.com/bpmn-io/properties-panel/pull/106))
* `FEAT`: add `useLayoutState` hook ([#99](https://github.com/bpmn-io/properties-panel/pull/99))

## 0.4.2

* `FIX`: make auto-focus work for select elements ([#101](https://github.com/bpmn-io/properties-panel/pull/101))

## 0.4.1

* `CHORE`: unbuild custom checkbox component ([#97](https://github.com/bpmn-io/properties-panel/pull/97))

## 0.4.0

* `FEAT`: add list entry ([#92](https://github.com/bpmn-io/properties-panel/issues/92))
* `FEAT`: add simple text entry ([#94](https://github.com/bpmn-io/properties-panel/pull/94))
* `FIX`: use default cursor when hovering collapsible headers ([#95](https://github.com/bpmn-io/properties-panel/pull/95))

## 0.3.0

* `FEAT`: use semantic HTML for buttons ([#45](https://github.com/bpmn-io/properties-panel/issues/45))
* `FIX`: prevent list ordering effects on element changes ([#89](https://github.com/bpmn-io/properties-panel/pull/89))

## 0.2.1

* `FIX`: do not use monospace as default font for text areas ([#87](https://github.com/bpmn-io/properties-panel/pull/87))

## 0.2.0

* `FEAT`: add number field entry ([#76](https://github.com/bpmn-io/properties-panel/pull/76))
* `FEAT`: update styles of error inputs ([#82](https://github.com/bpmn-io/properties-panel/pull/82))
* `FEAT`: update styles of descriptions ([#84](https://github.com/bpmn-io/properties-panel/pull/84))
* `FEAT`: allow non editable groups ([#85](https://github.com/bpmn-io/properties-panel/pull/85))

## 0.1.1

* `CHORE`: publish transpiled content ([#80](https://github.com/bpmn-io/properties-panel/issues/80))

## 0.1.0

* `FEAT`: initial version :tada:
