/// <reference types="cypress" />

describe('[24881] js error when opening the All Pages menu in Navbar', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Open the All Pages menu & click Manage Pages, and verify 1-click filters in the filter panel
    [24881] js error when opening the All Pages menu in Navbar
    ---------------------------------------------------------------------- */
    it('opens the all pages menu', function() {
        // Go to the shots page
        cy.navigate_to_project_page('Shot');
        // Open the projects menu
        cy.get('#sg_global_nav [sg_selector="global_pages_overlay_button"]').click();
        // Assert that the my pages menu is visible
        cy.get('[sg_id^="overlay:"][mode]').should('be.visible');
        // Click the gear menu
        cy.get('[sg_id^="overlay:"] [sg_selector="menu:gear"]').click();
        // Go to manage pages
        cy.get('span[sg_selector="menu:manage_pages..."]').click();
        // Wait for the URL to change...
        cy.url().should('not.include', 'projects');
        // You should be on the pages page
        cy.get('[sg_selector="label:page_name"]').should('contain', 'Pages');
        // Wait for spinner
        cy.wait_for_spinner();
        // Expand filter panel (if necessary)
        cy.expand_filter_panel();
        // Wait for spinner again
        cy.wait_for_spinner();
        // Verify 1-click filters...
        cy.get('[sg_id="page:root_widget:body:WrppdFltrPnlPpvr:WEnttyQryFltrPnlWrppr:FltrPnlFltrPnl"]').within($fp => {
            //My Pages
            cy.get('.one_click_filter:contains("My Pages")').should('be.visible');
            // Favorites
            cy.get('.one_click_filter:contains("Favorites")').should('be.visible');
            // Recently Viewed
            cy.get('.one_click_filter:contains("Recently Viewed")').should('be.visible');
        });
    });
});
