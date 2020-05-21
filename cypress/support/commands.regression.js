const name_slug = String(Number(Cypress.moment()));

Cypress.Commands.add('batch_create_entities', function(options) {
    /*
        entity_type, total_entities, identifier_field
    */
    let payload = {
        requests: [],
    };
    let request;
    for (var i = 0; i < options.total_entities; i++) {
        request = {
            entity: options.entity_type,
            request_type: 'create',
            data: {
                project: {
                    type: 'Project',
                    id: Cypress.config('TEST_PROJECT').id,
                },
            },
        };
        let slug = options.hasOwnProperty('slug') ? options.slug : options.entity_type;
        // Set the identifier field (which may vary)
        request.data[options.identifier_field] = slug + ' ' + (i + 1);
        // Set any other Fields
        for (var fld in options.fields) {
            request.data[fld] = options.fields[fld];
        }
        payload.requests.push(request);
    }
    cy.batch_request(payload).then($retValue => {
        assert.isTrue($retValue.status == 200, 'Batch create returned 200 status.');
        return $retValue;
    });
});

Cypress.Commands.add('check_version', function(version_id, retries = 5) {
    let sel = 'td[record_id=' + version_id + '][field="image"]';
    let is_ready = false;
    this.attempts++;

    cy.get(sel).then(td => {
        // The version is ready only if the td doesn't have .no_overlay class
        is_ready = td.hasClass('no_overlay') == false;
        if (is_ready !== true && retries > 0) {
            // try again ...
            cy.log('------------------------------------------');
            cy.log('Attempt ' + this.attempts + ' - Trying again');
            cy.log('------------------------------------------');
            cy.refresh_grid().then(() => {
                cy.wait(2000);
                cy.check_version(version_id, retries - 1);
            });
        } else if (is_ready == true) {
            cy.log('------------------------------------------');
            cy.log('Attempt ' + this.attempts + ' - Got it!');
            cy.log('------------------------------------------').then(() => {
                // return true;
                return true;
            });
        } else {
            cy.log('------------------------------------------');
            cy.log('Version Thumbnail still not available!');
            cy.log('Reloading page!');
            cy.log('------------------------------------------').then(() => {
                return false;
            });
        }
    });
});


Cypress.Commands.add('edit_asset_in_grid', function(field) {
    // Expect the following...
    // field.field_name, field.record_id, field.new_value
    cy.get('td[field="' + field.field_name + '"][record_id="' + field.record_id + '"] div.sg_cell_edit_link').click({
        force: true,
    });
    cy.window().its('SG.globals.active_editor').should('exist');
    // Make the edit...
    cy.get('div.entity_editor textarea:first').type(field.new_value + '{enter}');
});

Cypress.Commands.add('enter_design_mode', function() {
    // Click Design mode
    cy.get('div[sg_selector="button:page_menu"]').click();
    // Click 'Design Page'
    cy.get('div.sg_menu_body:visible span[sg_selector="menu:design_page"]').click();
});

Cypress.Commands.add('exit_design_mode', function() {
    // Click the first instance of a cancel button
    cy.get('div.sgc_canvas_designer_header [sg_selector="button:cancel"]:first').click();
});

Cypress.Commands.add('get_page_mode', function() {
    cy.get_page().then(page => {
        return page.get_mode();
    });
});

Cypress.Commands.add('prep_regression_spec', function({
    create_project=true,
    project_name=`Regression Suite Project ${name_slug}`
} = { }) {

    cy.log(`'Prepping Regression Spec\nbaseUrl set to: ${Cypress.config('baseUrl')}`)
    cy.get_access_token();
    cy.set_network_routes();
    cy.login_admin().then(() => {
        /* Ensure these changes to admin user
        - Remove all stupid app welcome dialogs
        - Language setting is English
        */
        let data = {
            app_welcomes: [],
            language: 'en',
        };
        // Remove any app welcomes for the admin user, and set language to English 
        cy.edit_entity('HumanUser', Cypress.config('admin_id'), data);

        if (create_project) {
            // Create the project that will be your test project
            cy.create_entity('Project', {
                name: project_name,
                layout_project: {type:'Project', id: Cypress.config('TEST_PROJECT').id}
            }).then(id => {
                Cypress.config('TEST_PROJECT', { id: id });
                cy.log('-'.repeat(50));
                cy.log(`Just created test project ${project_name} with id=${id}`);
                cy.log('-'.repeat(50));
            });
        }
    });
});

Cypress.Commands.add('set_field_in_new_entity_form', function(props = {}) {
    cy.get('.sg_new_entity_form').within($form => {
        // Click into the field name by system name...
        cy.get('[sg_selector="input:' + props.field_name + '"]').click({
            force: true,
        });

        cy.get('div.entity_editor').then($editor => {
            if (props.field_type && ['list'].includes(props.field_type)) {
                cy.get('span.sg_menu_item_content:contains("' + props.field_value + '")').find('span').click();
            } else {
                // type input
                cy.wrap($editor).find('textarea,input').type(props.field_value);
            }
        });
    });
});

Cypress.Commands.add('set_theme', function(theme) {
    // Ensure the theme is light or dark
    theme = theme !== 'light' && theme !== 'dark' ? 'light' : theme;
    // Get the SG object
    cy.get_SG().then(SG => {
        // Get the current theme...
        let current_theme = SG.util.ThemeSwitcher.get_current_ui_theme();
        if (current_theme !== theme) {
            SG.util.ThemeSwitcher.set_ui_theme_preference(theme, this);
        }
    });
    // Assert that the theme really is set properly...
    cy.window().its('SG.util.ThemeSwitcher').invoke('get_current_ui_theme').should('eq', theme);
});

Cypress.Commands.add('upload_version', function(options) {
    let curl =
        'curl -F entity_type=' +
        options.entity_type +
        ' -F entity_id=' +
        options.entity_id +
        ' ' +
        '-F field_name=' +
        options.field_name +
        ' ' +
        '-F user_login=' +
        Cypress.config('admin_login') +
        ' ' +
        '-F user_password=' +
        Cypress.config('admin_pwd') +
        ' ' +
        '-F file=@' +
        options.file_name +
        ' ' +
        Cypress.config('baseUrl') +
        '/upload/api2_upload_file';

    // Execute the curl request and print the output
    cy.exec(curl).then($out => {
        console.log($out.stdout);
    });
});

Cypress.Commands.add('wait_for_overlay_spinner', function() {
    cy.wait(500);
    cy.get('[sg_selector="canvas:loading_indicator"]').should('not.be.visible');
    cy.wait(500);
});

Cypress.Commands.add('select_row_by_id', function(id) {
    // Note, this assumes your page is in list mode
    // use :first because with grouping applied, this selector could appear multiple times
    cy.get(`.row_selector[sg_selector="row_selector:record_id_${id}"]:first label`).click({ force: true });
});

Cypress.Commands.add('enable_versions_for_entities', function(entity_types) {
    cy.get_preference('has_versions').then(pref => {
        // Convert to an array - handle the possibility of an empty preference
        let version_entities = pref === {} ? [] : pref.has_versions.split(',');
        for (var i = 0; i < entity_types.length; i++) {
            let this_entity = entity_types[i];
            if (!version_entities.includes[this_entity]) {
                version_entities.push(this_entity);
            }
        }
        cy.log(`String pref... ${version_entities.join(',')}`);
        // Set the pref
        cy
            .set_preference({
                has_versions: version_entities.join(','),
            })
            .then(() => {
                cy.log(`Versions enabled for: ${entity_types.join(',')}`);
            });
    });
});

Cypress.Commands.add('login_artist', function() {
    // Create an Artist named 'Cypress Artist'
    let data = {
        name: 'Cypress Artist',
        email: `cypress_artist${name_slug}@gmail.com`,
        password_proxy: '1fa60faD',
        login: `cypress_artist_${name_slug}`,
        projects: [
            {
                type: 'Project',
                id: Cypress.config('TEST_PROJECT').id,
            },
        ],
        password_change_next_login: false,
    };

    // Create the artist
    cy.create_entity('HumanUser', data).then(id => {
        cy.log('user has id ' + id);
        data.id = id;
        data.password = data.password_proxy;
        // Create a note directly to this test artist 
        cy.create_entity('Note', {
            subject: 'Note to artist',
            content: 'Hey!',
            project: {type:'Project', id: Cypress.config('TEST_PROJECT').id},
            addressings_to: [{type:'HumanUser', id: data.id}]
        });


        // Store the test artist 
        Cypress.config('TEST_ARTIST', data);
        cy.log('Trying to login as test artist now...');
        // Now login
        cy.logout();
        cy.uiSignIn(data.login, data.password);
    });
});

Cypress.Commands.add('enable_event_pipeline_emails', function() {
    // 4 PARTS...MUST BE DONE IN ORDER!!
    // 1. Set Event Service URL to 'https://events.dev.shotgunsoftware.com/'
    cy.set_preference({ event_service_url: 'https://events.dev.shotgunsoftware.com/' });

    // 2. Set Feature => Enable Event Pipeline to 'Yes'
    cy.set_preference({ enable_event_pipeline: 'yes' });

    // 3. Set Hidden => Enable Email Service by Event Pipelin to 'Yes'
    cy.set_preference({ enable_email_by_event_pipeline: 'yes' });

    // 4. Set Feature => Enable Webhooks APP to 'Yes'
    cy.set_preference({ enable_webhooks_app: 'yes' });
});
