#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Read the nyc coverage report
const coverage = JSON.parse(
  fs.readFileSync(path.resolve('coverage/coverage-final.json'), 'utf8'),
);

// Read the mocha test results
const mochaResults = JSON.parse(
  fs.readFileSync(path.resolve('mocha-results.json'), 'utf8'),
);

// Count test files and determine failures
const testFiles = [
  ...new Set(mochaResults.tests.map((test) => test.file || 'unknown')),
];
const numTestFiles = testFiles.length;
const hasRealFailures = mochaResults.stats.failures > 0;

// Create a Jest-like report structure
const jestReport = {
  numFailedTestSuites: hasRealFailures ? 1 : 0,
  numFailedTests: mochaResults.stats.failures,
  numPassedTestSuites: numTestFiles - (hasRealFailures ? 1 : 0),
  numPassedTests: mochaResults.stats.passes,
  numPendingTestSuites: 0,
  numPendingTests: mochaResults.stats.pending || 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: numTestFiles,
  numTotalTests: mochaResults.stats.tests,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0,
  },
  startTime: new Date(mochaResults.stats.start).getTime(),
  success: !hasRealFailures,
  testResults: [],
  wasInterrupted: false,
  coverageMap: coverage,
};

// Group tests by file path to simulate Jest test suites
const testsByFile = {};
mochaResults.tests.forEach((test) => {
  const filePath = test.file || 'unknown';
  if (!testsByFile[filePath]) {
    testsByFile[filePath] = [];
  }
  testsByFile[filePath].push(test);
});

// Create test results for each file
Object.entries(testsByFile).forEach(([filePath, tests]) => {
  // Check if this test file has any failing tests
  const failedTests = tests.filter(
    (test) =>
      test.state === 'failed' &&
      test.err &&
      typeof test.err === 'object' &&
      Object.keys(test.err).length > 0 &&
      test.err.message,
  );

  const hasFailingTests = failedTests.length > 0;

  // Create the test result entry for this file
  const testSuite = {
    // Only include failed tests in assertionResults
    assertionResults: failedTests.map((test) => ({
      ancestorTitles: test.fullTitle.split(' ').slice(0, -1),
      failureMessages: [test.err.message || String(test.err)],
      fullName: test.fullTitle,
      location: {
        column: 1,
        line: 1,
      },
      status: 'failed',
      title: test.title,
    })),
    endTime: new Date(
      new Date(mochaResults.stats.start).getTime() +
        tests.reduce((sum, test) => sum + (test.duration || 0), 0),
    ).getTime(),
    message: hasFailingTests ? 'One or more tests failed' : '',
    name: filePath,
    startTime: new Date(mochaResults.stats.start).getTime(),
    status: hasFailingTests ? 'failed' : 'passed',
    summary: '',
  };

  jestReport.testResults.push(testSuite);
});

// Write the combined report
fs.writeFileSync(
  path.resolve('report.json'),
  JSON.stringify(jestReport, null, 2),
);

console.log('Combined report generated at report.json');
