/// <reference types="cypress" />
// Set up Test Case variants
const test_case_options = {
    "Fast Summary Cell ON, New Exporter ON": {
        enable_new_summary_cell: 'yes',
        enable_new_exporter: 'yes'
    },
    "Fast Summary Cell ON, New Exporter OFF": {
        enable_new_summary_cell: 'yes',
        enable_new_exporter: 'no'
    },
    "Fast Summary Cell OFF, New Exporter ON": {
        enable_new_summary_cell: 'no',
        enable_new_exporter: 'yes'
    },
    "Fast Summary Cell OFF, New Exporter OFF": {
        enable_new_summary_cell: 'no',
        enable_new_exporter: 'no'
    }
};

const name_slug = Cypress.moment().format('h:mm:ss');

describe(`Background Color Rendering  - ${Object.keys(test_case_options).length} variants`, function() {
    before(function() {
        cy.get_access_token();
        cy.login_admin();

        // Disable the new exporter and Enable legacy page modes
        cy.set_preference({
            enable_new_exporter: 'no',
            hide_legacy_entity_query_modes: 'no',
        });

        // Declare vars that will be set inside of downstream blocks
        let asset_id, shot_id, task_id;

        cy.create_entity('Project', { name: `Query Fields ${Number(Cypress.moment())}` }).then(id => {
            // Reset your Test Project ID
            Cypress.config('TEST_PROJECT', {id: id});
            // Create a Shot, then upload a thumbnail to it
            cy
                .create_entity('Asset', {
                    project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
                    code: `Test Asset ${name_slug}`,
                })
                .then(id => {
                    // Save the asset id
                    asset_id = id;
                    cy.wrap(id).as('asset_id');
                }).then(() => {
                    // Create a Task linked to the Asset
                    cy.
                        create_entity('Task', {
                            project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
                            content: `Test Task ${name_slug}`,
                            entity: { type: 'Asset', id: asset_id },
                            sg_status_list: 'ip'
                        })
                        .then(id => {
                            task_id = id;
                            cy.wrap(id).as('task_id');
                        });
                }).then(() => {
                    // Create the Shot, and set its assets field to the Asset
                    cy.
                        create_entity('Shot', {
                            project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
                            code: `Test Shot ${name_slug}`,
                            assets: [{ type:'Asset', id: asset_id }]
                        })
                        .then(id => {
                            shot_id = id;
                            cy.wrap(id).as('shot_id');
                    });
                });
        }); // end cy.create_entity('Project')

    });

    after(function() {
        // Reset prefs
        cy.set_preference({
            enable_new_summary_cell: 'no',
            enable_new_exporter: 'no',
            hide_legacy_entity_query_modes: 'yes'
        });
    });

    // Iterate over each of your test_case_options and run 5 test cases / option
    for (let option in test_case_options) {
        describe(`${option}`, function() {
            before(function() {
                // Set the prefs appropriately
                cy.set_preference( test_case_options[option] );
                cy.log(`Setting prefs: ${test_case_options[option]}`);
            });

            beforeEach(function() {
                // Navigate to the Project shots page
                cy.navigate_to_project_page('Shot');
                // Set page mode to list
                cy.set_page_mode('list');
                // Display the field you just created
                cy.display_fields_in_grid(['code', 'assets', 'assets.Asset.step_0$sg_status_list']);
            });

            // no summaries: {column: 'sg_status_list', type: 'none'}
            // Task Count: {column: 'sg_status_list', type: 'record_count'}
            // status:
            // status % ip:  {column: 'sg_status_list', type: 'status_percentage', value: 'ip'}

            it('renders status summary of bubbled query field and displays status bg color', function() {
                // Set the summary to
                cy.get_grid().then(grid => {
                    grid.set_summary('assets.Asset.step_0$sg_status_list', {
                        column: 'sg_status_list',
                        type: 'status_list'
                    });
                });

                // Assert that the bubbled field does not display Calculating...
                cy
                    .get(`div.row:first td[field="assets.Asset.step_0$sg_status_list"]`)
                    .should('be.visible')
                    .and('not.contain', 'Calculating')
                    .and('have.css', 'background-color', 'rgb(202, 225, 202)');

            }); // end test case

            it('renders status summary % In Progress of bubbled query field', function() {
                // Set the summary to
                cy.get_grid().then(grid => {
                    grid.set_summary('assets.Asset.step_0$sg_status_list', {
                        column: 'sg_status_list',
                        type: 'status_percentage',
                        value: 'ip'
                    });
                });

                // Assert that the bubbled field does not display Calculating...
                cy
                    .get(`div.row:first td[field="assets.Asset.step_0$sg_status_list"]`)
                    .should('be.visible')
                    .and('not.contain', 'Calculating')
                    .and('contain', '100%');

            }); // end test case
        });
    }
});
