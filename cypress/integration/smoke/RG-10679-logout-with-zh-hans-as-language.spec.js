/// <reference types="cypress" />

describe('[SG-10679] Access Login/Logout form with ZH-Hans (Chinese) enabled', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec().then(() => {
            cy.set_preference({
                enable_zh_hans_translation: 'yes',
                language: 'zh-hans',
            });
        });
    });

    after(function() {
        // Login and reset Language to English
        cy.login_admin().then(() => {
            cy.set_preference({
                language: 'en',
            });
        });
    });
    /* ----------------------------------------------------------------------
    Access Login form with ZH-Hans enabled
    [SG-10679] Regression - i18n - date_filters.forEach is not a function - Login page doesn't load when zh-hans is enabled
    ---------------------------------------------------------------------- */
    it('accesses login and logout form with ZH-Hans (Chinese) enabled', function() {
        cy.home();
        cy.get_translation('fields.HumanUser.login').then(str => {
            // cy.get('button[name="commit"]').invoke('text').should('eq', '登录');
            // cy.get('button[name="commit"]').invoke('text').should('eq', str);
            cy.log(str);
        });
        // Now go to the login page...
        cy.logout();
        // Main ui element is visible with correct message
        cy.get('main').should('be.visible').within(main => {
            // Login/pwd
            cy.task('append_log', 'Dom element "main" has this text: ' + Cypress.$('main').text());
            cy.get('input[type="text"][name="user[login]"]').should('be.visible');
            cy.get('input[type="password"][name="user[password]"]').should('be.visible');
            // Chinese langauge attributes
            cy.get('button[name="commit"]').invoke('text').should('eq', '登录');
        });
    });
});
