/// <reference types="cypress" />

describe('[SG-9700] Threaded detail pages are dark when dark theme is on', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
        // Create a note
        let data = {
            content: 'Test note for smoke test',
            subject: 'Testing UI dark theme',
            project: {
                type: 'Project',
                id: Cypress.config('TEST_PROJECT').id,
            },
        };
        cy.create_entity('Note', data).then(note_id => {
            cy.wrap(note_id).as('note_id');
        });
    });

    beforeEach(function() {
        cy.server();
        cy.route('POST', '/note/thread_contents').as('note_thread');
        cy.navigate_to_page(`/detail/Note/${this.note_id}`);
        cy.wait_for_page_to_load();
        cy.wait('@note_thread')
    })

    /* ----------------------------------------------------------------------
    Threaded detail pages are dark when dark theme is on
    ---------------------------------------------------------------------- */
    it('confirms threaded detail pages are dark when dark theme is on', function() {
        // Set the theme to dark
        cy.set_theme('dark');
        cy.get('div.note_body').should('be.visible').then(note => {
            // Assert the NoteDetails bgcolor is black
            cy
                .get('[sg_id="NoteDetails"]')
                .invoke('css', 'backgroundColor')
                .should('be.oneOf', ['rgb(0,0,0)', 'rgb(0, 0, 0)']);

            // Assert that the textarea bgcolor is black with alpha set to .2
            let dark_values = ['rgba(0,0,0,0.2)', 'rgba(0, 0, 0, 0.2)'];
            cy.get(note).find('textarea').invoke('css', 'backgroundColor').should('be.oneOf', dark_values);
        });
    });

    it('confirms threaded detail pages are white when light theme is on', function() {
        // Set the theme to light
        cy.set_theme('light');
        cy.get('div.note_body').should('be.visible').then(note => {
            // Assert the NoteDetails bgcolor is light grey
            cy
                .get('[sg_id="NoteDetails"]')
                .invoke('css', 'backgroundColor')
                .should('be.oneOf', ['rgb(217,217,217)', 'rgb(217, 217, 217)']);

            // Assert that the textarea bgcolor is black with alpha set to 0
            let light_values = ['rgba(0,0,0,0)', 'rgba(0, 0, 0, 0)'];
            cy.get(note).find('textarea').invoke('css', 'backgroundColor').should('be.oneOf', light_values);
        });
    });
});
