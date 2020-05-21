/// <reference types="cypress" />

describe('Filter Panel', function() {
    before(function() {
        cy.prep_regression_spec().then(() => {
            // Create an asset...
            let name = 'Baba Black Sheep ' + Cypress.moment();
            cy.wrap(name).as('entity_name');
            let data = {
                code: name,
                project: {
                    type: 'Project',
                    id: Cypress.config('TEST_PROJECT').id,
                },
            };
            cy.create_entity('Asset', data).then(id => {
                cy.wrap(id).as('entity_id');
            });
        });
    });

    // [SG-11726] Regression in date filters using tokens Yesterday, Today, Tomorrow
    it.only('[SG-11726] Filter Tokens', function() {
        // Go to a tasks page...
        cy.navigate_to_project_page('Task');
        cy.get_field('Task', 'Gantt Bar Color').then(s => {
            cy.log(s);
        });
        //['Link', 'name_contains', this.entity_name],
        let opts = {
            name: 'Token Filter',
            match_type: 'any',
            entity_type: 'Task',
            filters: [
                ['Start Date', 'is', 'Yesterday'],
                ['Start Date', 'is', 'Today'],
                ['Start Date', 'is', 'Tomorrow'],
                ['Created by', 'is', 'Me'],
            ],
        };
        cy.create_fp_filter(opts);
        // Wait for the spinner
        cy.wait_for_spinner();
    });

    it('Create Filter', function() {
        // Go to a tasks page...
        cy.navigate_to_project_page('Task');
        cy.get_field('Task', 'Gantt Bar Color').then(s => {
            cy.log(s);
        });
        //['Link', 'name_contains', this.entity_name],
        let opts = {
            name: 'Text Filter',
            match_type: 'all',
            entity_type: 'Task',
            filters: [
                ['Link', 'is_a', 'Asset'],
                ['Start Date', 'is', 'July 4, 1981'],
                ['Start Date', 'is', 'Yesterday'],
                ['Start Date', 'is', 'Today'],
                ['Start Date', 'is', 'Tomorrow'],
                ['Duration', 'is', '5 days'],
                ['Milestone', 'is', true],
                ['Gantt Bar Color', 'is', 'rgb(180,1,59)'],
            ],
        };
        cy.create_fp_filter(opts);
        // Wait for the spinner
        cy.wait_for_spinner();
    });
});

/* ----------------------------------------------------------------------
Custom Commands Below...
---------------------------------------------------------------------- */

Cypress.Commands.add('get_field', function(entity_type, name) {
    cy.get_SG().then(SG => {
        let fields = SG.schema.entity_fields[entity_type];
        let fld = Cypress._.find(fields, function(f) {
            if (f.display_name == name || f.name == name) {
                return f;
            }
        });
        return fld;
    });
});

Cypress.Commands.add('create_fp_filter', function(options = {}) {
    // Expand the filter panel if necessary
    cy.expand_filter_panel();
    // Click '[+] Add new filter'
    cy.click_new_filter();
    // Type the filter name
    cy.get('[sg_id="saved_filter_panel"] [sg_selector="input:name"]').type(options.name);
    // Choose the global filter match type
    cy.get('[sg_selector="dropdown:query_condition"]:first').select(options.match_type);
    // Iterate over each of the passed in filters
    cy.wrap(options.filters).each(filter => {
        // Create a var for the current filter row being constructed
        let row_sel = 'tr.condition_row:last';
        // Store your filter values...
        cy.log('85');
        let filter_field = filter[0];
        let filter_operator = filter[1];
        let filter_value = filter[2];
        // Click the + button to add a new filter row
        cy.get("[sg_selector='button:plus']:last").click();
        // Click the arrow dropdown to Expand the fields menu
        cy.get(row_sel + ' [sg_id="condition_column"] [sg_selector="button:dropdown_arrow"]').click();
        // Select the field from the fields menu
        cy
            .get('div.sg_menu_body.sg_scroll_area')
            .should('be.visible')
            .find('span.sg_menu_item_content')
            .then(menu_items => {
                let item = Cypress._.find(menu_items, function(m) {
                    if (Cypress.$(m).text() == filter_field) {
                        return m;
                    }
                });
                // Click that menu item
                item.click();
            });
        // The 1st fields menu should no longer be visible
        cy.get('div.sg_menu_body.sg_scroll_area').should('not.be.visible');
        // Click the 2nd dropdown to expand the filter operator
        cy.get(row_sel).find('.condition_type_select').click();
        // Click the filter operator (is, is_not, is not, etc...)
        cy.get('div.sg_menu_body:visible [sg_selector^="menu:"]').then(items => {
            let item = Cypress._.find(items, function(i) {
                if (
                    Cypress.$(i).text() == filter_operator ||
                    Cypress.$(i).attr('sg_selector') == 'menu:' + filter_operator
                ) {
                    return i;
                }
            });
            item.click();
            console.log(item);
        });
        // Click the 3rd input to set the filter value...
        cy.get(row_sel).find('.condition_value').click();
        // Now, get the data type...
        cy.get_field(options.entity_type, filter_field).then(field => {
            let data_type = field.data_type;
            cy.log('---------------------');
            cy.log('Data type...', data_type);
            cy.log('---------------------');
            switch (data_type) {
                case 'entity':
                case 'multi_entity':
                case 'multientity':
                    cy.get('div.entity_editor').then(editor => {
                        // What sort of editor is it?
                        cy.log('--------------------------');
                        let editor_type = Cypress.$(editor).first().get(0).tagName;
                        cy.log('Editor tag name...', Cypress.$(editor).html());
                        cy.log('Editor 1st child...', Cypress.$('div.entity_editor:first-child'));
                        cy.log('Editor 1st child html...', Cypress.$(editor).html());
                        cy.log('--------------------------');
                        if (Cypress.$(editor).find('input').attr('sg_selector') == 'input:entity') {
                            // Autocomplete...
                            cy.wrap(editor).find('input').type(filter_value);
                            // cy.get('.sg_menu_body:visible span.sg_menu_item_content').should('be.visible');
                            cy.get('.sg_menu_body:visible [sg_selector^="menuitem:entity:"]').should('be.visible');
                            // Now select the 1st match...
                            cy
                                .get(
                                    '.sg_menu_body:visible .sg_menu_item[sg_selector^="menuitem:entity:"]:has(match):first'
                                )
                                .click();
                        } else {
                            cy.get('.sg_menu_body:visible span.sg_menu_item_content').then(items => {
                                let item = Cypress._.find(items, function(i) {
                                    if (Cypress.$(i).text() == filter_value) {
                                        return i;
                                    }
                                });
                                item.click();
                            });
                        }
                    });
                    break;

                case 'color':
                    cy.get('.swatch[style^="background-color:' + filter_value + '"]').click({
                        force: true,
                    });
                    break;

                case 'checkbox':
                    if ([true, 1, 'checked'].includes(filter_value)) {
                        cy.get(row_sel).find('[sg_id="condition_value"] input[type="checkbox"]').click();
                    }
                    break;

                default:
                    // Text, string, list, number, number-like
                    // Type the filter input
                    cy
                        .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                        .type(filter_value)
                        .trigger('keydown', {
                            keyCode: 9,
                            which: 9,
                        });
                    break;
            }
        });
    }); //end cy.wrap(options["filters"]).each

    //Now save the filter
    cy.save_filter();
});
