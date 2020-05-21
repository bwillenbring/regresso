/// <reference types="cypress" />

let PROJECTS_TO_DELETE = [];

describe('Project Creation Spec', function() {
    /* ------------------------------------------------------------
    Test Suite Setups
    ------------------------------------------------------------ */
    before(function() {
        // Get a REST API token - good for the duration of the tests
        cy.get_access_token();
        // Conditionally create a project for the Regression
        cy.conditionally_create('Project', {
            name: 'Cypress Regression',
            filters: [['name', 'is', 'Cypress Regression']],
        });
        // Get a web session token
        cy.login_as('admin');
        // Persist session-related cookies so that you don't have to
        // Login again for each successive `it` block (test case)
        Cypress.Cookies.defaults({
            whitelist: ['_session_id', `csrf_token_u${Cypress.config('admin_id')}`],
        });
        // Setup network aliases for common xhr requests so that if need be, you can
        // wait for them explicitly and/or inspect their responses
        cy.set_network_routes();
    });

    after(function() {
        // Delete the project that was created for this test
        PROJECTS_TO_DELETE.forEach(function(p) {
            cy.delete_entity('Project', p).then(() => {
                cy.log('Deleted project ', p);
            });
        });
    });

    /* ------------------------------------------------------------
    Test Cases Below
    ------------------------------------------------------------ */

    it('Create a project in the Simple Project creation form', function() {
        // Create a project name that is certain to be unique
        let project_name = 'Cypress Project' + Cypress.moment();
        // Navigate to the home page
        cy.home();
        // Invoke new entity form for Project, using the global new menu
        cy.invoke_new_entity_form('Project');
        // Assert the new dialog is present and visible, and has all the expected attributes
        cy.get('[sg_id="dialog:sgd_new_project"]').should('be.visible').and('contain', 'Create New Project');
        // Type a project name that is unique
        cy.get('input.project_name').type(project_name);
        // Select the first Project Template (this is not selected by default)
        cy.get('[sg_id="dialog:sgd_new_project"] [sg_selector^="item:template_"]:first input').click({ force: true });
        // Click 'Create Project'
        cy.get('[sg_selector="button:create_project"]:enabled').click({ force: true });
        // Wait for the url to change to the project overview
        cy.url().should('contain', 'page/project_overview?project_id=');

        /* ------------------------------------------------------------
        Assert that all of the expected elements on the Project overview
        page conform to expectations
        ------------------------------------------------------------ */
        // Global Header...
        cy.get('#sg_global_nav').should('be.visible');
        // Project thumbnail
        cy.get('div.project_thumb_wrapper').should('be.visible').and('contain', 'Upload Thumbnail');
        // Billboard...
        cy.get('div.billboard_click_target').should('be.visible').and('contain', 'Upload Billboard');
        // Tabs => All
        cy.get('div.filter_button.active').should('be.visible').and('contain', 'All');
        // Tabs => Note
        cy.get('div.filter_button').should('be.visible').and('contain', 'Note');
        // Tabs => Versions
        cy.get('div.filter_button').should('be.visible').and('contain', 'Versions');
        // Tabs => Publishes
        cy.get('div.filter_button').should('be.visible').and('contain', 'Publishes');
        // There is exactly 1 new note form
        cy.get('div.new_note').should('have.length', 1);
        // Media widget
        cy.get('div.sgc_project_media').should('be.visible').and('contain', 'Media');
        // People widget
        cy.get('div.sgc_project_people').should('be.visible').and('contain', 'People');
        // Project Info widget
        cy.get('div.project_info').should('be.visible').and('contain', 'Info');

        // Get the id of the project
        cy.search_entities('Project', [['name', 'is', project_name]], ['id']).then(resp => {
            PROJECTS_TO_DELETE.push(resp.data[0].id);
        });
    });
}); // end describe
