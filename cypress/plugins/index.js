/// <reference types="cypress" />
/**
 * @type {Cypress.PluginConfig}
 */

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
    });
};
