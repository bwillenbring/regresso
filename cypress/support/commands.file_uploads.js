
/**
 * @function upload_file
 * @description Uploads a single file to an entity's file/link field. Will only work with files already located below `test/cypress/fixtures/uploads`. Returns whether or not the upload succeeded.
 *
 * <h4>IMPORTANT</h4>
 * This method will NOT work if it runs locally in the Cypress Test Runner (outside of the container). It is possible that it has to do with the REST api calls failing at a preliminary step of upload URL generation because the Shotgun site baseUrl contains a port number - `:8888`.
 * {@link upload_file_curl Also see cy.upload_file_curl()}.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Object} options
 * @param {String} options.entity_type - The CamelCase entity type.
 * @param {Number} options.entity_id - The entity id.
 * @param {String} options.field_name - The system field name of the file/link field that the upload will target.
 * @param {String} options.file_name - The path to the file. Should be below `test/cypress/fixtures/uploads/`
 *
 * @returns {Boolean}
 *
 * @example <caption>Asset thumbnail</caption>
 * cy.upload_file({
 *    entity_type: 'Asset',
 *    entity_id: entity_id,
 *    field_name: 'image',
 *    file_name: 'fixtures/uploads/worm.jpg',
 * });
 *
 * @example <caption>Project Billboard</caption>
 * // Upload the project billboard
 * cy.upload_file({
 *    entity_type: 'Project',
 *    entity_id: Cypress.config('TEST_PROJECT').id,
 *    field_name: 'billboard',
 *    file_name: 'fixtures/uploads/billboards/billboard_pipeline.jpg',
 * });
 *
 */
Cypress.Commands.add('upload_file', (options = {}) => {
    const cmd = 'python cypress/fixtures/python/upload_file.py';

    // These will become os.environ vars inside of python
    const python_vars = {
        file_name: options.file_name,
        field_name: options.field_name,
        entity_type: options.entity_type,
        entity_id: options.entity_id,
        baseUrl: Cypress.config('baseUrl'),
        admin_login: Cypress.config('admin_login'),
        admin_pwd: Cypress.config('admin_pwd'),
        TOKEN: Cypress.config('TOKEN').body.access_token,
    };
    // Execute the python file upload code, stipulate 30 sec timeout
    // Pass in all python environment vars with `env`
    cy
        .exec(cmd, {
            timeout: 30000,
            env: python_vars,
            failOnNonZeroExit: true,
        })
        .then(stdout => {
            console.log(stdout.stdout);
            cy.log(`cy.upload_file() resulted in...\n${stdout.stdout}`);
            cy
                .wrap(stdout.code)
                .should(
                    'eq',
                    0,
                    `Upload of ${options.file_name} to ${options.entity_type} ${options.entity_id} succeeded.`
                );
        });
});

/**
 * @function upload_file_curl
 * @description Uploads a single file to an entity's file/link field, and mirrors the functioning of {@link upload_file cy.upload_file()}. This command relies on an `api2` endpoint, and was only used because of testing related to the TLS deprecation in May 2019. This method of uploading files will work in the Cypress Test Runner.
 * Also see {@link upload_file cy.upload_file()}.
 *
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Object} options
 * @param {String} options.entity_type - The CamelCase entity type.
 * @param {Number} options.entity_id - The entity id.
 * @param {String} options.field_name - The system field name of the file/link field that the upload will target.
 * @param {String} options.file_name - The path to the file. Should be below `test/cypress/fixtures/uploads/`
 *
 * @returns {String} stdout
 *
 * @example <caption>Asset thumbnail</caption>
 * cy.upload_file_curl({
 *    entity_type: 'Asset',
 *    entity_id: entity_id,
 *    field_name: 'image',
 *    file_name: 'fixtures/uploads/worm.jpg',
 * });
 */
Cypress.Commands.add('upload_file_curl', function(options) {
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
