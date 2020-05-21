/// <reference types="cypress" />

describe('[22573] Quickfilter text queries cause server error whenever the Open Notes Count field is in the layout', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Run a Quickfilter with Open Notes Count field in layout
    [22573] [Regression] Quickfilter text queries cause server error whenever the
    'Open Notes Count' field is in the layout (thumbnail, list mode only)
    ---------------------------------------------------------------------- */
    it('runs a quick filter with Open Notes Count in the page layout', function() {
        // Go to shots page
        cy.navigate_to_project_page('Shot');
        // Set page mode to list
        cy.set_page_mode('list');
        // Show open notes count
        cy.display_fields_in_grid(['open_notes_count']);
        cy.run_quick_filter('No Server Error!');
        // The No results message is displayed
        cy.get('[sg_selector="caption:query_no_match"]').should('be.visible');
        // There is no overlay
        cy.get('.progress_indicator_overlay_container').should('not.be.visible');
    });
});
