/// <reference types="cypress" />
describe('[SG-3908] Run a quick filter > 2147483647', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Run a numeric Quick filter > 2147483647
    [SG-3908]
    ---------------------------------------------------------------------- */
    it('runs a quick filter using 999999999999', function() {
        cy.navigate_to_project_page('Shot');
        cy.run_quick_filter('999999999999');
        // The No results message is displayed
        cy.get('[sg_selector="caption:query_no_match"]').should('be.visible');
        // There is no overlay
        cy.get('.progress_indicator_overlay_container').should('not.be.visible');
    });
});
