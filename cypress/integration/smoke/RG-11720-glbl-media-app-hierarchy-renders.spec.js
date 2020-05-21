/// <reference types="cypress" />

// Proj name: GMP 1581608518469
// What there is: BrowseTree:GMP_1581608518469/Assets/Sword_of_the_Gathering_Clouds_of_Heaven

describe('[SG-11720] Global Media app hierarchy is visible', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
        // Ensure that Versions are enabled for Asset, Shot, and Sequence
        cy.enable_versions_for_entities(['Asset', 'Shot', 'Sequence']);

        // Initialize Project name variables 
        const p_name = `GMP ${String(Number(Cypress.moment()))}`;
        const p_name_ = p_name.replace(/ /g, '_');
        const data = { name: p_name };
        // Persist these variables 
        cy.wrap(p_name).as('p_name');
        cy.wrap(p_name_).as('p_name_');
        // Create a project with fresh media...
        cy.create_entity('Project', data).then(id => {
            Cypress.config('TEST_PROJECT', {id: id});
            // Save your project id
            cy.wrap(id).as('gm_project_id');
            cy.log('Global Media Project id is...' + id);
            let p = {
                type: 'Project',
                id: id,
            };
            // Create a Character asset
            cy.create_entity('Asset', {
                code: 'Wemmick',
                sg_asset_type: 'Character',
                project: p,
            });
            // Create a Prop asset
            cy.create_entity('Asset', {
                code: 'Sword of the Gathering Clouds of Heaven',
                sg_asset_type: 'Prop',
                project: p,
            });
        });
    });
    after(function() {
        // Delete the global media project
        cy.delete_entity('Project', this.gm_project_id);
    });

    /* ----------------------------------------------------------------------
    Confirm Global Media app is visible
    [SG-11720] Regression - Global Media App Hierarchy Missing
    ---------------------------------------------------------------------- */

    it('sets and confirms hierarchy of global media app', function() {
        // Put your persisted vars into local vars 
        const p_name = this.p_name;
        const p_name_ = this.p_name_;

        cy.navigate_to_project_page('Asset');
        cy.get('[sg_selector="button:config_project_nav_gear"]').click();
        cy.handle_menu_item('Tracking Settings');
        // Also ensure there are no spinners 
        cy.wait_for_spinner();
        // Assert that 'Asset' is among the already-visible entities 
        cy
            .get('[sg_id="group:project_tracking"] [sg_id^="project_tracking:index_"][item_id="Asset"]')
            .should('be.visible')
            .find('[sg_selector="label:asset"]').click({ force: true });
        // Click 'Asset'
        
        // Assert that the properties tab is selected 
        cy.get('.right_pane [sg_selector="tab:properties"].selected').should('be.visible');
        // Ensure that the hierarchy is set to Asset type: 
        cy
            .get('[sg_selector="input:hierarchy_navigation"]')
            .find('[sg_selector="menu:disclosure"]').click({ force: true });
        // Select 'Type > Asset'
        cy.handle_menu_item('Type > Asset');
        // Ensure that the value of the input is what you just clicked
        cy.waitUntil(() => Cypress.$('[sg_selector="input:hierarchy_navigation"]').text().includes('Type > Asset'));
        // Click Done 
        cy.get('[sg_selector="button:done"]').then(btn => {
            if (Cypress.$(btn).attr('disabled')) {
                // Click 'Close'
                cy.get('[sg_selector="button:close"]').click();
            }
            else {
                // Click 'Done'
                cy.get(btn).click();
            }
        });

        // Go to the media center 
        cy.visit('/page/media_center');
        // Wait for the loading indicator to not be there 
        cy.waitUntil(() => Cypress.$('[sg_selector="canvas:loading_indicator"]').css('visibility') == 'hidden');
        // Conditionally dismiss the onramp dialog
        cy.wait_for_spinner().then(() => {
            if (Cypress.$('[sg_id="dialog:media_center_on_ramp"]').length > 0) {
                cy.get('[sg_selector="button:close"]').click();
                cy.wait_for_spinner();
            }
        });
        // Expand the correct project...
        cy.get('[sg_id="BrowseTree:' + p_name_ + '"]:contains("' + p_name + '")').find('div.arrow_closed_dark').click();
        // Expand assets
        cy.get('[sg_id="BrowseTree:' + p_name_ + '/Assets"]').find('div.arrow_closed_dark').click();
        // Assert there are folders for each expected Section
        ['Character', 'Prop'].forEach(function(section) {
            let selector_name = `[sg_id="BrowseTree:${p_name_}/Assets/${section}"]`;
            // cy.get('[sg_id="BrowseTree:' + p_name_ + '/Assets/' + section + '"]').should('be.visible');
            cy.log('----------------------------');
            cy.log('Selector...', selector_name);
            cy.log('----------------------------');
            cy.get(selector_name).should('be.visible');
        });
    });
});
