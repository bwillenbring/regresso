/**
 * @function create_query_field
 * @description Creates a query field by sending an xhr POST request to `background_job/configure_dc`
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Object[]} props - Set of query field properties to pass along to the function.
 * @param {String} props.field_owner_entity_type - The entity type on which the query field will be created.
 * @param {String} props.field_name - The display name of the field. eg: `Some Query Field on Project`
 * @param {String} props.summary_field=id - The field on which to summarize.
 * @param {String} props.summary_default=record_count - The display mode of the query field. Valid options are...<ul><li>null</li><li>single_record</li></ul>
 * @param {String} props.summary_value=`null` - Only necessary if using a non-null summary_default. This must be passed in as a stringified JSON object.
 * @param {Object} props.query={logical_operator:'and',conditions:[{path:'id',relation:'greater_than',values:[0],active:'true'}]} - The query
 *
 * @returns {Object} The Response object of the xhr request to `background_job/configure_dc`
 *
 * @example <caption>Shot => Versions</caption>
 * // Finds all Versions, even ones not linked to the Shot
 * // Displays a record count
 * cy.create_query_field({
 *    field_owner_entity_type: 'Shot',
 *    entity_type: 'Version',
 *    field_name: 'All Versions',
 * })
 * // The resulting query field will have the default filter since one was not passed in.
 *
 *
 * @example <caption>Shot => Latest Note sorted by Date Created</caption>
 * // Finds all Notes linked to the current Shot sorted by created_at desc
 * // Displays the Latest note, using the content field (no detail page link)
 * cy.create_query_field({
 *     field_owner_entity_type: 'Shot',
 *     entity_type: 'Note',
 *     field_name: 'Latest Note',
 *     summary_field: 'content',
 *     summary_default: 'single_record',
 *     summary_value: JSON.stringify({ column: 'created_at', direction: 'desc', detail_link: false }),
 *     filters: {
 *         logical_operator: 'and',
 *         conditions: [
 *             {
 *                 path: 'note_links',
 *                 relation: 'is',
 *                 values: [
 *                     {
 *                         type: 'Shot',
 *                         id: 0,
 *                         name: 'Current Shot',
 *                         valid: 'parent_entity_token',
 *                     },
 *                 ],
 *                 active: 'true',
 *             },
 *         ],
 *     },
 * });
 */
export function create_query_field(
    props = {
        field_owner_entity_type: '',
        field_data_type: 'summary',
        col_name: null,
        allow_recode: false,
        field_name_prefix: '',
    }
) {
    let system_name;
    // You'll need this cookie for later on...
    const csrf = `csrf_token_u${Cypress.config('admin_id')}`;

    // Set up a default filter: id > 0
    const default_filter = {
        logical_operator: 'and',
        conditions: [
            {
                path: 'id',
                relation: 'greater_than',
                values: [0],
                active: 'true',
            },
        ],
    };

    // Set up params from props passed in
    let params = {
        field_owner_entity_type: props.field_owner_entity_type,
        field_data_type: 'summary',
        col_name: null,
        allow_recode: false,
        field_name_prefix: '',
        field_name: props.field_name,
        summary_field: !props.summary_field ? 'id' : props.summary_field,
        summary_default: !props.summary_default ? 'record_count' : props.summary_default,
        summary_value: props.summary_value ? props.summary_value : null,
        query: {
            entity_type: props.entity_type,
            filters: !props.filters ? default_filter : props.filters,
        },
    };

    // Dispatch the post request that will create the field
    cy
        .request({
            url: 'background_job/configure_dc',
            method: 'POST',
            form: true,
            body: {
                csrf_token: Cypress.config(csrf),
                dialog_params: JSON.stringify(params),
            },
            failOnStatusCode: false,
        })
        .then(response => {
            assert.isTrue(response.status == 200, 'Field creation resulted in a background job id!');
            // Now verify that the field really exists
            cy
                .verify_field_exists({
                    entity_type: props.field_owner_entity_type,
                    field_display_name: props.field_name,
                })
                .should('eq', true);
        });
}

/**
 * @function get_field_by_display_name
 * @description Gets a field by entity name and display name.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity name.
 * @param {String} display_name - The configured display name of the field.
 *
 * @returns {String|null} - The system name of the field.
 *
 * @example
 * cy.get_field_by_display_name('Shot', 'Shot Name').then(system_field_name => {
 *    assert.isTrue(system_field_name == 'code');
 * })
 *
 */
export function get_field_by_display_name(entity_type, display_name) {
    cy.get_rest_endpoint(`/api/v1/schema/${entity_type}/fields`, 'GET', false).then(resp => {
        // Get the entity's system field name by locating it as a key
        // int he REST api response
        let field_system_name = Cypress._.findKey(resp.body.data, function(obj) {
            return obj.name.value == display_name;
        });
        // Return ONLY the field name (if it exists) or null
        // Do not return the response object of cy.get_rest_endpoint
        return undefined == field_system_name ? null : field_system_name;
    });
}

/**
 * @function verify_field_exists
 * @description Verifies that a field (by entity type) and display name actually exists in the schema. This is called automatically at the end of `cy.create_query_field()` so that the command does not exit until the query field actually exists.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {options}
 * @param {String} options.entity_type - The CamcelCase entity type.
 * @param {String} options.field_display_name - The display name of the field. eg: `Shot Name`. Note: case is important.
 * @param {Number} options.number_of_checks=5 - The number of times to poll the schema before giving up. Default is `5`.
 * @param {Number} options.interval=2000 - The number of `milliseconds` to wait in between checks. Default is `2000`.
 *
 * @returns {Boolean} true or false.
 *
 * @example
 * cy.verify_field_exists({entity_type: 'Shot', field_display_name: 'Type'}).then(exists => {
 *    assert.isTrue(exists)
 * });
 *
 * @example
 * cy.verify_field_exists({entity_type: 'Shot', field_display_name: 'Type', number_of_checks: 1}).then(exists => {
 *    assert.isTrue(exists)
 * });
 *
 */
export function verify_field_exists(options) {
    cy.log(`Attempting to verify if field exists: ${options.entity_type}.${options.field_display_name}`);
    // Always expect entity_type and field_display_name
    let { entity_type, field_display_name } = options;
    // Use waitUntil() to call`cy.get_field_by_display_name()`
    // and return if field_system_name is not null (true | false)
    // Do this ^^ repeatedly if necessary within the timeout, using the specified interval
    cy.waitUntil(
        () =>
            cy.get_field_by_display_name(options.entity_type, options.field_display_name).then(field_system_name => {
                // Return a truthy value
                return null !== field_system_name;
            }),
        {
            timeout: 30000, // timeout after 30 secs
            interval: 2000, // check every 2 secs
        }
    );
}
