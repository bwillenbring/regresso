export function invoke_new_entity_form(entity_type = '') {
    cy.wait_for_spinner();
    if (entity_type === '') {
        cy.get_SG().then(SG => {
            SG.globals.page.root_widget.get_child_widgets()[2].create_new_entity();
            // Wait for the new entity form to be present
        });
    } else {
        // Click the plus btn
        cy.global_nav('plus_button');
        // Click the menu item corresponding to the entity_type
        cy.handle_menu_item(entity_type);
    }
}

/**
 * Sets a field value in the currently visible new entity form. Will work with the following data types:
 * <ul>
 * <li>Date</li>
 * <li>Duration</li>
 * <li>Entity</li>
 * <li>List</li>
 * <li>Number</li>
 * <li>Status List (pass in the short code)</li>
 * <li>Text</li>
 *</ul>

 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} fld - The system name of the field you wold like to edit.
 * @param {String} val - The value you would like to apply.
 *
 * @example <caption>Sets various fields in currently visible new Shot Form</caption>
 * // Description
 * cy.set_field_in_NwEnttyDlg('description', 'Closeup');
 * // Shot Type
 * cy.set_field_in_NwEnttyDlg('sg_shot_type', 'Regular');
 * // Status
 * cy.set_field_in_NwEnttyDlg('sg_status_list', 'ip');
 * // Cut In
 * cy.set_field_in_NwEnttyDlg('sg_cut_in', '5599');
 * // Task Template
 * cy.set_field_in_NwEnttyDlg('task_template', 'Animation - Shot');
 *
 */

export function set_field_in_NwEnttyDlg(field, value, autocomplete = false) {
    // Wrap everything with cy.get_SG() so that SG is within scope for the entirety of the function
    cy.get_SG().then(SG => {
        cy.get('[sg_selector="dialog:title"]').click();
        // First off, if there is an active editor, blur it - if an editor has focus, this complicates things
        if (SG.globals.active_editor) {
            SG.globals.active_editor.blur();
        }
        // Be flexible with your new entity form selector because of variants
        // This will not work with new Project form
        cy.get('.sg_new_entity_form, [sg_id*="Dlg:CllMngr"]').should('be.visible').within(dlg => {
            /**
             * Returns an object with 2 properties: `input_editor` and `click_target`.
             *
             * @param {String} field - The system field name (eg: code)
             *   - `input_editor` - a selector reference to the dom element that will be clicked on and typed into
             *   - `is_ready`: a function reference that checks whether the input is ready to receive typed input
             * @returns {Object} - An object with 2 properties:
             *
             * @example 
             * // Set asset name to 'Some new Asset'
             * const editor = get_editor('code');
             *
             */

            const get_editor = field => {
                // Determine what type of editor you are dealing with
                let input = Cypress.$(`.sg_input[sg_selector*=":${field}"]`);
                if (input.get(0).tagName == 'TEXTAREA') {
                    let input_editor = `textarea[sg_selector="textarea:${field}"]`;
                    let click_target = input_editor;
                    return {
                        input_editor: input_editor,
                        click_target: click_target,
                        is_ready: () => {
                            return Cypress.$(`input_editor:visible`).length === 1;
                        },
                    };
                } else {
                    // the input editor in this case can either be a textarea (text fields) or input (entity fields, step field)
                    let input_editor = `.entity_editor textarea:first, .entity_editor input:first`;
                    // let input_editor = `.entity_editor textarea, .entity_editor input[sg_selector^="input"]`;
                    let click_target = `.sg_cell_edit_trigger[sg_selector="input:${field}"]`;
                    return {
                        input_editor: input_editor,
                        click_target: click_target,
                        is_ready: () => {
                            let tag = SG.globals.active_editor.input_el.dom.tagName.toLowerCase();
                            return (
                                SG.globals.active_editor &&
                                SG.globals.active_editor.input_el &&
                                Cypress.$(`.entity_editor ${tag}`).length === 1
                            );
                        },
                    };
                }
            };
            // Get a reference to the editor
            const editor = get_editor(field);
            cy.log(`editor for field ${field}...`);
            // Click into the field, passing in force:true to mitigate any invisible elements that might block cypress interaction
            cy
                .waitUntil(
                    () =>
                        cy
                            .get(editor.click_target)
                            .should('be.visible')
                            .trigger('mouseover', { force: true })
                            .click({ force: true })
                            .then(() => {
                                // Return whether or not the editor is ready
                                return editor.is_ready();
                            }),
                    {
                        errorMsg: `Editor for ${field} is not yet ready`,
                        timeout: 30000,
                        interval: 1000,
                    }
                )
                .then(() => cy.log('Editor is ready...'));
            // Now you can type...
            cy.then(() => {
                // Clear and type into the input, trigger the change handler
                // and blur the element to stow the editor and apply the edit
                if (!autocomplete) {
                    cy.get(editor.input_editor).clear().type(value).trigger('change').blur();
                } else {
                    cy
                        .get(editor.input_editor)
                        .clear()
                        .type(value)
                        .then(() => {
                            cy.waitUntil(() => Cypress.$('.sg_menu_body match').length > 0).then(() => {
                                // Click the first match
                                cy.get('.sg_menu_body match:first').click();
                            });
                        })
                        .then(() => {
                            // Blur the editor only if it has not already been blurred
                            if (SG.globals.active_editor) {
                                SG.globals.active_editor.blur();
                            }
                        });
                }
            });
        });
    });
}
