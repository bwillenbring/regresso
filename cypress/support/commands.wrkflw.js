// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('GlobalNav_user_account', (selection, wait_element = false) => {
    cy.wait_progress_completed();
    // Navigate the user account button
    let menu_path = selection.split('|');
    // bringing up the user account menu.
    cy.wait_for('[sg_id=GlblNv:UsrAccntMnBttn] [sg_selector=button:user_account]').click().then(resp => {
        // # Click on the menu item
        cy.wait(Cypress.config('QA_WAIT'), { log: false });
        if (menu_path.length === 1) {
            cy.log('Click global nav -> User Account (button) -> ', menu_path[0]);
            // Special case for the User Account menu item
            // Need to modify code in order to open in the same tab
            // @WARNING: The URL for the Account Center has been modified
            //           to point to https://account.shotgunsoftware.com/login
            if (menu_path[0] === 'menu:manage_account') {
                cy
                    .get('[href="https://www.shotgunsoftware.com/accounts"]')
                    .invoke('attr', 'target', '_self')
                    .should('have.attr', 'target', '_self')
                    .then(() => {
                        // Asserting for now as there is an Iframe issue with cypress.
                        // We can't support clicking on this item for now.
                        assert.isTrue(
                            true,
                            'IFrame limitation (Oct 2018) with Cypress impossible to click on this menu item'
                        );
                    });
            } else {
                cy.wait_for(`[sg_id=GlblNv:UsrAccntMnBttn:Mn] [sg_selector=${menu_path[0]}]`).then(resp => {
                    let hreflink = resp[0]['parentElement']['parentElement']['href'];
                    cy.visit(hreflink).then(resp => {
                        // Reload once if page fails on the first try
                        if (resp == null) {
                            cy.reload().then(() => {
                                cy.wait_progress_completed().then(() => {
                                    if (wait_element) {
                                        cy.wait_for(wait_element).should('be.visible');
                                    }
                                });
                            });
                        } else {
                            cy.wait_progress_completed().then(() => {
                                if (wait_element) {
                                    cy.wait_for(wait_element).should('be.visible');
                                }
                            });
                        }
                    });
                });
            }
        } else if (menu_path.length === 2) {
            // Workaround 'click' issues.
            // Some menu item are best bring up by typing in the item name to avoid clicking issues.
            let typeThis = menu_path[0].split(':');
            cy.wait_for(`[sg_id=GlblNv:UsrAccntMnBttn:Mn]`).type(typeThis[typeThis.length - 1]).then(() => {
                let menu_id = Cypress.$('[sg_id=GlblNv\\:UsrAccntMnBttn\\:Mn]')[1]['id'];
                cy
                    .wait_for(`[id=${menu_id}][sg_id=GlblNv:UsrAccntMnBttn:Mn] [sg_selector=${menu_path[1]}]`)
                    .click()
                    .then(() => {
                        cy.wait_progress_completed();
                        if (wait_element) {
                            cy.wait_for(wait_element).should('be.visible');
                            cy.wait_progress_completed();
                        }
                    });
            });
        }
    });
});

Cypress.Commands.add('create_project', function(project_name) {
    if (typeof project_name == 'undefined') {
        project_name = 'Cypress UI test project [' + Cypress.moment() + ']';
    }

    let data = {
        name: project_name,
    };

    // Create and set the TEST_PROJECT using the REST API
    cy.create_entity('Project', data).then($project_id => {
        cy.log('Setting newly created project id to: ' + $project_id);
        Cypress.config('TEST_PROJECT', {
            name: project_name,
            id: $project_id,
        });
    });
});

Cypress.Commands.add('search_project', function(project_name) {
    // Search and set the TEST_PROJECT using the REST API
    let filters = [['name', 'is', project_name]];
    cy.search_entities('Project', filters).then($retValues => {
        assert.isTrue($retValues.data.length > 0, 'Project is found!!!');
        let project_id = $retValues.data[0].id;
        console.log(project_name + ' project id: ' + project_id);
        Cypress.config('TEST_PROJECT', {
            name: project_name,
            id: project_id,
        });
    });
});

Cypress.Commands.add('enter_project', function(project_name) {
    if (typeof project_name !== 'undefined') {
        cy.search_project(project_name);
    }

    cy.visit('/page/project_overview?project_id=' + Cypress.config('TEST_PROJECT').id);
    cy.wait_for_page_to_load();
});

Cypress.Commands.add('setup_existing_user', function(user_name, user_password, project_name) {
    /**
    This function will search a user an update those fields:
        - password_proxy
        - password_change_next_login
        - sg_status_list
        - welcome_page_visited
        - projects

    @PARAM user_name : provide user name
    @PARAM user_password : provide user password
    @PARAM project_name : provide project name that need to be linked with user
    */
    let data = {
        sg_status_list: 'act',
        welcome_page_visited: true,
    };

    if (typeof user_password !== 'undefined') {
        data.password_proxy = user_password;
        data.password_change_next_login = false;
        data.password_set = true;
    }

    if (typeof project_name !== 'undefined') {
        cy.search_project(project_name);
        data.projects = [{ type: 'Project', id: Cypress.config('TEST_PROJECT').id }];
    }

    let filters = [['login', 'is', user_name]];
    cy.search_entities('HumanUser', filters, ['projects']).then($retValues => {
        assert.isTrue($retValues.data.length > 0, '-- User is not found!!!');
        let user_id = $retValues.data[0].id;
        console.log('setup_user> username:' + user_name + ' user id: ' + user_id);
        cy.edit_entity('HumanUser', user_id, data);
        Cypress.config('TEST_USER', {
            name: user_name,
            id: user_id,
        });
    });
});

Cypress.Commands.add('add_test_users', function(project_id) {
    let users = {
        admin: Cypress.config('QA_SG_ADMIN'),
        artist: Cypress.config('QA_SG_ARTIST'),
        manager: Cypress.config('QA_SG_MANAGER'),
        vendor: Cypress.config('QA_SG_VENDOR'),
    };

    for (let key in users) {
        let filters = [['login', 'is', users[key]]];

        cy.search_entities('HumanUser', filters).then($retValues => {
            // create usuer if need be

            if ($retValues.data.length === 0) {
                let data = {
                    firstname: 'automation',
                    lastname: key,
                    email: Cypress.config('QA_SG_CLIENT_MAIL'),
                    login: 'automation.' + key,
                    password_proxy: Cypress.env('QA_SG_PSSWRD'),
                    password_set: true,
                    password_change_next_login: false,
                    projects: [{ type: 'Project', id: project_id }],
                    welcome_page_visited: true,
                };
                cy.search_entities('PermissionRuleSet', [['display_name', 'is', key]]).then($retValues => {
                    let permission = { type: 'PermissionRuleSet', id: $retValues.data[0].id };
                    data.permission_rule_set = permission;
                    // eslint-disable-next-line no-self-assign
                    cy.create_entity('HumanUser', (data = data));
                });
            } else {
                // Need to make sure all test users are linked to the test project
                cy.search_entities('HumanUser', filters, ['projects']).then($retValues => {
                    assert.isTrue($retValues.data.length > 0, '-- User is not found!!!');
                    let user_id = $retValues.data[0].id;
                    console.log('add_test_users> user id: ' + user_id);
                    if ($retValues.data[0].relationships.projects.data.length === 0) {
                        let data = { projects: [{ type: 'Project', id: project_id }] };
                        cy.edit_entity('HumanUser', user_id, data);
                    }
                });
            }
        });
    }
});
