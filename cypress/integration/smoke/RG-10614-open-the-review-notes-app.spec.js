/// <reference types="cypress" />

describe('[SG-10614] Open Review Notes App', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Review Notes app
    [SG-10614] Regression - Uncaught TypeError - Review Notes App won't open
    ---------------------------------------------------------------------- */
    it('Opens the review notes app', function() {
        cy.visit('/page/notes_app');
        // Header should be visible...
        cy.get('#sgw_notes_app').should('be.visible');
        cy.get('#title').within(title => {
            // The grey header height should be within these bounds: 35-40px
            cy.wrap(title).invoke('height').should('be.above', 35).and('be.below', 40);
            // The following 3 elements should be present...
            cy.get('input[value="Open"]').should('be.visible');
            cy.get('input[value="New"]').should('be.visible');
            cy.get('[sg_selector="button:preview_and_publish"]').should('be.visible');
        });
        // Playlist dialog should be visible
        cy.get('[sg_id="NtsAppBrwsOvrly"]').should('be.visible');
        // Overlay should be present
        cy.get('.sg_dialog_mask.playlist_overlay').should('be.visible');
        // Dismiss the dialog...
        cy.get_SG().then(SG => {
            SG.globals.page.root_widget.hide_browse_overlay();
        });
        // The Overlay should be gone
        cy.get('.sg_dialog_mask.playlist_overlay').should('not.be.visible');
    });
});
