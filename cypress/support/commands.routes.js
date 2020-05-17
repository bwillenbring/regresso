Cypress.Commands.add('set_network_routes', () => {
    cy.server();
    //Intercept inbox update polling - update/updates
    cy
        .route({
            url: '*update/updates*',
            method: 'POST',
            status: 200,
        })
        .as('updates');
    //Intercept page logging metrics page/log_page_metrics
    cy
        .route({
            url: '*page/log_page_metrics*',
            method: 'POST',
            status: 200,
            response: 'Page metrics OK',
        })
        .as('amplitude');
    //Wait for all crud requests to complete
    cy
        .route({
            url: '*crud/requests*',
            method: 'POST',
            status: 200,
            // requestTimeout: 15000,
        })
        .as('crud');
    //Wait for all media_center_right_pane requests to complete
    cy
        .route({
            url: '*media_center_right_pane*',
            method: 'POST',
            requestTimeout: 15000,
        })
        .as('media_center');
    //Render long running xhr's harmless
    cy
        .route({
            url: '*progress_indicator/update*',
            method: 'POST',
            status: 200,
        })
        .as('prog_update');
    cy
        .route({
            url: '*progress_indicator/restart_status*',
            method: 'GET',
            status: 200,
        })
        .as('prog_restart_status');
    cy
        .route({
            url: '*crud/csv_file_read_request*',
            method: 'POST',
            status: 200,
        })
        .as('csv_export');
    cy
        .route({
            url: '*event_log_entry*',
            method: 'POST',
            status: 200,
        })
        .as('event_log_entry');
});
