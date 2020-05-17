/// <reference types="cypress" />

describe('Basic smoke test', function() {
    before(function() {
        cy.get_access_token();
        cy.set_network_routes();
    });

    it('logs in as admin via UI sign-in form then logs out', function() {
        cy.visit('/user/login');
        // Type login 
        cy.get('input[name="user[login]"]').clear().type(Cypress.config('admin_login')).blur();
        // Type password
        cy.get('input[name="user[password]"]').clear().type(Cypress.config('admin_pwd')).blur();
        // Submit 
        cy.get('form button[name="commit"]').click();
        // Confirm navigation has taken place 
        cy.url().should('not.contain', 'user/login');
        // Wait until the page is loaded 
        cy.wait_for_page_to_load();
        cy.waitUntil(() => cy.get_SG().then(SG => {
            if (!SG.globals.current_user) {
                return false;
            }
            else {
                return SG.globals.current_user.login === Cypress.config('admin_login');
            }
        }),
        {
            timeout: 30000,
            interval: 2000
        });
        // Global nav should be visible
        cy.get('#sg_global_nav').should('be.visible');
        // And there should be no spinners
        cy.wait_for_spinner();
        // Logs out 
        cy.get('[sg_selector="button:user_account"]').click();
        // Signo ut
        cy.handle_menu_item('Sign Out');
        // Confirm logout 
        cy.url().should('contain', 'user/login');
        cy.get('main').should('contain', 'You have logged out successfully.');
    });

    describe('Admin Page Navigation', function() {
        before(function() {
            cy.login_admin();
        });

        it('visits the prefs page and confirms pref sections', function() {
            // Navigate to the page 
            cy.navigate_to_page('/preferences');
            // Assert no spinners 
            cy.wait_for_spinner();
            // Assert that you see what you expect
            cy.get('[sg_selector="label:page_name"]').should('contain', 'Site Preferences');
            const accordions = [
                'Language and Formatting',
                'Scheduling',
                'File Management',
                'Navigation Widget',
                'Detail Pages',
                'Entities',
                'Security',
                'Authentication',
                'Advanced'
            ];
            accordions.forEach((sectionName) => {
                cy.get(`.pref_group.closed [open_key="${sectionName}"]`).scrollIntoView().should('be.visible');
            });
        });
    });
});