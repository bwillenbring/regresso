/// <reference types="cypress" />

describe('[SG-11740] checks footer positioning in design mode with css property assertions', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    [SG-11740] Footer positioning screws up display of toolbar in page design mode
    ---------------------------------------------------------------------- */
    it('checks footer positioning in design mode with css property assertions', function() {
        cy.navigate_to_project_page('Shot');
        // Ensure that the page has SAVED settings in list mode
        // Do this so that the selector strategy is more dependable
        cy.get_page_mode().then(m => {
            if (m !== 'list') {
                cy.set_page_mode('list');
                cy.save_page();
                cy.reload();
                cy.wait_for_spinner();
            }
            // Now you can enter design mode from list mode
            cy.enter_design_mode();
            // Design mode page body...
            cy.get('[sg_id="page:root_widget:body:list_content"]:eq(1)').then(body => {
                // Design mode footer...
                cy.get('div.footer:eq(1)').then(footer => {
                    // Get the offset top diff
                    let difference = Math.abs(footer.offset().top - (body.offset().top + body.height()));
                    cy.log('--------------------');
                    cy.log('Grid body height + offset top: ', body.offset().top + body.height());
                    cy.log('Footer Offset Top Actual: ', footer.offset().top);
                    cy.log('Offset Difference', difference);
                    cy.log('--------------------');
                    assert.approximately(difference, 0, 2);
                });
            });
        });
    });
});
