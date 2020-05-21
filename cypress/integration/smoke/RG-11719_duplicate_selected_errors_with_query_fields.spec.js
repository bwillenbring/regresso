/// <reference types="cypress" />

describe('[SG-11719] Server Error when duplicating an Entity with a Query Field', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec().then(() => {
            // Create the shot
            cy
                .conditionally_create('Shot', {
                    project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
                    code: 'SG-11719',
                    filters: [
                        ['code', 'is', 'SG-11719'],
                        ['project', 'is', { type: 'Project', id: Cypress.config('TEST_PROJECT').id }],
                    ],
                })
                .then(id => {
                    cy.wrap(id).as('shot_id');
                    cy.wrap([id]).as('SHOTS_TO_DELETE');
                }); // end cy.create_entity
        });
    });

    /* ----------------------------------------------------------------------
    [SG-11719] Server Error when duplicating an Entity with a Query Field
    ---------------------------------------------------------------------- */
    it('Duplicate Selected Shot with Query Field Exposed', function() {
        // Create a query field on Shot
        let field_name = 'QA ' + Cypress.moment();
        let system_field_name = `sg_${Cypress._.snakeCase(field_name)}`;
        // Create a simple query field
        cy
            .create_query_field({
                field_owner_entity_type: 'Shot',
                entity_type: 'Version',
                field_name: field_name,
                summary_field: 'id',
                summary_default: 'record_count',
                summary_value: null,
            })
            .then(() => {
                // Navigate to the Shots Page
                cy.navigate_to_project_page('Shot');
                // Refresh to be safe
                cy.refresh_grid(true);
                // Set page mode to list
                cy.set_page_mode('list');
                // Expose the open notes count field
                cy.display_fields_in_grid(['code', system_field_name]);
                // Select the shot (by id)
                cy.get(`[sg_selector="row_selector:record_id_${this.shot_id}"]`).click({ force: true });
                // Right, click
                cy.click_toolbar_item('More');
                // Duplicate selected
                cy.handle_menu_item('Duplicate Selected');
                // Wait for spinner
                cy.wait_for_spinner();
                // Assert banner is present
                cy.get('[sg_id="MssgBx"]').should('be.visible').and('contain', 'has been created').then(banner => {
                    // And that the new Shot Id is > this.shot_id
                    let new_id = Number(Cypress.$(banner).find('a[sg_selector="link:sg_detail"]').attr('sg_entity_id'));
                    assert.isTrue(new_id > this.shot_id, `${new_id} > ${this.shot_id}`);
                });
            });
    });
});
