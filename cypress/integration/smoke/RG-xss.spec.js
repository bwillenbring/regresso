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
        // Verify that the importer is there
        cy.get('[data-cy="importer_dialog"]').as('importer').should('be.visible');

        // Paste sketchy data into the importer
        const pastePayload = sanitize_csv_input(`
            Shot Code
            M&M
            5 > 6
            <b>Bold</b>
            <img src=""onerror=alert(1)>
            <img src="" onerror=alert(1)>
        `);

        // Paste in the data 
        cy.get('[sg_id="Imprtr:ImprtrGtDt"] [sg_selector="drop_area"]').paste({
            pastePayload: pastePayload,
            simple: false,
        });

        // Some importers have 3 steps - others have 4 
        cy.get('[data-cy="importer_dialog"] .steps .step').its('length').then(total_steps => {
            cy.log(`This importer has ${total_steps} steps`);
            // Ensure you're at step 2 => then continue
            cy.get('@importer').find('.step.active').should('contain', 'Step 2');
            cy.get('[data-cy="importer_dialog"] [sg_selector="input.continue"]:enabled').click({ force: true });
            // Ensure you're at step 3 => then continue
            cy.get('@importer').find('.step.active').should('contain', 'Step 3');
            cy.get('[data-cy="importer_dialog"] [sg_selector="input.continue"]:enabled').click({ force: true });
            if (total_steps > 3) {
                // Click Contine a 4th time one more time 
                cy.log('This importer has a 4th step!');
                cy.get('[data-cy="importer_dialog"] [sg_selector="input.continue"]:enabled').click({ force: true });
            } 
        });

        //Prog indicator should be visible
        cy.get('[sg_id="label:progress_indicator"]').should('be.visible');
        // Then it should not...
        cy.get('[sg_id="label:progress_indicator"]').should('not.be.visible');
        // Then the success message => click success choice
        cy.get('.sgc_importer.success').should('be.visible').and('contain','Success!')
            .find('.success_choice:contains("Go back to the page where you started")').click();
        cy.get('.sgc_importer.success').should('not.be.visible');

        // Assert that an alert never happened
        // Assert that an alert DID NOT OCCUR
        cy.then(() => expect(alert).not.to.be.called);
        
    });
});
