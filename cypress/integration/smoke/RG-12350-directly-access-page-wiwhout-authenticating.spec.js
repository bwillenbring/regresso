/// <reference types="cypress" />

describe('[SG-12350] Page crashes when going straight to an entity page and not logged in', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Following tickets are covered:
    [SG-12350] Page crashes when going straight to an entity page and not logged in
    [SG-10784] Regression - Expired session is not redirecting to login page
    ---------------------------------------------------------------------- */
    it('requests a page url by id while not logged in', function() {
        // Get the page url of the Global people page
        cy.get_page_id_by_name('People').then(id => {
            let url = '/page/' + id;
            // Logout
            cy.logout();
            cy.visit(url);
            // Assert that you're actually on the login page
            cy.url().should('contain', 'user/login');
            // Login manually
            cy.get('input[name="user[login]"]').type(Cypress.config('admin_login'));
            cy.get('input[name="user[password]"]').type(Cypress.config('admin_pwd'));
            cy.get('button[name="commit"]').click();
            // Assert that the url redirect took place
            cy.url().should('contain', url);
            // Assert that the redirected-to-page title is correct
            cy.get('[sg_selector="label:page_name"]').should('contain', 'People');
            // Assert there is no never-ending spinner
            cy.wait_for_spinner();
            // Set the page mode to list
            cy.set_page_mode('list');
            // Assert there are grid rows visible on the page
            cy
                .get('div.row_selector[sg_selector^="row_selector:record_id_"]:visible')
                .its('length')
                .should('be.above', 1);
        });
    });
});
