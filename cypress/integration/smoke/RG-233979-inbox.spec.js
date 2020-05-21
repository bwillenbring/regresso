/// <reference types="cypress" />

describe('[TestRail 233979] Navigate to inbox, and click an update', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.get_access_token();
        cy.prep_regression_spec().then(() => {
            // Create a note on the project
            cy.create_entity('Note', {
                project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
                content: 'Test note',
                subject: 'This is a regression testing note',
                note_links: [{ type: 'Project', id: Cypress.config('TEST_PROJECT').id }],
            });
        });
    });

    // it('login_artist', function() {
    //     cy.login_artist();
    // });

    /* ----------------------------------------------------------------------
    Navigate to Inbox, confirm default state of page, click an update
    and ensure it loads in the right pane
    https://meqa.autodesk.com/index.php?/cases/view/233979
    ---------------------------------------------------------------------- */
    it('navigates to inbox and clicks an update', function() {
        cy.login_artist();
        cy.home();
        // Click global nav => Inbox
        cy.get('#sg_global_nav [sg_selector="inbox"]').click();
        // Wait for spinner
        cy.wait_for_spinner();
        // Assert the page title == Inbox
        cy.get('[sg_selector="label:title"]').invoke('text').should('eq', 'Inbox');
        // Assert that the dropdown is already set to 'All Types'
        cy.get('[sg_selector="dropdown:filter_mode"] .value').invoke('text').should('eq', 'All Types');
        // Conditionally click 'Show read messages' if it exists
        cy
            .get('div.updates [sg_id^="SgInbxCntnts:index_"], div.empty_message span:contains("Show read messages")')
            .then(items => {
                let upd = items[0];
                if (Cypress.$(upd).text().includes('Show read messages')) {
                    // Click 'Show Read Messages'
                    upd.click();
                }
            });
        // Now click the first update
        cy.get('div.updates [sg_id^="SgInbxCntnts:index_"]:first').click();
        // Confirm the url changes to ?updated_id=<some_id>
        cy.url().should('contain', '?update_id=');
        // Assert that the page_type matches expected
        cy.get('div.right_pane div.inside_pane').then(right_pane => {
            // Print the actual page_type
            cy.log('page_type:', right_pane.attr('page_type'));
            // Assert...
            expect(right_pane.attr('page_type')).to.be.oneOf(['stream_detail', 'update_detail']);
        });
    });
});
