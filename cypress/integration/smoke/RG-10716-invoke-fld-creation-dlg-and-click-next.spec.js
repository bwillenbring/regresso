/// <reference types="cypress" />

describe('[SG-10716] Manage Fields Dialog field creation Next button', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Manage Fields Dialog field creation Next button
    [SG-10716] [SG-10626]
    ---------------------------------------------------------------------- */
    it('Invoke field creation dialog', function() {
        cy.navigate_to_project_page('Playlist');
        // Set page mode to list
        cy.set_page_mode('list');
        // Wait for spinners 
        cy.wait_for_spinner();
        // Invoke
        cy.invoke_dlg_manage_fields('Playlist');
        // Click 'Add new field'
        cy.get('div[sg_selector="button:add_field"]').click({
            force: true,
        });
        // Enter a legitimate Field Name
        let field_name = 'New Field ' + Cypress.moment();
        cy.get('input[sg_selector="input:field_name"]').type(field_name);
        // Click 'Next'
        cy.get('[sg_id="page:root_widget:body:list_content:CnfgrFldDlg"] [sg_selector="button:next"]').click();
        // Assert that the next dialog appears - but don't click 'Create Field'
        cy
            .get('[sg_id="dialog:sgd_apply_to_projects"]')
            .should('be.visible')
            .find('[sg_selector="button:cancel"]')
            .click();
        // You're done!
    });
});

/**
 * TODO: Move this version of the command into the shared library
 */
Cypress.Commands.add('invoke_dlg_manage_fields', (entity_type) => {
    cy.wait_for_spinner();
    // Click Toolbar Fields button 
    cy.click_toolbar_item('Fields');
    // Choose menu item 'Manage <Entity> Fields...'
    cy.handle_menu_item(`Manage ${entity_type} Fields...`);
    // Assert the dialog is visible...
    cy.get('div[sg_id="dialog:sgd_manage_fields hidden"]').should('be.visible');
});
