// Plugins
import 'cypress-plugin-retries';

// Import commands.js using ES2015 syntax:
import './commands';
import './commands.backbone';
import './commands.create_page';
import './commands.crud';
import './commands.entity_query_page';
import './commands.exporter';
import './commands.file_uploads';
import './commands.inbox_notifications';
import './commands.routes';
import './commands.login';
import './commands.navigation';
import './commands.qb';
import './commands.regression'
import './commands.routes';
import './commands.thumbnails';
import './commands.wrkflw';

Cypress.on('uncaught:exception', (err, runnable) => {
    // yields the error (Object), mocha runnable (Object)
    // returning false here prevents Cypress from failing the test
    console.log('uncaught exception.....');
    return false;
});

before(function() {
    // In case the `all_tests` array is not defined, set it
    if (!Cypress.config('all_tests') || !Array.isArray(Cypress.config('all_tests'))) {
        Cypress.config('all_tests', []);
    }
});

after(function() {
    const s = Cypress.mocha.getRootSuite();
    const tests = [];
    let totalRetries = 0;
    let totalDuration = 0;
    // let totalDuration = 0;
    s.eachTest(t => tests.push(t));
    // Add up all retries (remember, if a test has no retries, this value = -1)
    tests.forEach((t) => {
        if (t._retries > 0) totalRetries += t._retries;
        totalDuration += t.duration;
    })

    const obj = {
        title: s.suites[0].title,
        file: s.file,
        totalTests: tests.length,
        totalPassed: tests.filter(t => t.state === 'passed').length,
        totalFailed: tests.filter(t => t.state === 'failed' || t.err).length,
        totalRetries: totalRetries,
        totalDuration: totalDuration
    }
    // Here we log the run
    cy.task('log_run', obj);
});