/// <reference types="cypress" />

describe('[SG-9486] Open the Apps menu', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    [9486] Open the apps menu
    ---------------------------------------------------------------------- */
    it('opens the apps menu', function() {
        // Go to the shots page
        cy.navigate_to_project_page('Shot');
        // Open the apps menu
        cy.get('#sg_global_nav [sg_selector="apps_button"]').click();
        // Assert the apps menu is visible...
        cy.get('[sg_id="GlblNv:Mn"]').should('be.visible');
        // Assert that it says: sg_menu_heading
        cy.get('.sg_menu_heading:contains("THEATER AND DESKTOP REVIEW")').should('exist');
        // Iterate over all the expected items...
        let items = ['Shotgun Create', 'Screening Room', 'Review Notes', 'Manage Apps'];
        items.forEach(function(i) {
            // Assert the menu item exists...
            cy.get('[sg_id="GlblNv:Mn"] span.sg_menu_item_content:contains("' + i + '")').should('exist');
        });
    });
});
