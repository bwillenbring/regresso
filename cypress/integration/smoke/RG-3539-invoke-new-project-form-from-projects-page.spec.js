/// <reference types="cypress" />
describe('[SG-3539] Invoke the new Project form from the Projects page', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Navigate to Projects page and assert that typeof(SG)==Object
    [SG-3539] Can't create new project - new project form doesn't open
    ---------------------------------------------------------------------- */
    it('invokes new project form from Projects page', function() {
        cy.navigate_to_page('projects/');
        cy.invoke_new_entity_form('Project');
        // The new project form should be visible...
        cy.get('[sg_id="dialog:sgd_new_project"]').should('be.visible');
        // Close the dumb thing
        cy.get('button[sg_selector="button:cancel"]').click();
        // Click Cancel
        cy.get('[sg_id="dialog:sgd_new_project"]').should('not.be.visible');
    });
});
