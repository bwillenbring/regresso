/*
createPage(props={})
- Takes an object with various params:
  - name                (default = 'Blank Page')
  - project             (default = Cypress.config('TEST_PROJECT'))
  - entity_type         (default = '')
  - page_type           (default = 'canvas')

- Simplest use...
  cy.create_page({name:'My Test Page'})
  - Creates a blank canvas page named 'My Test Page' in the default Test Project

*/
Cypress.Commands.add('createPage', function(props = {}) {
    // Set some defaults...
    props.name = typeof props.name !== 'undefined' ? props.name : 'Blank Page';
    props.project =
        typeof props.project !== 'undefined'
            ? props.project
            : {
                  type: 'Project',
                  id: Cypress.config('TEST_PROJECT').id,
              };
    props.entity_type = typeof props.entity_type !== 'undefined' ? props.entity_type : '';
    props.page_type = typeof props.page_type !== 'undefined' ? props.page_type : 'canvas';

    // set up the req object, which is the bulk of what makes this work
    // You could definitely load this from fixtures to keep things tidy!
    const req = [
        {
            request_type: 'create',
            type: 'Page',
            field_values: [
                {
                    column: 'project',
                },
                {
                    column: 'name',
                    value: 'Blank canvas',
                },
                {
                    column: 'entity_type',
                    value: '',
                },
                {
                    column: 'page_type',
                    value: 'canvas',
                },
            ],
            columns: [
                'name',
                'ui_category',
                'page_type',
                'admin',
                'shared',
                'default_type',
                'accesses_by_current_user',
                'folder',
                'entity_type',
                'last_accessed',
                'hits_last_month',
                'last_accessed_by_current_user',
                'current_user_favorite',
                'description',
                'created_by',
                'updated_by',
                'created_at',
                'updated_at',
                'system_owned',
                'id',
                'project',
                'tags',
                'user',
            ],
            promise: {
                is_promise: true,
            },
            local_timezone_offset: new Date().getTimezoneOffset() / -60,
        },
    ];

    cy.get_session_uuid().then(uuid => {
        // Get csrf token value...
        cy.get_csrf_token_value().then(token => {
            // Override req values with passed-in values
            const field_values = [
                {
                    column: 'project',
                    value: props.project,
                },
                {
                    column: 'name',
                    value: props.name,
                },
                {
                    column: 'entity_type',
                    value: props.entity_type,
                },
                {
                    column: 'page_type',
                    value: props.page_type,
                },
            ];
            req[0].field_values = field_values;

            const data = {
                requests: JSON.stringify(req),
                bkgd: false,
                batch_transaction: false,
                session_uuid: uuid,
                debug: false,
                csrf_token: token,
            };
            const request = {
                url: '/crud/requests',
                form: true,
                method: 'POST',
                body: data,
            };

            cy.request(request).then($resp => {
                // Status should be 200
                assert.isTrue($resp.status == 200, 'Page creation was successful');
                const page_id = $resp.body[0].row[0];
                return page_id;
            });
        });
    });
});
