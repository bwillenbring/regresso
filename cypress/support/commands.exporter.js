/* ----------------------------------------------------------------------
Exporter functions
---------------------------------------------------------------------- */
// Convert a string to an array, or return the original array
function convert_to_array(str) {
    if (typeof str == 'object') {
        return str;
    } else {
        // Assume string is array-like in structure
        return eval('[' + str + ']');
    }
}

// Very important function that converts each line of the csv file into an array
function convert_csv_to_array(csv_data) {
    let csv_array = [];
    // Split csv_data into lines
    let lines = csv_data.split('\n');
    lines.forEach(function(line) {
        let row = convert_to_array(line);
        csv_array.push(row);
    });
    return csv_array;
}

// Randomly selects one item from the supplied array
function select_one_of(choices_array) {
    // Test for array-ness first
    if (!Cypress._.isArray(choices_array)) {
        return choices_array;
    } else {
        // Return a random element from the array
        let upper = choices_array.length - 1;
        let i = Cypress._.random(0, upper);
        return choices_array[i];
    }
}

/* ----------------------------------------------------------------------
Test Suite setup
---------------------------------------------------------------------- */
/*
cy.setup_exporter_suite()
  Does all setup
    - Creates a project called 'Exporter ' + timestamp
    - Creates a shot + 5 tasks linked to the shot
    - Sets predetermined values on Task fields
*/

Cypress.Commands.add('setup_exporter_suite', function() {
    // Set up vars for later...
    let PROJECT;
    let shot_id;
    let task_ids = [];
    // Create a test project
    let p_name = 'Exporter ' + Cypress.moment();
    let data = {
        name: p_name,
    };
    cy
        .create_entity('Project', data)
        .then($id => {
            // Set the project config
            Cypress.config('TEST_PROJECT', {
                name: p_name,
                id: $id,
            });
            // Save the project id in the PROJECT var
            PROJECT = {
                type: 'Project',
                id: $id,
            };
        })
        .then(() => {
            // Create a Shot in the test project
            let data = {
                code: 'BW_0001',
                description: 'Test Shot',
                project: PROJECT,
            };
            cy.create_entity('Shot', data).then($id => {
                shot_id = $id;
                cy.wrap($id).as('shot_id');
            });
        })
        .then(() => {
            // Create Several Tasks
            let year = new Date().getFullYear();
            let task_date = String(year) + '-08-14';
            let payload = {
                requests: new Array(5),
            };
            let request;
            cy
                .wrap(payload.requests)
                .each(function(arr, i) {
                    let num = Math.floor(Math.random() * (9600 - 480 + 1) + 480);
                    let request = {
                        entity: 'Task',
                        request_type: 'create',
                        data: {
                            content: 'Task ' + String(i + 1),
                            project: PROJECT,
                            entity: {
                                type: 'Shot',
                                id: shot_id,
                            },
                            start_date: task_date,
                            duration: num,
                            milestone: select_one_of([true, false]),
                        },
                    };
                    payload.requests[i] = request;
                })
                .then(() => {
                    // Make the batch request
                    cy
                        .batch_request(payload)
                        .then($retValue => {
                            assert.isTrue($retValue.status == 200, 'Batch create of Tasks succeeded');
                            // Now get the task id's
                            $retValue.body.data.forEach(function(task) {
                                task_ids.push(task.data.id);
                            });
                        })
                        .then(() => {
                            cy.log('Task ids', task_ids);
                            Cypress.config('TASK_IDS', task_ids);
                        });
                });
        });
});

/* ----------------------------------------------------------------------
Exporter Commands
---------------------------------------------------------------------- */
/*
cy.get_csv_headers()
  Gets the headers of a string of csv_data - looks at 1st AND 2nd columns
  Returns an array (in the case of a pivot col. export, it returns 2nd line)
*/
Cypress.Commands.add('get_csv_headers', function(csv_data) {
    // Assume headers are on the 1st row
    csv_data = csv_data.split('\n');
    let line1 = convert_to_array(csv_data[0]);
    let line2 = convert_to_array(csv_data[1]);
    let hdr_line = line1;

    // If line1 has 'Id' as col 1, there are no Pivot columns
    if (line1[0] == 'Id') {
        return line1;
    } else {
        // There are pivot columns
        // The real headers are on line2
        return line2;
    }
});

/*
cy.export_page(csv_file_name)
  Generates a request to `crud/csv_file_read_request` and captures the ouput
  Returns an object with these attributes...
    csv_headers: [array of header names]
    csv_data: [string of csv output request],
    csv_file_name: [string of saved csv filename],
    records: [total records reported by the underlying grid prior to export]
 */

Cypress.Commands.add('export_page', function(csv_file_name = 'default_export.csv') {
    let records;
    cy.get_csrf_token_value().then(csrf_token_value => {
        cy.get_SG().then(SG => {
            // Get page id
            let page_id = SG.globals.page.id;
            // Get the root widget
            let page = SG.globals.page.root_widget.get_child_widgets()[2];
            // Get the grid widget...
            let ng = page.get_child_widgets()[0];
            // Be adaptable if page type == Task
            if (page.get_entity_type() == 'Task') {
                ng = ng.grid_widget;
            }
            // Set your csv file read request url
            const url = 'crud/csv_file_read_request';
            // Create headers
            const request_headers = {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                Referer: Cypress.config('baseUrl') + '/page/' + page_id,
                'Upgrade-Insecure-Requests': 1,
                'Cache-Control': 'max-age=0',
            };
            // Construct your csv export request
            const spec = ng.get_csv_spec();
            // Generate the csv request by using SG.Repo.make_query_req
            const req = SG.Repo.make_query_req(spec);
            // Calculate the browser's utc offset (and convert to hours)
            const offset = Cypress.moment().utcOffset() / 60;
            // Add the utc offset to the csv request. eg: "local_timezone_offset":-5
            req.local_timezone_offset = offset;
            const data = {
                read_request: JSON.stringify(req, undefined, 2), // Stringifying the JSON is necessary
                csrf_token: csrf_token_value, // A security compliance requirement
            };

            // Make the request for the actual csv data
            cy
                .request({
                    method: 'POST',
                    url: url,
                    headers: request_headers,
                    body: data,
                    form: true,
                })
                .then($resp => {
                    // Count up all records
                    records = ng.get_record_count();
                    //write the file to disk
                    cy.writeFile(csv_file_name, $resp.body);
                })
                .then(() => {
                    // Read in the data (for better processing)
                    cy.readFile(csv_file_name).then($data => {
                        let data = convert_csv_to_array($data);
                        cy.get_csv_headers($data).then($headers => {
                            return {
                                csv_headers: $headers,
                                csv_data: data,
                                csv_file_name: csv_file_name,
                                records: records,
                            };
                        });
                    });
                });
        });
    });
});
