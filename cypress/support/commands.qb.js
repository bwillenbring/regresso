/* ------------------------------------------------------------------------------------------------------

FILTER PANEL AND QUERY BUILDER COMMANDS BELOW

------------------------------------------------------------------------------------------------------ */

Cypress.Commands.add('filter_panel_is_visible', () => {
    return Cypress.$("[sg_id='filter_panel']").length > 0;
});

Cypress.Commands.add('filter_panel_is_docked', () => {
    return Cypress.$("[sg_selector='docked_filter_panel']").length > 0;
});

Cypress.Commands.add('filter_panel_has_filters', () => {
    return Cypress.$("[sg_selector='button:clear_filters']:contains('No filters applied')").length > 0;
});

Cypress.Commands.add('dock_filter_panel', () => {
    if (cy.filter_panel_is_docked() == false) {
        cy.get("[sg_selector='button:dock_panel']").click();
    }
});

Cypress.Commands.add('expand_filter_panel', () => {
    cy.filter_panel_is_visible().then(fp_is_visible => {
        if (fp_is_visible == false) {
            cy.get("[sg_selector='filter_panel_button']:last").click();
        } else {
            cy.dock_filter_panel();
        }
    });
});

Cypress.Commands.add('click_new_filter', () => {
    cy.wait_for_spinner().then(() => {
        cy.get("[sg_selector='button:new_filter']").click();
    });
});

Cypress.Commands.add('save_filter', () => {
    cy.get("[sg_id='saved_filter_panel'] [sg_selector='button:submit']").click().then(() => {
        cy.wait_for_spinner();
    });
});

Cypress.Commands.add(
    'create_new_filter',
    (
        {
            name = 'Cypress filter',
            match_type = 'all',
            options = {
                filters: [],
                disable_standard_project_condition: false,
                save_filter: true,
            },
        } = {}
    ) => {
        // 1. Make sure the filter panel is open, and a new filter widget is exposed
        cy.expand_filter_panel();

        // 2. Click + new filter
        cy.click_new_filter();

        // 3. Type the filter name
        cy.get("[sg_id='saved_filter_panel'] [sg_selector='input:name']").type(name);

        // 4. Choose the global filter match type
        cy.get("[sg_selector='dropdown:query_condition']:first").select(match_type);

        // 5. Iterate over each of the passed in filters
        cy.wrap(options['filters']).each($filter => {
            // 5. Click the LAST + button (which could also be the only one)
            cy.get("[sg_selector='button:plus']:last").click().then(() => {
                //Stay within the correct filter row
                cy.get('tr.condition_row:last').then($row => {
                    // Expand the fields menu
                    cy.wrap($row).find('.condition_column_col .sg_menu_dropdown').click();

                    // Click the field name in the fields menu
                    // expects field name to match: Date Created
                    // does not expect: date_created
                    cy.handle_menu_item($filter[0]);
                    cy.wrap($row).find('.condition_type_select').click();
                    cy.get("div.sg_menu_body:visible [sg_selector='menu:" + $filter[1] + "']").click();

                    // Select the filter value(s)
                    cy.wrap($row).find('.condition_value:first').click();
                    let val = $filter[2];

                    // Handle the possibility of autocomplete
                    if ($filter.length > 3 && $filter[3].autocomplete == true) {
                        // Type the value into the editor
                        cy
                            .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                            .type($filter[2]);

                        // Wait for there to be at LEAST 1 match
                        cy.waitUntil(() => Cypress.$('.entity_editor_listbox match').length > 0);

                        // Wait for the autocomplete dropdown
                        cy.get('.entity_editor_listbox').should('be.visible');
                        // Click the first autocompleted match...
                        cy.get('.entity_editor_listbox match:first').click({ force: true });
                        // The matched brick should appear in the entity editor
                        cy.get('[sg_id="entity_editor"] .entity_editor_matched').should('be.visible');
                    } else if ($filter.length > 3) {
                        // Handle the possibility of binary filter value inputs (eg: in the range a to b)
                        // Type the 1st filter value
                        cy
                            .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                            .type($filter[2])
                            .trigger('keydown', {
                                keyCode: 9,
                                which: 9,
                            });

                        // Select and type the 2nd filter value
                        cy.get($row).find('.condition_value.typed_value_2').click();
                        cy
                            .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                            .type($filter[3])
                            .trigger('keydown', {
                                keyCode: 9,
                                which: 9,
                            });
                    } else {
                        // Type the value into the single filter value input
                        cy
                            .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                            .type($filter[2])
                            .trigger('keydown', {
                                keyCode: 9,
                                which: 9,
                            });
                    }
                }); //end cy.get("tr.condition_row:last")
            }); // end cy.get("[sg_selector='button:plus']:last")
        }); //end cy.wrap(options["filters"]).each

        //Now, you have to save the filter
        cy.save_filter();
    }
);

Cypress.Commands.add('disable_standard_project_condition', () => {
    cy
        .get('#page_project_condition_gear_menu')
        .click()
        .then(() => {
            cy
                .get("span[sg_selector='menu:disable_standard_page_project_condition']")
                .should('contains', 'Disable Standard Project Condition', 'Disable proj. condition menu is visible');
        })
        .click()
        .then(() => {
            cy
                .get('#page_project_condition_disabled_warning:visible')
                .should('exist', 'The disabled project warning is visible in the filter panel.');
        });
});

Cypress.Commands.add('get_page_filter_panel', () => {
    return Cypress.$(".sgc_filter_panel[filter_panel_type='main']");
});
