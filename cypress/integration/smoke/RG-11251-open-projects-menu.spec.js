/// <reference types="cypress" />

describe('[SG-11251] Project menu will not open', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    [SG-11251] Regression - Project menu won't open on site
    ---------------------------------------------------------------------- */
    it('opens the projects menu and asserts the new project menu item is visible', function() {
        // Go to the Shots page
        cy.navigate_to_project_page('Shot');
        // Open the projects menu
        cy.get('#sg_global_nav [sg_selector="projects_popover_button"]').click();
        // Assertions
        cy.get('[sg_id="PrjctsPpvr:Mn"]').should('be.visible');
        // Assert that 'View all projects' menu item is visible
        cy.get('div.sg_menu [sg_selector="menu:view_all_projects"]').should('be.visible');
        // Assert that 'New project' menu item is visible
        cy.get('div.sg_menu [sg_selector="menu:new_project..."]').should('be.visible');
    });
});
