// cy.find_user_by_login('login_value')
// returns id (number)
Cypress.Commands.add('find_user_id_by_login', function(login) {
    cy.get_rest_endpoint('/api/v1/entity/HumanUsers?fields=id&filter[login]=' + login).then(resp => {
        // console.log(JSON.stringify(resp.body.data, undefined, 2));
        if (resp.body.data) {
            return resp.body.data[0].id;
        } else {
            return false;
        }
    });
});

// cy.login_as_user
// does request-based login, but also handles the profile dialog introduced in [SG-11729]
Cypress.Commands.add('login_as_user', function(USER, page = '') {
    // declare user_id here so it can be set inside the promise scope
    let user_id;
    // Get the id of the user...
    cy.find_user_id_by_login(USER.login).then($id => {
        user_id = $id;
        cy.log('found user id', user_id);

        cy.clearCookies().then(() => {
            cy
                .request({
                    method: 'POST',
                    url: '/user/login',
                    form: true,
                    followRedirect: true, // turn on/off following redirects
                    body: {
                        'user[login]': USER.login,
                        'user[password]': USER.password,
                        ignore_browser_check: 1,
                    },
                })
                .then(resp => {
                    // Set your persistent session vars
                    let csrf_name = 'csrf_token_u' + user_id;
                    cy.getCookie(csrf_name).then(cookie => {
                        // store csrf_name cookie as a cypress config
                        Cypress.config(csrf_name, cookie.value);
                    });
                    cy.getCookie('_session_id').then(cookie => {
                        // store _session_id cookie as a cypress config
                        Cypress.config('_session_id', cookie.value);
                    });
                })
                .then(() => {
                    // Navigate to next page
                    cy.visit(page);
                    // Handle profile data dialog
                    cy.profile_data_page(page);
                });
        });
    });
});

/*
cy.reset_permission_group(permission_group)
- `permission_group`
  - Allowed values: ['artist', 'manager', 'admin']
  - Default: 'artist'
- Simulates a user clicking the 'Reset to Default' button from admin permissions page
- Returns: response object from POST request to /page/reset_permission_group
- Must have csrf token for this to work
*/
Cypress.Commands.add('reset_permission_group', function(permission_group = 'artist') {
    let url = '/page/reset_permission_group';
    let allowed_groups = ['manager', 'admin', 'artist'];
    if (!allowed_groups.includes(permission_group)) {
        return false;
    } else {
        // you're ok to reset
        cy.get_csrf_token_value().then(token => {
            cy.log(token);
            let default_group = permission_group + '_system_default';
            let data = {
                reset_permission_group_code: permission_group,
                copy_permission_group_code: default_group,
                csrf_token: token,
            };
            // Make the request
            cy
                .request({
                    url: url,
                    method: 'POST',
                    form: true,
                    body: data,
                    failOnStatusCode: false,
                })
                .then(resp => {
                    console.log(resp);
                });
        });
    }
});

/*
cy.configure_permissions(permission_changes)
- `permission_changes`
  - Type: Array
  - Example:
    [{
        permission_rule_set_code: 'manager',
        rule_type: 'see_client_notes',
         allow: true
     }]
*/
Cypress.Commands.add('configure_permissions', function(permission_changes = []) {
    cy.log('Trying to set permissions');
    let csrf = 'csrf_token_u' + Cypress.config('admin_id');
    cy.log('----------------------------------------');
    cy.log('Setting Permissions');
    cy.log('----------------------------------------');
    let url = 'page/set_permissions';

    //csrf_token: Cypress.config(csrf),
    let data = {
        permission_changes: permission_changes,
        csrf_token: Cypress.config(csrf),
    };
    // Stringify it...
    data.permission_changes = JSON.stringify(data.permission_changes);
    // Send the request
    cy
        .request({
            url: url,
            method: 'POST',
            form: true,
            body: data,
            failOnStatusCode: false,
        })
        .then($resp => {
            console.log($resp);
        });
});

// Custom inbox test suite setup
// used in integration/inbox_notifications_spec.js
Cypress.Commands.add('setup_inbox_suite', function() {
    // Global vars
    let PROJECT;
    Cypress.config('TEST_CLIENT', {
        password: '1fa60faD',
        email: 'client_' + Cypress.moment() + '@shotgunsoftware.com',
    });

    const SEP = '---------------------------------------------';

    cy.login_as('admin').then(() => {
        let asset_id, task_id, version_id, playlist_id, playlist_share_id, client_user_id;
        let p_name = 'Phantom Inbox Notifications ' + Cypress.moment();
        let data = {
            name: p_name,
            filters: [['name', 'is', p_name]],
            archived: false,
        };
        cy
            .conditionally_create('Project', data)
            .then(id => {
                // Set the Test Project's id
                Cypress.config('TEST_PROJECT', {
                    name: p_name,
                    id: id,
                });
                PROJECT = {
                    type: 'Project',
                    id: id,
                };
            })
            .then(() => {
                // Configure Manager to view Client notes
                let permissions = [
                    {
                        permission_rule_set_code: 'manager',
                        rule_type: 'see_client_notes',
                        allow: true,
                    },
                ];
                cy.configure_permissions(permissions);
            })
            .then(() => {
                // Ensure playlist shares require no auth
                cy.set_preference({
                    client_review_site_always_require_authentication: false,
                });
            })
            .then(() => {
                // Create your client user
                let data = {
                    name: 'Flint Dibble',
                    email: Cypress.config('TEST_CLIENT').email,
                };
                cy.create_entity('ClientUser', data).then(id => {
                    Cypress.config('TEST_CLIENT').id = id;
                    Cypress.config('TEST_CLIENT').name = data.name;
                    client_user_id = id;
                    // Persist the id for later testcases
                    cy.wrap(id).as('client_user_id');
                });
            })
            .then(() => {
                cy.log('----------------------------------------');
                cy.log('CREATING TEST ARTIST');
                cy.log('----------------------------------------');
                // Crate an artist linked to the TEST project
                let login = 'danger_' + Cypress.moment();
                let email = 'df' + Cypress.moment() + '@gmail.com';
                let data = {
                    name: 'Danger Fourpence',
                    email: email,
                    password_proxy: '1fa60faD',
                    login: login,
                    projects: [
                        {
                            type: 'Project',
                            id: Cypress.config('TEST_PROJECT').id,
                        },
                    ],
                    password_change_next_login: false,
                };
                cy.create_entity('HumanUser', data).then(id => {
                    data.id = id;
                    data.password = data.password_proxy;
                    Cypress.config('TEST_ARTIST', data);
                });
            })
            .then(() => {
                cy.log('----------------------------------------');
                cy.log('CREATING TEST MANAGER');
                cy.log('----------------------------------------');
                // Crate an artist linked to the TEST project
                let login = 'dick_' + Cypress.moment();
                let email = 'dick' + Cypress.moment() + '@gmail.com';
                let data = {
                    name: 'Dick Trickle',
                    email: email,
                    permission_rule_set: {
                        type: 'PermissionRuleSet',
                        id: 7,
                    },
                    password_proxy: '1fa60faD',
                    login: login,
                    password_change_next_login: false,
                    projects: [
                        {
                            type: 'Project',
                            id: Cypress.config('TEST_PROJECT').id,
                        },
                    ],
                };
                cy.create_entity('HumanUser', data).then(id => {
                    data.id = id;
                    data.password = data.password_proxy;
                    Cypress.config('TEST_MANAGER', data);
                });
            })
            .then(() => {
                // Create an asset
                cy
                    .create_entity('Asset', {
                        code: 'Test Asset',
                        project: PROJECT,
                    })
                    .then(id => {
                        asset_id = id;
                        // Persist the id for later testcases
                        cy.wrap(id).as('asset_id');
                    });
            })
            .then(() => {
                // Create a task on the asset assigned to the Artist
                let data = {
                    content: 'Artist Task on Asset',
                    entity: {
                        type: 'Asset',
                        id: asset_id,
                    },
                    project: {
                        type: 'Project',
                        id: Cypress.config('TEST_PROJECT').id,
                    },
                    task_assignees: [
                        {
                            type: 'HumanUser',
                            id: Cypress.config('TEST_ARTIST').id,
                        },
                        {
                            type: 'HumanUser',
                            id: Cypress.config('TEST_MANAGER').id,
                        },
                    ],
                };
                cy.create_entity('Task', data).then(id => {
                    task_id = id;
                    // Persist the id for later testcases
                    cy.wrap(id).as('task_id');
                });
            })
            .then(() => {
                // Create a version linked to the asset
                // Also set the version's Task set to the Artist's Task
                let data = {
                    code: 'Phantom Inbox Version',
                    entity: {
                        type: 'Asset',
                        id: asset_id,
                    },
                    sg_task: {
                        type: 'Task',
                        id: task_id,
                    },
                    project: {
                        type: 'Project',
                        id: Cypress.config('TEST_PROJECT').id,
                    },
                };
                cy.create_entity('Version', data).then(id => {
                    version_id = id;
                    // Persist the id for later testcases
                    cy.wrap(id).as('version_id');
                });
            })
            .then(() => {
                // Create a Playlist containing the Version
                // version_id = 6950;
                let data = {
                    code: 'Phantom Playlist',
                    project: {
                        type: 'Project',
                        id: Cypress.config('TEST_PROJECT').id,
                    },
                    versions: [
                        {
                            type: 'Version',
                            id: version_id,
                        },
                    ],
                };
                cy.create_entity('Playlist', data).then(id => {
                    playlist_id = id;
                    // Persist the id for later testcases
                    cy.wrap(id).as('playlist_id');
                });
            })
            .then(() => {
                // Create a PlaylistShare for the Client
                data = {
                    email_message: 'Playlist Share for Phantom Inbox test',
                    playlist: {
                        type: 'Playlist',
                        id: playlist_id,
                    },
                    user: {
                        type: 'ClientUser',
                        id: Cypress.config('TEST_CLIENT').id,
                    },
                    require_user_authentication: false,
                };
                cy.create_entity('PlaylistShare', data).then(id => {
                    playlist_share_id = id;
                    // Persist the id for later testcases
                    cy.wrap(id).as('playlist_share_id');
                });
            })
            .then(() => {
                let fields = [
                    'require_user_authentication',
                    'id',
                    'allow_download_source_file',
                    'can_see_notes',
                    'user',
                    'expiry_period',
                    'access_key',
                    'downloaded_media',
                    'email_message',
                    'group_id',
                    'expiry_count',
                ];
                // Get the Access key for the PlaylistShare
                cy.get_entity('PlaylistShare', playlist_share_id, fields).then($resp => {
                    // Set this for later
                    Cypress.config('PLAYLIST_SHARE', $resp);
                });
            });
    });
});

Cypress.Commands.add('login_as_client', function(client_id, access_key) {
    // cy.log('Client id', client_id);
    cy.log('----------------------------------------');
    cy.log('client_id', client_id);
    cy.log('access_key', access_key);
    cy.log('----------------------------------------');
    // /client_review_site?share=Dpp5uhijF9eolw
    cy.clearCookies().then(() => {
        cy.request('/client_review_site?share=' + access_key).then($resp => {
            cy.getCookie('csrf_token_u' + client_id).then(cookie => {
                Cypress.config('client_csrf_token', cookie.value);
            });
        });
    });
});

Cypress.Commands.add('create_client_note', function(options) {
    let data = {
        subject: options.subject,
        content: options.content,
        client_approved: options.client_approved,
        version_id: options.version_id,
        share: options.share,
        csrf_token: Cypress.config('client_csrf_token'),
    };
    cy
        .request({
            url: '/client_review_site/create_note',
            method: 'POST',
            form: true,
            body: data,
        })
        .its('status')
        .should('eq', 200)
        .then($resp => {
            console.log(JSON.stringify($resp, undefined, 2));
        });
});

Cypress.Commands.add('get_page_id', function(page) {
    let url = '/api/v1/entity/pages?fields=*&';
    switch (page) {
        case 'Permissions - People':
        case 'permissions':
            url += 'filter[name]=Permissions - People&filter[page_type]=permissions';
            break;
        case 'Inbox':
            url += 'filter[name]=Inbox&filter[page_type]=inbox';
            break;
        default:
            url += 'filter[name]=Projects';
            break;
    }
    cy.get_rest_endpoint(url, 'GET').then($resp => {
        // console.log(JSON.stringify($resp.body.data, undefined, 2));
        let id = $resp.body.data[0].id;
        return id;
    });
});

// dismiss the profile_data page if necessary
Cypress.Commands.add('profile_data_page', (next_page = '') => {
    // / Get the current url
    cy.url().then(resp => {
        if (resp.includes('profile_data')) {
            // You are looking at the profile_data page (forced redirect)
            // Handle the dialog by making a selection, and clicking Accept
            cy.get('[id="profileDataRoleSelect"]').should('be.visible');
            cy.get('[id="profileDataRoleDeclineButton"]').click();

            if (next_page !== '') {
                cy.navigate_to_page(next_page);
            } else {
                cy.url().should('not.contains', '/profile_data');
            }
        }
    });
});

Cypress.Commands.add('get_page_root_widget', () => {
    cy.get_SG().then($sg => {
        return $sg.globals.page.root_widget;
    });
});

Cypress.Commands.add('wait_for_updates_to_be_fetched', () => {
    cy.get_page_root_widget().then($wg => {
        cy.wrap($wg.inbox_contents).invoke('is_fetching').should('eq', false);
    });
});
