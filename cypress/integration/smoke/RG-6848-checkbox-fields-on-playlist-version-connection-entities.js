/// <reference types="cypress" />

/** Sorting/Grouping/Filtering Checkbox Fields on Connection Entities in Detail Pages Causes Error
 * Ticket: https://jira.autodesk.com/browse/SG-6848
 * Story Points: 2
 * Affects Version(s): 7.9.1.0
 * Fixed Version(s): 8.8
 * Affects Customers: Laika
 * Repro Steps...
 *  1 - Sign in to the 7.9 release site.
 *  2 - Navigate to a Playlist Detail Page.
 *  3 - Create a new "Version-in-Playlist Field..." under PLAYLIST-SPECIFIC FIELDS or use the one I created called "Checkbox Bug".
 *  4 - Check a couple of Versions on this field.
 *  5 - Try to sort, group, and filter by that checkbox field..
 *  6 - Observe the error.
 */

// Create a name slug 
const name_slug = String(Number(Cypress.moment()));

describe('[SG-6848]', function() {
    before(function() {
        cy.get_access_token();
        cy.set_network_routes();
        cy.login_admin();
        // Create a Test Project 
        cy.create_entity('Project', { name: `Connection Field Project ${name_slug}` }).then(id => {
            // Set the Test Proejct id 
            Cypress.config('TEST_PROJECT', { id: id });
            const p = { type:'Project', id: Cypress.config('TEST_PROJECT').id };

            // Create a Playlist and persist the id 
            cy.create_entity('Playlist', {
                code: `PL ${name_slug}`,
                project: p,
            }).then(playlist_id => {
                cy.wrap(playlist_id).as('playlist_id');
                
                // Create a Version in the Playlist and persist the Version id 
                cy.create_entity('Version', {
                    code: `Version ${name_slug}`,
                    project: p,
                    playlists: [{ type: 'Playlist', id: playlist_id }]
                }).then(version_id => {
                    cy.wrap(version_id).as('version_id');
                })
            })
        }).then(() => {
            // Navigate to the Playlist detail page 
            cy.navigate_to_page(`/detail/Playlist/${this.playlist_id}`);
            // Wait for the detail page loading indicator to be gone 
            cy.get('[sg_selector="canvas:loading_indicator"]').should('not.be.visible');

            // Initialize a field display name for the Version-in-Playlist field you're about to create
            const field_display_name = `VPL Checkbox ${name_slug}`;
            // Initialize a system field name that you will set after the field is actually created
            let system_field_name = '';
            // Click Versions tab 
            cy.get('[sg_selector="tab:Versions"]').click();
            // Wait for spinner 
            cy.wait_for_spinner();
            // Set page mode to list 
            cy.set_page_mode('list');
            // Click Toolbar => More 
            cy.get('.tab_content [sg_selector="fields_button"]').click();
            // Click the 
            cy.handle_menu_item('Add New Version-in-Playlist Field...');
            // Wait for spinner 
            cy.wait_for_spinner();
            // Assert the new configure field dialog is present 
            cy
                .get('[sg_id="page:root_widget:stream_detail:tab_0:list_content:CnfgrFldDlg')
                .should('be.visible')
                .within(dlg => {
                    // Type a name for the field 
                    cy.get('[sg_selector="input:field_name"]').type(field_display_name);
                    // Choose 'Checkbox' as the field type 
                    cy.get('#checkbox').click({ force: true });
                    // Click Next button 
                    cy.get('[sg_selector="button:next"]').click();
                })
            // Wait for spinner 
            cy.wait_for_spinner();
            // Assert the secondary field creation dialog is present and click 'Create Field'
            cy
                .get('[sg_id="dialog:sgd_apply_to_projects')
                .should('be.visible')
                .find('[sg_selector="button:create_field"]').click({ force: true });
            // Assert the prog. indicator is visible
            cy.get('.progress_indicator_overlay').should('be.visible');
            // Assert that the prog. indicator is no longer visible 
            cy.get('.progress_indicator_overlay').should('not.be.visible');
            // And wait for the spinner 
            cy.wait_for_spinner();
            // Assert that the newly created field is amongst the displayed fields
            cy
                .get(`td.heading:has(.display_name:contains("${field_display_name}"))`)
                .should('be.visible')
                .then(header => {
                    // Get the system name of the field 
                    system_field_name = Cypress.$(header).attr('field');
                    // Persist the system field name 
                    cy.wrap(system_field_name).as('system_field_name');
                });
        })
        
    });

    after(function() {
        // Delete the Version-in-Playlist Field 
        cy.delete_field('PlaylistVersionConnection', this.system_field_name);
    })

    it.only('Clicks a Version-In-Playlist checkbox field', function() {
        cy.get_tabbed_grid().then(grid => {
            const fields_to_display = ['code', this.system_field_name];
            let cols = grid.get_columns(true);
            // Add new fields, hide old
            grid.change_columns(fields_to_display, cols);
            // Wait for spinner 
            cy.wait_for_spinner();
            // Check the checkbox for the Version's Version-in-Playlsit field 
            cy
                .get(`td[record_type="Version"][record_id="${this.version_id}"][data_type="checkbox"]`)
                .find('input[type="checkbox"]')
                .click({ force: true });
        });

    });

    it('Sorts a Version-In-Playlist checkbox field', function() {

    });

    it('Groups by a Version-In-Playlist checkbox field', function() {

    });
});


Cypress.Commands.add('get_tabbed_grid', function() {
    cy.get_SG().then(SG => {
        const page = SG.globals.page.root_widget.get_child_widgets()[2];
        const grid = page.get_child_widgets()[0].get_content_widget();
        return grid;
    })
})