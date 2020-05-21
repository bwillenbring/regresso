/// <reference types="cypress" />

// https://meqa.autodesk.com/index.php?/cases/view/233981

describe('[TestRail 233981] Edit an assets name in the grid', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });
    after(function() {
        cy.delete_entity('Asset', this.asset_id);
    });

    /* ----------------------------------------------------------------------
    Edit an Asset's name in the grid
    https://meqa.autodesk.com/index.php?/cases/view/233981
    ---------------------------------------------------------------------- */
    it('edits an asset name in the grid', function() {
        // First, create an Asset with a unique name
        let asset_name = 'Asset ' + Cypress.moment();
        let data = {
            code: asset_name,
            project: {
                type: 'Project',
                id: Cypress.config('TEST_PROJECT').id,
            },
        };
        cy.create_entity('Asset', data).then(asset_id => {
            // Save the asset id
            cy.wrap(asset_id).as('asset_id');
            cy.navigate_to_project_page('Asset');
            // Set page mode to list
            cy.set_page_mode('list');
            // Display just the code field
            cy.display_fields_in_grid(['code']);
            // Run a quick filter
            cy.run_quick_filter(asset_name);
            // Set a new value
            let new_value = 'Edited Asset Name ' + Cypress.moment();
            cy.edit_asset_in_grid({
                field_name: 'code',
                record_id: asset_id,
                new_value: new_value,
            });
            // Now, assert that the grid contains the edited asset name
            cy.get('td[field="code"][record_id="' + asset_id + '"]').should('contain', new_value);
            // Wait a sec to ensure that the server has time to catch up
            cy.wait(1000);
            cy.get_entity('Asset', asset_id, ['code']).then(resp => {
                assert.isTrue(resp.attributes.code == new_value, 'Server confirms the edited value');
            });
        });
    });
});
