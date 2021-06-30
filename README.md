# @bpmn-io/properties-panel

[![CI](https://github.com/bpmn-io/properties-panel/workflows/CI/badge.svg)](https://github.com/bpmn-io/properties-panel/actions?query=workflow%3ACI)


Library for creating bpmn-io properties panels.


## Hacking the Project

To get the development setup make sure to have [NodeJS](https://nodejs.org/en/download/) installed.
As soon as you are set up, clone the project and execute

```
npm install
```


### Testing

Execute `npm run dev` to run the test suite in watch mode.

Expose an environment variable `TEST_BROWSERS=(Chrome|Firefox|IE)` to execute the tests in a non-headless browser.


### Package

Execute `npm run all` to lint and test the project.

__Note:__ We do not generate any build artifacts. Required parts of the library should be bundled by properties panels as needed instead.


## License

MIT