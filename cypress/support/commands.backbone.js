let snake = require('to-snake-case');

/* ----------------------------------------------------------------------
Field creation, deletion, delete forever
---------------------------------------------------------------------- *
/**
 * @function get_field
 * @returns {Object} REST api repsonse from a schema GET request.
 * @description Gets a field using a REST api endpoint call to `/api/1/schema/{entity_type}/fields/{system_field_name}`.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {String} system_field_name - The system name of the display column (eg: sg_status_list).
 *
 * @example
 * cy.get_field('Shot', 'sg_qa_number').then(resp => {
 *    assert.isTrue(resp.body.data.data_type.value !== 'text');
 * })
 *
 */
Cypress.Commands.add('get_field', function(entity_type, system_field_name) {
    let endpoint = '/api/v1/schema/' + entity_type + '/fields/' + system_field_name;
    cy.get_rest_endpoint(endpoint, 'GET', false).then($resp => {
        return $resp;
    });
});

/**
 * @function field_exists
 * @returns {Boolean}
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 * @description Returns whether or not a given field exists for a given entity type.
 * @param {String} entity_type - The CamelCase entity type.
 * @param {String} system_field_name - The system field name.
 *
 * @example
 * cy.field_exists('Task', 'sg_qa_currency').then(exists => {
 *    assert.isTrue(exists);
 * })
 *
 */
Cypress.Commands.add('field_exists', function(entity_type, system_field_name) {
    let endpoint = '/api/v1/schema/' + entity_type + '/fields/' + system_field_name;
    cy.get_field(entity_type, system_field_name).then($resp => {
        return $resp.status == 200;
    });
});

/**
 * @function create_field
 *
 * @description Creates a field using the REST API. Returns the REST api response from the POST request used to create the field. Important to note: **this method cannot be used to create a query field**. See {@link create_query_field}.
 *
 * @returns {Object}
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The entity type.
 * @param {String} data_type - The data type of the field to create
 * @param {Array} properties - A list of key/value pairs
 *
 * @example <caption>Calculated Field</caption>
 * // Create a calculated field via the REST api
 * let entity_type = 'Task';
 * let data_type = 'calculated';
 * let properties = [
 *     {
 *         property_name: 'name',
 *         value: 'Cypress Calculated field',
 *     },
 *     {
 *         property_name: 'calculated_function',
 *         value: 'CONCAT("Cypress ✔★♛ - id ^2=", {id}*{id}*{id}*{id})',
 *     },
 * ];
 * cy.create_field(entity_type, data_type, properties).then($resp => {
 *     console.log(JSON.stringify($resp, undefined, 2));
 * });
 */

Cypress.Commands.add('create_field', function(entity_type, data_type, properties = []) {
    //This will create a field of type...
    let allowed_types = [
        'calculated',
        'checkbox',
        'currency',
        'date',
        'date_time',
        'duration',
        'url',
        'float',
        'footage',
        'list',
        'number',
        'percent',
        'text',
    ];
    if (!allowed_types.includes(data_type)) {
        return {
            success: false,
            reason: data_type + ' not in allowed types',
        };
    } else {
        let endpoint = '/api/v1/schema/' + entity_type + '/fields';
        let failOnStatusCode;
        //Set up the params for the post request
        let data = {
            data_type: data_type,
            properties: properties,
        };
        // eslint-disable-next-line no-self-assign
        cy.get_rest_endpoint(endpoint, 'POST', (failOnStatusCode = true), (data = data)).then($resp => {
            // Extract the system name
            let r = new RegExp('/api/v1/schema/' + entity_type + '/fields/', 'i');
            let self = $resp.body.links.self;
            let system_name = self.replace(r, '');
            console.log('system_name', system_name);
            return $resp;
        });
    }
});

//
// returns the REST API response

/**
 * @function delete_field
 * @description Deletes a field (not permanently). Returns the REST api response from the `DELETE` call.
 * @returns {Object}
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {String} system_field_name - The system field name.
 * @param {Boolean} delete_forever=false - Whether or not to additionally call `cy.delete_field_forever()`.
 *
 *
 * @example
 * cy.delete_field('Task','sg_qa_currency');
 *
 */
Cypress.Commands.add('delete_field', function(entity_type, system_field_name, delete_forever = false) {
    let endpoint = '/api/v1/schema/' + entity_type + '/fields/' + system_field_name;

    // First, find out if the field exists
    cy.field_exists(entity_type, system_field_name).then(exists => {
        if (exists == true) {
            // Go ahead and delete the field...
            cy
                .get_rest_endpoint(endpoint, 'DELETE', true)
                .then($resp => {
                    console.log(JSON.stringify($resp, undefined, 2));
                    // You should get a 204 response from this operation
                })
                .then(() => {
                    // If delete_forever == true, delete it forever
                    if (delete_forever == true) {
                        cy.delete_field_forever(entity_type + '.' + system_field_name);
                    }
                });
        } else {
            // If delete_forever == true, delete it forever
            if (delete_forever == true) {
                cy.delete_field_forever(entity_type + '.' + system_field_name);
            }
        }
    });
});

/* cy.delete_field_forever()
  Deletes a field forever - optionally forever if an addtional arg == true.
  Expects a string of field names like: '["Shot.sg_single_rec_1538939714464"]'
*/
Cypress.Commands.add('delete_field_forever', function(field_names) {
    let url = '/background_job/delete_columns_forever';
    let csrf = 'csrf_token_u' + Cypress.config('admin_id');
    let data = {
        fields: field_names,
        csrf_token: Cypress.config(csrf),
    };
    // Send the request
    cy.request({
        url: url,
        method: 'POST',
        form: true,
        body: data,
        failOnStatusCode: false,
    });
});


/* ----------------------------------------------------------------------
Private API Endpoint Functions
---------------------------------------------------------------------- */
// cy.get_private_api_endpoint(url, {options})
// Sends a request to a private endpoint url, and sends back the response
Cypress.Commands.add('get_private_api_endpoint', function(
    url,
    options = {
        method: 'GET',
        failOnStatusCode: true,
        data: {},
        content_type: 'application/json',
        response_content_type: '',
    }
) {
    // This method accepts an url and method, and returns the REST response
    let request_headers = {
        Authorization: 'Bearer ' + Cypress.config('TOKEN').body.access_token,
        'content-type': options.response_content_type,
        'Shotgun-Private-Api': 'assignment',
    };

    if (options.response_content_type != '') {
        request_headers.accept = options.response_content_type;
    }
    // console.log("data passed in..." + data.toString())
    cy
        .request({
            method: options.method,
            url: url,
            headers: request_headers,
            body: options.data,
            failOnStatusCode: options.failOnStatusCode,
            followRedirect: false,
        })
        .then(resp => {
            return resp;
        });
}); // end cy.get_private_api_endpoint

// cy.configure(set_thumbnail_mode)
// Expects 1 of: manual, latest, or query
// Sets the Task thumbnail mode to either: manual, latest version or note, or query
// You must be logged in as a HumanUser, and have a valid csrf token for this to work

/**
 * @function set_task_thumbnail_render_mode
 * @description Configures the render mode of Task.image to one of 3 possible values:
 * <ol>
 * <li>manual</li>
 * <li>latest</li>
 * <li>query</li>
 * </ol>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} config=manual - The render mode. Must be one of the allowed values.
 *
 * @returns Returns this...
 *
 * @example
 * // Configure for manual Uploads
 * cy.set_task_thumbnail_render_mode('manual');
 *
 * // Latest Version or Note
 * cy.set_task_thumbnail_render_mode('latest');
 *
 * // Query-based (uses the default query)
 * cy.set_task_thumbnail_render_mode('query');
 *
 */
Cypress.Commands.add('set_task_thumbnail_render_mode', function(config) {
    let csrf = 'csrf_token_u' + Cypress.config('admin_id');
    let url = '/background_job/configure_dc';
    let configs = ['manual', 'latest', 'query'];
    if (!configs.includes(config)) {
        config = 'manual';
    }
    // Choose a config
    cy.fixture('task_render_modes/config_' + config + '.json').then(config_json => {
        let data = {
            csrf_token: Cypress.config(csrf),
            dialog_params: JSON.stringify(config_json),
        };
        cy
            .request({
                url: url,
                method: 'POST',
                form: true,
                body: data,
                failOnStatusCode: false,
            })
            .then($resp => {
                console.log(JSON.stringify($resp, undefined, 2));
            });
    });
});

// cy.clear_thumbnail(entity_type, id)
// Sets the thumbnail of a specific entity to null by making a REST api request on the entity's `image` field. Returns the REST api response object. Dispatches a 1000 ms wait after the response is returned so that the UI can catch up to the server.
/**
 * @function clear_thumbnail
 * @description Sets the thumbnail for a particular entity (by type and id) to `null`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type
 * @param {Number} id - The id of the entity.
 *
 * @returns {Object}}
 *
 * @example
 * // Clear out Asset 1167's thumbnail
 * cy.clear_thumbnail('Asset', 1167);
 *
 */
Cypress.Commands.add('clear_thumbnail', function(entity_type, id) {
    cy
        .edit_entity(entity_type, id, {
            image: null,
        })
        .then($resp => {
            // Wait just a moment before resolving
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(1000);
        });
});

/**
 * @function stow_gantt
 * @description Hides the gantt pane (if it is visible). Assumes the page is either in list mode (for Tasks) or schedule mode (for entities that support Tasks).
 *
 * Also see {@link unstow_gantt cy.unstow_gantt()}.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Assumes the page of tasks is in list mode
 * cy.stow_gantt();
 *
 */
Cypress.Commands.add('stow_gantt', function() {
    // Assume you are in list or schedule mode
    cy.get_page().then(page => {
        page.get_child_widgets()[0].stow_away_gantt();
    });
});

/**
 * @function unstow_gantt
 * @description Reveals the gantt pane (if it is currently stowed). Assumes the page is either in list mode (for Tasks) or schedule mode (for entities that support Tasks).
 *
 * Also see {@link stow_gantt cy.stow_gantt()}.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Assumes the page of tasks is in list mode
 * cy.unstow_gantt();
 *
 */
Cypress.Commands.add('unstow_gantt', function() {
    // Assume you are in list or schedule mode
    cy.get_page().then(page => {
        page.get_child_widgets()[0].unstow_away_gantt();
    });
});



/* ----------------------------------------------------------------------
Preferences
---------------------------------------------------------------------- */
/**
 * @function get_prefs_page_id
 * @description Returns the id of the Site Preferences page by calling this REST api endpoint: `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[page_type]=site_prefs`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @returns {Number}
 *
 * @example
 * // Navigate to the hidden prefs page without knowing the ID in advance
 * cy.get_prefs_page_id().then(id => {
 *     cy.navigate_to_page(`/page/${id}?hidden_prefs_visible`);
 * })
 *
 */
Cypress.Commands.add('get_prefs_page_id', function() {
    let url = '/api/v1/entity/pages?fields=name,page_type&sort=name&filter[page_type]=site_prefs';
    cy.get_rest_endpoint(url, 'GET').then($resp => {
        let id = $resp.body.data[0].id;
        return id;
    });
});

/**
 * @function get_page_id_by_name
 * @description Returns the id of a page by name by calling this REST api endpoint: `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[name]=${page_name}`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @returns {Number}
 *
 * @example <caption>Navigate to common page URL's without knowing their ID</caption>
 * // My Tasks
 * cy.get_page_id_by_name('My Tasks').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 * // Global People Page
 * cy.get_page_id_by_name('People').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 * // Permissions - People
 * cy.get_page_id_by_name('Permissions - People').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 * // Inbox
 * cy.get_page_id_by_name('Inbox').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 */
Cypress.Commands.add('get_page_id_by_name', function(page_name) {
    let url = `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[name]=${page_name}`;
    cy.get_rest_endpoint(url, 'GET').then($resp => {
        return $resp.body.data[0].id;
    });
});

/**
 * @function get_preference
 * @description Gets 1 or more preferences by `pref_key`, and returns the result. Does this by making a GET request to `preferences/get_prefs?_dc=`. This command is aliased by `cy.get_preferences` (plural).
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Array|String} pref_list - 1 or more prefs by pref_key. See below for examples.
 *
 * @returns {Object}
 *
 * @example <caption>Get 1 preference at a time</caption>
 * // Get s3_primary_bucket
 * cy.get_preference('s3_primary_bucket').then(pref => {
 *    // Now you have an object
 *    assert.isTrue(pref.s3_primary_bucket !== '', 'Pref value is not empty string');
 * });
 *
 * // Get enable_new_exporter
 * cy.get_preference('enable_new_exporter').then(pref => {
 *    expect(pref.enable_new_exporter).to.be.oneOf(['yes', true])
 * });
 *
 * @example <caption> 2 or more Prefs</caption>
 * // Get a list of prefs
 * cy.get_preference(['s3_primary_bucket', 'enable_new_exporter']).then(pref => {
 *    console.log(JSON.stringify(pref, undefined, 2));
 * });
 *
 * // logs this...
 * {
 *    "enable_new_exporter": "yes",
 *    "s3_primary_bucket": "U.S.: Oregon (local)"
 * }
 *
 */
Cypress.Commands.add('get_preference', function(pref_list = []) {
    cy.request('preferences/get_prefs?_dc=' + Cypress.moment()).then($resp => {
        let all_prefs = $resp.body.prefs;
        let new_prefs = {};
        // Does the user want all prefs?
        switch (pref_list) {
            case 'all':
            case true:
                return all_prefs;

            default:
                Cypress._.filter(all_prefs, function(obj, key) {
                    // console.log(key);
                    if (pref_list.includes(key)) {
                        new_prefs[key] = obj.value;
                        return obj;
                    }
                });
                return new_prefs;
        }
    });
});

/**
 * @function get_preferences
 * @description - An alias for {@link get_preference cy.get_preference()}.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 */
Cypress.Commands.add('get_preferences', cy.get_preference);

/**
 * @function set_preference
 * @description Sets 1 or more preferences by `pref_key`, then reloads the schema - all with xhr requests. This command is aliased by `cy.set_preferences` (plural).
 * <ul>
 * <li>No UI is required, but {@link login_as the user must be logged in}</li>
 * <li>If invalid `pref_keys` are passed in, this command will not fail, but obviously, non-existent prefs will not be set</li>
 * <li>Returns the response object of the request made to `page/reload_schema?_dc=`</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Object} values - A JSON object of key value pairs, using the `pref_key` names as keys.
 *
 * @returns {Object}
 *
 * @example <caption>Set 1 pref</caption>
 * // Turn on the enable_new_exporter feature
 * cy.set_preference({enable_new_exporter: 'yes'});
 *
 * @example <caption>Set multiple prefs</caption>
 * // Enable Chinese, and set it as the language
 * cy.set_preference({
 *    enable_zh_hans_translation: 'yes',
 *    language: 'zh-hans',
 * });
 */
Cypress.Commands.add('set_preference', function(values = {}) {
    if (typeof values !== 'object' || values == {}) {
        console.log('RETURN FALSE');
        return false;
    } else {
        // Go ahead and update the prefs
        let csrf = 'csrf_token_u' + Cypress.config('admin_id');
        let a = Cypress.moment();
        let url = 'preferences/update_prefs';
        let key;
        // Put the values into the data object
        let data = values;
        data['pref_type'] = 'site';
        (data['csrf_token'] = Cypress.config(csrf)), cy
            .request({
                method: 'POST',
                url: url,
                form: true,
                body: data,
            })
            .then($r1 => {
                // Now do the follow up requests to reload the schema
                let b = Cypress.moment();
                console.log(b - a);
                // return $r1; // At this point, execution time is 93ms
                // Everything after this point may only be necessary in the UI, but let's do it to be safe
                let m = Cypress.moment();
                cy.request('preferences/get_prefs?_dc=' + m, 'GET').then($keys => {
                    // console.log(JSON.stringify($keys.body.prefs[key], undefined, 2));
                    cy.request('page/reload_schema?_dc=' + m, 'GET').then($resp => {
                        let c = Cypress.moment();
                        console.log('Time taken to set prefs: ' + String(c - a));
                        return $resp;
                    });
                });
            });
    }
});

/**
 * @function set_preferences
 * @description - An alias for {@link set_preference cy.set_preference()}.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 */
Cypress.Commands.add('set_preferences', cy.set_preference);

/**
 * Set preference only if needed.
 * Minimal operations.
 */
Cypress.Commands.add('update_preference', ({ name, value, data, type = 'site' }) => {
    // Logged in check
    let config = Cypress.config();
    let csrfToken = config[`csrf_token_u${config.admin_id}`];
    if (!csrfToken) {
        throw new Error('[update_preference] Must be logged in before invoking');
    }
    if (!data) {
        if (!name) {
            throw new Error('[update_preference] Must be provided a name');
        }
        if (!value) {
            throw new Error('[update_preference] Must be provided a value');
        }

        data = { [name]: value };
    }

    if (!data) {
        throw new Error('[update_preference] Must be provided data');
    }

    cy.request('GET', '/preferences/get_prefs', { timeout: 50000 }).then(response => {
        let prefs = response.body.prefs;
        let errorNames = [];
        let isDifferent = false;
        for (let name in data) {
            let inputValue = data[name];
            let pref = prefs[name];
            if (!(name in prefs)) {
                errorNames.push(name);
                continue;
            }

            let currentValue = pref.value || pref.default_value;
            if (currentValue !== inputValue) {
                isDifferent = true;
                break;
            }
        }

        if (errorNames.length) {
            throw new Error(`[update_preference] Preference non-existent name: ${errorNames.join(', ')}`);
        }

        // Write needed check.
        if (!isDifferent) {
            return;
        }

        cy
            .request({
                method: 'POST',
                url: '/preferences/update_prefs',
                form: true,
                body: {
                    ...data,
                    pref_type: type,
                    csrf_token: csrfToken,
                },
            })
            .then(() => {
                cy.log(`Preference type ${type}: Set ${JSON.stringify(data)}`);
            });
    });
});

/**
 * @function disable_custom_entity
 * @description Disables a custom entity by making a call to `cy.set_preference()` and passing in a `pref_key` built from entity_type in the following way:
 * ```
 * let pref = 'use_' + SG.schema.entity_types[entity_type].name_pluralized_underscored;
 * cy.set_preference({pref: 'no'});
 * ```
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type of the entity to disable.
 *
 * @returns {Object}
 *
 * @example <caption>Simple</caption>
 * cy.disable_custom_entity('CustomEntity05');
 *
 */
Cypress.Commands.add('disable_custom_entity', function(entity_type) {
    cy.get_SG().then(SG => {
        let pref = 'use_' + SG.schema.entity_types[entity_type].name_pluralized_underscored;
        cy.log('Attempting to disable ' + entity_type);
        let values = {};
        values[pref] = 'no';
        cy.set_preference(values);
    });
});

// Expects a string containing the pref key header of the section
/**
 * @function expand_pref_section
 * @description Scrolls down to and expands a pref section, using the display name of the accordion (eg: `Feature Prefernces`). You must be logged in, and currently on the prefs page for this to work.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} section - The name that is displayed on the pref header accordion.
 *
 * @example
 * cy.expand_pref_section('Feature Preferences');
 *
 */
Cypress.Commands.add('expand_pref_section', function(section) {
    if (Cypress.$('div.opener[open_key="' + section + '"]').length > 0) {
        cy.get('div.opener[open_key="' + section + '"]').scrollIntoView().click();
    }
});

/* ----------------------------------------------------------------------
Utility functions
---------------------------------------------------------------------- */

Cypress.Commands.add('get_snake_case', function(item) {
    return snake(item);
});

// cy.get_SG()
// returns the top-level SG object on all Shotgun pages
// Must be logged in to the web app, on a page, for this to work
Cypress.Commands.add('get_SG', function() {
    cy.window().then($win => {
        let SG = $win.SG;
        return SG;
    });
});

// cy.is_logged_in()
// returns true or false - whether
Cypress.Commands.add('is_logged_in', function() {
    cy.get_SG().then(SG => {
        try {
            return SG.globals.current_user.id > 0;
        } catch (err) {
            return false;
        }
    });
});

// cy.get_random_int(5, 50);
// Returns a random int between 5 and 50
Cypress.Commands.add('get_random_int', function(min, max) {
    // Returns a random integer between min and max
    let n = Math.floor(Math.random() * (max - min + 1)) + min;
    return n;
});

// cy.get_session_uuid()
// Returns the string containing the current user's session_uuid
Cypress.Commands.add('get_session_uuid', function() {
    cy.get_SG().then(SG => {
        return SG.globals.session_uuid;
    });
});

// cy.get_csrf_token_name()
// Returns the name of the user-based cookie. Example: csrf_token_u42
Cypress.Commands.add('get_csrf_token_name', function() {
    return 'csrf_token_u' + Cypress.config('admin_id');
});

// cy.get_csrf_token_value('crsf_token_u42')
// Expects a string with the name of the user-based csrf cookie
// Returns the VALUE of the user-based csrf cookie
Cypress.Commands.add('get_csrf_token_value', function() {
    cy.get_csrf_token_name().then(csrf => {
        console.log(csrf);
        return Cypress.config(csrf);
    });
});

// cy.confirm_progress_indicator()
// Returns the result of an assertion
// You must be logged in to the web app, on a page for this to work
Cypress.Commands.add('confirm_progress_indicator', function() {
    // Assert that the progress indicator exists
    cy.get('div.progress_indicator_overlay.mask:visible').should('exist');
});

// the below commands use the app's crud request endpoint. we can use this
// when the rest API won't suffice.

Cypress.Commands.add('shotgun_generic_form_request', (url, formData) => {
    const body = {
        csrf_token: Cypress.config(`csrf_token_u${Cypress.config('admin_id')}`),
        ...formData,
    };
    cy.request({
        method: 'POST',
        form: true,
        url,
        body,
    });
});

Cypress.Commands.add('crud_requests', requests => {
    cy.shotgun_generic_form_request('/crud/requests', {
        requests: JSON.stringify(requests),
    });
});

Cypress.Commands.add('generic_entity_crud_request', (request_type, entity_type, request_body) => {
    cy
        .crud_requests([
            {
                request_type,
                type: entity_type,
                ...request_body,
                local_timezone_offset: -(new Date().getTimezoneOffset() / 60),
            },
        ])
        .then(response => {
            function transformData(columns, row) {
                return columns.reduce((acc, column, i) => {
                    acc[column] = row[i];
                    return acc;
                }, {});
            }
            const body = response.body[0];
            if (body.row) {
                return transformData(body.columns, body.row);
            }
            if (body.rows) {
                return body.rows.map(row => transformData(body.columns, row));
            }
            return body || null;
        });
});

Cypress.Commands.add('crud_create_entity', ({ entity_type, project_id, field_values }) => {
    const final_field_values = [
        {
            column: 'project',
            value: {
                type: 'Project',
                id: project_id,
                valid: 'valid',
            },
        },
    ];
    for (const key in field_values) {
        if (key !== 'project') {
            final_field_values.push({
                column: key,
                value: field_values[key],
            });
        }
    }
    cy.generic_entity_crud_request('create', entity_type, { field_values: final_field_values });
});

Cypress.Commands.add(
    'crud_read_entities',
    ({
        entity_type,
        project_id,
        additional_columns,
        additional_conditions = [],
        include_archived_projects = false,
        include_template_projects = false,
        include_demo_projects = true,
    }) => {
        const required_columns = ['id', 'project'];
        const all_columns = required_columns.concat(additional_columns.filter(c => !required_columns.includes(c)));
        cy.generic_entity_crud_request('read', entity_type, {
            read: ['entities'],
            filters: {
                logical_operator: 'and',
                conditions: [
                    {
                        path: 'project',
                        relation: 'is',
                        values: [
                            {
                                type: 'Project',
                                id: project_id,
                                valid: 'valid',
                            },
                        ],
                    },
                    ...additional_conditions,
                ],
            },
            columns: all_columns,
            include_archived_projects,
            include_template_projects,
            include_demo_projects,
        });
    }
);

Cypress.Commands.add('crud_delete_entity', ({ entity_type, entity_id }) => {
    cy.generic_entity_crud_request('delete', entity_type, { id: entity_id });
});

function getPageSettingsForChildWidgetSpecs(childSpecs) {
    function canvasWrapperSpec(child) {
        return {
            type: 'SG.Widget.Canvas.Wrapper',
            settings: {
                maximizable: true,
                entity_type_varies: true,
                variation: 'Grid',
                variation_display_name: 'Grid',
                title: '',
                title_updated: false,
                title_key: 'canvas.designer.new_widget_title',
                title_interpolation_key: 'display_name',
                title_interpolation_value: 'canvas.designer_tools.widget_grid',
                configured: true,
                collapsable: true,
                collapsed: false,
            },
            children: { child },
        };
    }

    const body = {
        type: 'SG.Widget.Canvas.Body',
        settings: { rows: [] },
        children: {},
    };
    childSpecs.forEach((spec, index) => {
        const rowName = `row_${Math.floor(index / 2) + 1}`;
        if (index % 2 === 0) {
            body.settings.rows.push(rowName);
            body.children[rowName] = {
                type: 'SG.Widget.Canvas.Row',
                settings: { column_widgets: [['child_0']] },
                children: { child_0: canvasWrapperSpec(spec) },
            };
        } else {
            body.children[rowName].settings.column_widgets.push(['child_1']);
            body.children[rowName].children.child_1 = canvasWrapperSpec(spec);
        }
    });

    return {
        type: 'SG.Widget.Canvas.Page',
        settings: {
            layouts: [
                {
                    name: 'body',
                    display_name: 'Default',
                    allowed_permission_group_codes: ['admin', 'artist', 'artist__cut_publisher_', 'manager', 'vendor'],
                    denied_permission_group_codes: [],
                },
            ],
            empty: false,
        },
        children: {
            title: { type: 'SG.Widget.PageTitle', settings: {}, children: {} },
            detail_pane: { type: 'SG.Widget.EntityPane.Wrapper', settings: {}, children: {} },
            body,
        },
    };
}

function get_specs_for_widgets(widgets) {
    const { variation, entity_type } = widgets[0];
    return cy
        .shotgun_generic_form_request('/page/canvas_widget_spec', {
            variation,
            entity_type,
            parent_entity_type: 'HumanUser',
        })
        .then(({ body }) => {
            if (widgets.length === 1) {
                return [body];
            }
            get_specs_for_widgets(widgets.slice(1)).then(specs => [body].concat(specs));
        });
}

// TODO: wow would be nice if the requests didn't have to fire in sequence..
Cypress.Commands.add('create_canvas_page_with_widgets', ({ project_id, widgets }) => {
    cy
        .crud_create_entity({
            entity_type: 'Page',
            project_id,
            field_values: {
                name: 'canvas test page',
                page_type: 'canvas',
            },
        })
        .then(({ id }) => {
            get_specs_for_widgets(widgets).then(specs => {
                cy
                    .shotgun_generic_form_request('/page/save', {
                        id,
                        settings: JSON.stringify(getPageSettingsForChildWidgetSpecs(specs)),
                    })
                    .then(() => id);
            });
        });
});

// end crud request commands
