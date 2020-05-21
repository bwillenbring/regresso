/// <reference types="cypress" />

describe('[SG-10830] Mini Tasks Grid renders in new note form', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    [SG-10830] Tasks dialogue no longer appears in the new note creation form
    Regressed: SG_8.1.0.0
    Fixed: SG_8.1.0.3
    ---------------------------------------------------------------------- */
    it('confirms task addressings widget in new note form', function() {
        // Batch create 3 shots
        let shot_slug = 'C-Shot ' + Cypress.moment();
        cy
            .batch_create_entities({
                entity_type: 'Shot',
                total_entities: 2,
                identifier_field: 'code',
                slug: shot_slug,
            })
            .then(retValue => {
                // Store your shot ids
                let shot1 = retValue.body.data[0].data.id;
                let shot2 = retValue.body.data[1].data.id;
                // Create 2 Tasks on Shot 1
                cy.batch_create_entities({
                    entity_type: 'Task',
                    total_entities: 2,
                    identifier_field: 'content',
                    fields: {
                        entity: {
                            type: 'Shot',
                            id: shot1,
                        },
                    },
                    slug: 'Task on Shot 1 -',
                });
                // Create 2 Tasks on Shot 2
                cy.batch_create_entities({
                    entity_type: 'Task',
                    total_entities: 2,
                    identifier_field: 'content',
                    fields: {
                        entity: {
                            type: 'Shot',
                            id: shot2,
                        },
                    },
                    slug: 'Task on Shot 2 -',
                });
            });
        // Go to the shots page
        cy.navigate_to_project_page('Shot');
        // Set mode to list
        cy.set_page_mode('list');
        // Run a quick filter to only show the shots you're interested in
        cy.run_quick_filter(shot_slug);
        // Wait 3 seconds to prevent premature clicking
        cy.wait(3000);

        // Select all Shots by clicking on the select all grid selector
        cy.get('[sg_selector="checkbox:select_toggle_all"]').then(select_all => {
            cy.get(select_all).invoke('width').should('be.above', 1);
            cy.get(select_all).click({ force: true });
        });
        // Click 'More'
        cy.click_toolbar_item('More');
        // Select 'Add note to selected'
        cy.handle_menu_item('Add Note to Selected...');
        // Select 'create duplicate notes on each'
        cy.get('[sg_id="NwNtDlg"]').should('be.visible').find('input[sg_selector="radio:linked_to_each"]').click();
        // Show tasks
        cy.get('span.show_tasks.task_grid_toggle').click();
        // Confirm the mini tasks grid is showing
        cy.get('[sg_id="NwNtDlg:CllMngr:TsksMnGrdSlctr:MnGrd:CllMngr"]').should('be.visible').within(mini => {
            // Confirm there are exactly 4 tasks in that grid
            cy.get('td[record_type="Task"][sg_selector="field:content"]').its('length').should('eq', 4);
        });
    });
});
