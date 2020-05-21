/// <reference types="cypress" />

describe('[SG-10822] Links used in Site prefs render properly', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Links is Site prefs should render properly
    [SG-10822] Regression: Links used in site preferences are escaped
    ---------------------------------------------------------------------- */
    it('Confirms that all links are well-formed', function() {
        cy.navigate_to_page('/preferences');
        cy.expand_pref_section('Entities');
        // There are 120 entity sections with links
        cy
            .get(
                'div[open_key^="entity_type_group_Custom"] div.entity_type_description:has(a[href^="https://support.shotgunsoftware.com/entries/21632"])'
            )
            .its('length')
            .should('be', 120);

        // Eeach link is well-formed - not escaped
        cy
            .get(
                'div[open_key^="entity_type_group_Custom"] div.entity_type_description:has(a[href^="https://support.shotgunsoftware.com/entries/21632"])'
            )
            .each(($el, index, $list) => {
                let link = $el.find('a').attr('href');
                console.log(`${index + 1}. ${link}`);
                cy.wrap(link).should('contain', 'https://support.shotgunsoftware.com/entries/21632');
            });
    });
});
