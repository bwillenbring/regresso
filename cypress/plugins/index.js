/// <reference types="cypress" />

const slack = require('../../scripts/slack');

 module.exports = (on, config) => {
    /**
    * @function append_log
    * @description Prints a message to the terminal window (not the test runner). This
    * results in the same behavior as running `console.log()` from a running node process.
    * @param log_msg - Could be a string, number, bool, array, object, etc.
    * @returns true
    *
    * @example
    * // Print a string
    * cy.task('append_log', 'hello');
    *
    * // Print json
    * cy.task('append_log', {name: 'Bill', email: 'bill@autodesk.com'});
    *
    */
    on('task', {
        append_log(message, options) {
            // console.log the message -- also the passed-in options if they exist
            arguments.length > 1 ? console.log(message, ',', options) : console.log(message);
            return true;
        },

        log_run(run) {
            // Did the run succeed?
            let status;
            if (run.totalFailed > 0) {
                status = ':failed:'
            } else {
                status = ':successful:'
            }
            const msg = `${status} *${run.title}*\n`;
            const testResults = `File: ${run.file}\n` +
                `Total Tests: ${run.totalTests}\n` +
                `Total Passed: ${run.totalPassed}\n` +
                `Total Retries: ${run.totalRetries}\n` +
                `Total Duration (ms): ${run.totalDuration}\n\n`;

            slack.notify({
                msg: msg,
                recipient: process.env['slack_recipient'],
                salutation: `${run.title} just finished!`,
                addendum: testResults
            })
            console.log(JSON.stringify(run, undefined, 2));
            console.log(testResults);
            return true;
        }
    });
};
