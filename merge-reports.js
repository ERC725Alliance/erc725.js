#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

// Read the nyc coverage report
const coverage = JSON.parse(
  fs.readFileSync(path.resolve('coverage/coverage-final.json'), 'utf8')
)

// Read the mocha test results
const mochaResults = JSON.parse(
  fs.readFileSync(path.resolve('mocha-results.json'), 'utf8')
)

// Create a Jest-like report structure
const jestReport = {
  numFailedTestSuites: mochaResults.stats.failures > 0 ? 1 : 0,
  numFailedTests: mochaResults.stats.failures,
  numPassedTestSuites: mochaResults.stats.passes > 0 ? 1 : 0,
  numPassedTests: mochaResults.stats.passes,
  numPendingTestSuites: 0,
  numPendingTests: mochaResults.stats.pending || 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 1,
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
  success: mochaResults.stats.failures === 0,
  testResults: mochaResults.tests.map((test) => {
    const testFile = test.file || ''

    return {
      assertionResults: [
        {
          ancestorTitles: test.fullTitle.split(' ').slice(0, -1),
          failureMessages: test.err
            ? [test.err.message || String(test.err)]
            : [],
          fullName: test.fullTitle,
          location: {
            column: 1,
            line: 1,
          },
          status: test.state === 'passed' ? 'passed' : 'failed',
          title: test.title,
        },
      ],
      endTime: new Date(
        test.duration
          ? new Date(mochaResults.stats.start).getTime() + test.duration
          : 0
      ).getTime(),
      message: test.err ? test.err.message || String(test.err) : '',
      name: testFile,
      startTime: new Date(mochaResults.stats.start).getTime(),
      status: test.state === 'passed' ? 'passed' : 'failed',
      summary: '',
    }
  }),
  wasInterrupted: false,
  coverageMap: coverage,
}

// Write the combined report
fs.writeFileSync(
  path.resolve('report.json'),
  JSON.stringify(jestReport, null, 2)
)

console.log('Combined report generated at report.json')
