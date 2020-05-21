/// <reference types="cypress" />

describe('[SG-10908] Cannot Select other Projects in Change Project Configuration Dialog', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Chaange Project Configuration Menu shows Projects name
    [SG-10908] Cannot Select other Projects in Change Project Configuration Dialog
    ---------------------------------------------------------------------- */
    it('selects a Project in the Change Project Configuration Dialog', function() {
        cy.get_page_id_by_name('Projects').then(id => {
            cy.navigate_to_page('/page/' + id);
            cy.set_page_mode('list');
            // Select the 1st row
            cy.get('div.row_selector[sg_selector^="row_selector:record_id_"]:first').click();
            // Toolbar => More
            cy.get('[sg_id="page:root_widget:body:Tlbr"] [sg_selector="button:more"]').click();
            // Click 'Change Project Configuration...'
            cy.handle_menu_item('Change Project Configuration...');
            // disalog is vis
            cy.get('[sg_id="PshPrjctPgsDlg"]').should('be.visible').find('.sg_menu_dropdown').click();
            // Confirm there are more than 2 projects that show up
            cy.get('.sg_menu_item:visible').its('length').should('be.above', 2);
            // Click the 2nd menu item
            cy.get('span[sg_selector^="menu:"]:visible:eq(2)').click();
            // Click 'Cancel'
            cy.get('[sg_selector="button:cancel"]').click();
            cy.wait_for_spinner();
        });
    });
});
