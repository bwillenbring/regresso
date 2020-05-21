/// <reference types="cypress" />

describe('[24471] Creating a new global event logs page results in a server error', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
        // Navigate home 
        cy.home();
    });

    /* ----------------------------------------------------------------------
    Create a global event logs page, expand the filter panel, and add a filter
    [24471] [regression] Creating a new global event logs page results in a server error
    ---------------------------------------------------------------------- */
    it('Creates an event logs page and expands filter panel', function() {
        let page_name = 'Global Events ' + Cypress.moment();
        let current_url;
        cy.invoke_new_entity_form('Page');
        // Set name to Global Event Logs
        cy.set_field_in_new_entity_form({
            field_name: 'name',
            field_value: page_name,
        });
        // Set page type to Event Log Entry
        cy.set_field_in_new_entity_form({
            field_name: 'entity_type',
            field_type: 'list',
            field_value: 'Event Log Entry',
        });
        // Click 'Create'
        cy.get('input[type="button"][sg_selector="button:create"]').click();
        // Confirm that page navigation has occurred
        cy.url().should('not.equal', current_url);
        // Assert the page name is correct
        cy.get('[sg_selector="label:page_name"]').should('contain', page_name);
        // Assert that pagination controls are visible, and displaying expected text
        cy
            .get('div.paging_controls span[sg_selector="dropdown:paging_records_control"]')
            .should('be.visible')
            .and('contain', 'per page');
        // Wait for spinner
        cy.wait_for_spinner();
        // Expand the filter panel
        cy.expand_filter_panel();
        // Click 'More Filters'
        cy
            .get(
                '[sg_id="page:root_widget:body:WrppdFltrPnlPpvr:WEnttyQryFltrPnlWrppr"] [sg_selector="button:more_fields"]'
            )
            .click();
        // Choose the first unselected enabled menu item
        cy.get('div.sg_menu_item:not(.sg_menu_item_disabled):first').find('span[sg_selector^="menu:"]').click();
        // Assert that the progress indicator is NOT visible
        cy.get('.progress_indicator_overlay_container').should('not.be.visible');
    });
});
