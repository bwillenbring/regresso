/// <reference types="cypress" />

describe('Account Settings', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    it('Account', function() {
        let label = 'Cypress ' + Cypress.moment();
        cy.navigate_to_page('/page/account_settings');
        // Assert that account settings is the currently selected item
        cy.get('.left_pane div.mode.selected').invoke('text').should('eq', 'Account');
        // Assert the right pane is there
        cy.get('.right_pane').should('be.visible');
        // ASsert that the thumbnail is there
        cy.get('.sg_cell_content.thumb').should('be.visible');
        // Assert the change password button is there
        cy.get('input.change_password_button').should('be.visible');
        // Click change profile pic
        cy.get('.change_profile_pic').click();
        // The dark overlay is visible
        cy.get('.sg_dialog_mask[sg_id="UpldThmbDlg"]').should('be.visible');
        // Assert the replace image dialog shows up
        cy.get('.sg_dialog:contains("Replace Thumbnail")').should('exist');
        // Click cancel
        cy.get('[sg_selector="button:cancel"]').click();
        // Overlay is gone
        cy.get('.sg_dialog_mask[sg_id="UpldThmbDlg"]').should('not.be.visible');
        // Click 'Gear Menu'
        cy.get('.right_pane .settings .gear_menu').click();
        // Click 'Configure Layout'
        cy.get('[sg_selector="menu:configure_layout..."]').click();
        // Field Properties dialog is visible
        cy.get('[sg_id="page:root_widget:FldPrprtsDlg"]').should('be.visible');
        // Expand the 1st field accordion
        cy.get('div.field_properties:first span.icon_disclosure').click();
        // Type in a new name...
        // IMPORTANT: '<h1>wow</h1>' is not escaped
        cy.get('div.field_properties:first input[name="field_label_override"]').type(label);
        // Click 'Apply'
        cy.get('div.right_controls input[value="Apply"]').click();
        // Assert that your label appears int he fields layout
        cy.get('.right_pane .user_fields .field_name:contains("' + label + '")').should('be.visible');
        // Reload the page and assert that the override does not persist
        cy.reload();
        cy.wait_for_spinner();
        cy.get('.right_pane .user_fields .field_name:contains("' + label + '")').should('not.exist');
    });

    it('Email Notifications', function() {
        cy.get('.left_pane [sg_selector="label:notifications"]').click();
        // Assert that account settings is the currently selected item
        cy.get('.left_pane div.mode.selected').invoke('text').should('eq', 'Email Notifications');
        // Assert on Page header
        cy.get('.right_pane .header').invoke('text').should('eq', 'Email Notifications');
        // There are exactly 2 checkboxes
        cy.get('.right_pane .notification_settings input[type="checkbox"]').its('length').should('eq', 2);
        // There are at least 6 legacy notifications
        cy.get('.right_pane .legacy_notifications input[type="checkbox"]').its('length').should('be.above', 5);
    });

    it('My Following Settings', function() {
        cy.get('.left_pane [sg_selector="label:inbox"]').click();
        // Assert that account settings is the currently selected item
        cy.get('.left_pane div.mode.selected').invoke('text').should('eq', 'My Following Settings');
        // Assert on Page header
        cy.get('.right_pane .title').invoke('text').should('eq', 'My Following Settings');
    });
});
