/// <reference types="cypress" />

describe('[SG-10065] Change a pref and verify that the S3 bucket pref is NOT changed as a result ', function() {
    // This gets rest api token, creates a project, logs in as admin, and preserves session vars
    before(function() {
        cy.prep_regression_spec();
    });

    /* ----------------------------------------------------------------------
    Change a pref and verify that the S3 bucket pref is NOT changed as a result
    [SG-10065] 8020 regression pass - S3 Bucket pref is cleared every time *any* pref is changed
    ---------------------------------------------------------------------- */
    it('confirms that S3 bucket is NOT cleared out when a pref is set', function() {
        // First, get the current s3 pref value...
        cy.get_preference('s3_primary_bucket').then(pref => {
            let pref1 = pref.s3_primary_bucket;
            cy.log('initial value of s3_primary_bucket', pref1);
            // Now change a Filtering preference...
            cy.navigate_to_page('/preferences');
            cy.expand_pref_section('Filtering');
            // From 25 to 30
            cy.get('input[pref_key="maximum_entity_autocomplete_results"]').then(input => {
                // Get current val
                let v = Number(input.val());
                // Clear out the input's value
                input.val('');
                // Add 1 to the initial value...
                cy.wrap(input).type(v + 1).trigger('change');
            });
            // Click the save changes
            cy.get('[sg_selector="button:save_changes"]:first').click();
            cy.wait_for_spinner();
            cy
                .get('[sg_selector="label:feedback_success"]')
                .should('contain', 'Site preferences successfully updated.');
            // Re-fetch the s3 pref
            cy.get_preference('s3_primary_bucket').then(pref => {
                let pref2 = pref.s3_primary_bucket;
                cy.log('------------------------------');
                cy.log('pref1', pref1);
                cy.log('pref2', pref2);
                cy.log('------------------------------');
                // Assert they are equal
                assert.isTrue(pref2 == pref1, 's3_primary_bucket pref value is unchanged');
            });
        });
    });
});
