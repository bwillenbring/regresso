const pluralize = require('pluralize');

Cypress.Commands.add('set_thumbnail_prefs', function({
    enable_direct_s3_uploads = 'yes',
    enable_direct_s3_uploads_2 = 'yes',
    enable_s3_accel = 'yes'
} = { }) {
    // Set the prefs accordingly
    cy.set_preference({
        enable_direct_s3_uploads: enable_direct_s3_uploads,
        enable_direct_s3_uploads_2: enable_direct_s3_uploads_2,
        enable_s3_accel: enable_s3_accel
    });
});

Cypress.Commands.add('enable_entity', function({
    entity_type = '',
    display_name = null,
    has_versions = null,
    has_tasks = null
} = { }) {
    // We are interested in setting 2 prefs: 
    //  1. use_<entity_type_lowercase_plural>s
    //  2. display_name_<entity_type_lowercase_singular>
    const entity_prefs = {};
    entity_prefs[`use_${pluralize.plural(entity_type.toLowerCase())}`] = 'yes';
    // Add the display name if necessary 
    if (display_name) {
        entity_prefs[`display_name_${entity_type.toLowerCase()}`] = display_name
    }
    // Set the prefs 
    cy.set_preference(entity_prefs);
});

Cypress.Commands.add('set_thumbnail_routes', function() {
    cy.server();
    cy.route('POST', '/page/save_user_temporary_settings').as('temp_settings');
    cy.route('POST', '/crud/entity_factory').as('entity_factory');
    cy.route('GET', '/page/reload_schema*').as('reload_schema');
    cy.route('POST', '/upload/get_upload_link_info*').as('upload_link');
    cy.route('POST', '/page/send_notes_app_summary_email').as('send_summary_email');
    cy.route('POST', '/page/permissions_for_field_config').as('permissions_for_field_config');
});
