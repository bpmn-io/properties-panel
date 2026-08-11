import './globals';

const allTests = require.context('./spec', true, /.spec\.js$/);

allTests.keys().forEach(allTests);

const allSources = require.context('../src', true, /.*\.js$/);

allSources.keys().forEach(allSources);