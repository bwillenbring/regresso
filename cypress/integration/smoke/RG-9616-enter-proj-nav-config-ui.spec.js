/// <reference types="cypress" />

describe('[SG-9616] Enter Project nav configuration ui', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Ensure that project nav config ui loads bricks
    [SG-9516] Project Navigation page in a broken state.
    ---------------------------------------------------------------------- */
    it('enters project nav config ui, then exits', function() {
        cy.navigate_to_project_page('Shot');
        // Enter design mode...
        cy.get('[sg_selector="button:config_project_nav_gear"]').click();
        cy.handle_menu_item('Navigation');
        // Constrain next several assertions within project nav ui

        cy.get('[sg_id="CnfgrPrjctNv"]').within(nav_config => {
            // Blue stripe at top
            cy.get('.header').should('be.visible').and('contain', 'Project Navigation');
            // Cancel / Save buttons
            cy.get('div.controls').should('be.visible').and('contain', 'Cancel');
            cy.get('div.controls input[sg_selector="button:save"]').should('be.visible');
            // Light grey bar with configured bricks...
            cy.get('[sg_id="nav_bar"]').should('be.visible');
            // Page type bricks...
            cy.get('.section_title:contains("Pages")').should('be.visible');
            // Apps bricks...
            cy.get('.section_title:contains("Apps")').should('be.visible');
            // Click Cancel
            cy.get('div.controls [sg_selector="button:cancel"]').click();
        });
    });
});
