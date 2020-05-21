/// <reference types="cypress" />

function sanitize_csv_input(input) {
    return input.trim().split('\n').map(ln => ln.trim()).join('\n');
}

describe('xss Checks', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    it('importer entities with xss', function() {
        // Create a stub
        const alert = cy.stub();
        // Listen for the alert
        cy.on('window:alert', alert);
        // Go to shots page
        cy.navigate_to_project_page('Shot');
        cy.set_page_mode('list'); // eg: list, thumb, md, task
        // Invoke importer
        cy.invoke_importer('Shots');
        // Paste sketchy data into the importer
        const pastePayload = sanitize_csv_input(`
            Shot Code
            M&M
            5 > 6
            <b>Bold</b>
            <img src=""onerror=alert(1)>
            <img src="" onerror=alert(1)>
        `);

        cy.get('[sg_id="Imprtr:ImprtrGtDt"] [sg_selector="drop_area"]').paste({
            pastePayload: pastePayload,
            simple: false,
        });

        // Verify you're on step 2
        cy.get('[data-cy="importer_dialog"] .step.active').should('contain','Step 2');
        // Click continue
        cy.get('[data-cy="importer_dialog"] [sg_selector="input.continue"]').click();
        // Verify you're on step 3
        cy.get('[data-cy="importer_dialog"] .step.active').should('contain','Step 3');
        // Click continue
        cy.get('[data-cy="importer_dialog"] [sg_selector="input.continue"]').click();
        // Verify you're on step 4
        cy.get('[data-cy="importer_dialog"] .step.active').should('contain','Step 4');
        // Click continue
        cy.get('[data-cy="importer_dialog"] [sg_selector="input.continue"]').click();

        //Prog indicator should be visible
        cy.get('[sg_id="label:progress_indicator"]').should('be.visible');
        // Then it should not...
        cy.get('[sg_id="label:progress_indicator"]').should('not.be.visible');
        // Then the success message => click success choice
        cy.get('.sgc_importer.success').should('be.visible').and('contain','Success!')
            .find('.success_choice:contains("Go back to the page where you started")').click();
        cy.get('.sgc_importer.success').should('not.be.visible')

        // Assert that an alert never happened
        // Assert that an alert DID NOT OCCUR
        expect(alert).not.to.be.called;
    });
});
