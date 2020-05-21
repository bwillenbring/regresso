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

// Capture retries in build log
afterEach(function() {
    // Get the current retry number
    const r = Cypress.currentTest.currentRetry();
    // Only log output to the build log if you are on a retry
    if (r > 0 && this.currentTest.type === 'test') {
        cy.log('--------------------------------------------------');
        cy.log(`RETRY_ATTEMPT=${r}`);
        cy.log(`RETRY_TESTCASE=${this.currentTest.title}`);
        cy.log(`RETRY_STATUS=${this.currentTest.state}`);
        cy.log(`SPEC=${Cypress.spec.relative}`);
        cy.log('--------------------------------------------------');
    }
});
