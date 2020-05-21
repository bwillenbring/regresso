/// <reference types="cypress" />
/**
 * --------------------------------------------------
 * Related Ticket(s): [SG-150043]
 * Steps to reproduce
 * --------------------------------------------------
 * 1. Login to 8.8 Shotgun site, and navigate to the review notes app 
 * 2. Open a Playlist that contains Versions
 * 3. Open the Browser Console
 * 4. On the RHS of the Notes App, try and select the related Versions/Notes/Tasks tabs - whenever you select 'Version' or 'Task' the pane breaks, with the below error message, and can't be recovered without a refresh. 
 * 
 * Expected: You should be able to switch views on the right-hand-side without errors
 */

describe('[SG-15043] ', function() {
    before(function() {
        cy.get_access_token();
        cy.set_network_routes();
        cy.login_admin();
    });
    // home 
    it.only('go home', function() {
        cy.navigate_to_page('/page/notes_app');
    });

    // Go to the prefs page 
    it('Examples', function() {
        // Go to page 882
        cy.navigate_to_page('/page/882');
        // Go to the notes app 
        cy.navigate_to_page('/page/notes_app');
        // Prefs page 
        cy.navigate_to_page('/preferences');
        // Prefs page without /
        cy.navigate_to_page('preferences');
        // Full page entity creation form 
        cy.navigate_to_page('/new/Note');
        // Go home... this calls cy.navigate_to_page('');
        cy.home();
    });

    it('', function() {
        const fn = () => {
            setTimeout(console.log, 500, 'in the load handler...');
        };
        cy.navigate_to_page('', fn);
    })
});
