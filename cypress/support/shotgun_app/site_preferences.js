export function isSitePreferencesPage() {
    // Ensure that we're actually on the site preferences page
    cy.wait_for_page_to_load().then(() => {
        cy.get('[sg_selector="label:page_name"]').then(labelElement => {
            cy.get_translation('db_pages.site_preferences.display_name').then(sitePreferencesTitle => {
                expect(labelElement.text()).to.eq(sitePreferencesTitle);
            });
        });
    });
}
