/// <reference types="cypress" />

Cypress.env('RETRIES', 0);
const name_slug = String(Number(Cypress.moment()));

describe('Thumbnail tests on canvas pages', function() {
    before(function() {
        cy.prep_regression_spec().then(() => {
            // Put this into a handy variable 
            const p = { type: 'Project', id: Cypress.config('TEST_PROJECT').id };
            // Create an Asset 
            cy.create_entity('Asset', {
                code: `Asset ${name_slug}`,
                project: p
            }).then(asset_id => {
                cy.wrap(asset_id).as('asset_id');
                cy.log('--------------------------------------------------');
                cy.log(`Created Asset with id=${asset_id}`);
                // --------------------------------------------------
                // Batch create 3 Versions
                // --------------------------------------------------
                cy
                    .batch_request({
                        requests: [
                            {
                                request_type: 'create',
                                entity: 'Version',
                                data: {
                                    project: p,
                                    code: `v1 (video)`,
                                    entity: {type: 'Asset', id: asset_id }
                                },
                                options: {
                                    fields: ['code','id'],
                                },
                            },
                            {
                                request_type: 'create',
                                entity: 'Version',
                                data: {
                                    project: p,
                                    code: `v2 (still image, no link)`
                                },
                                options: {
                                    fields: ['code','id'],
                                },
                            },
                            {
                                request_type: 'create',
                                entity: 'Version',
                                data: {
                                    project: p,
                                    code: `v3 (no media, no link)`
                                },
                                options: {
                                    fields: ['code','id'],
                                },
                            },
                        ],
                    }).then(resp => {
                        cy.log('--------------------------------------------------');
                        cy.log(`Batch created 3 Versions`);
                        cy.log(`  - v1 (video) [linked to Asset]`);
                        cy.log(`  - v2 (still image) [no link]`);
                        cy.log(`  - v3 (no media) [no link]`);
                        const files = [
                            'cypress/fixtures/uploads/video/toshi.mp4',
                            'cypress/fixtures/uploads/thumbnails/version_media.png',
                            'cypress/fixtures/uploads/thumbnails/version_media.png'
                        ]
                        // Get and store the versions
                        for (let i=0; i<3; i++) {
                            let obj = {
                                type: 'Version',
                                id: Cypress._.find(resp.body.data, o => o.data.attributes.code.startsWith(`v${i+1}`)).data.id,
                                code: Cypress._.find(resp.body.data, o => o.data.attributes.code.startsWith(`v${i+1}`)).data.attributes.code
                            }
                            // Persist this object...
                            cy.wrap(obj).as(`version${i+1}`);
                            // And upload a file to it as long as it is not the 3rd version
                            if (i < 2) {
                                cy.upload_file({
                                    entity_type: 'Version',
                                    entity_id: obj.id,
                                    field_name: 'sg_uploaded_movie',
                                    file_name: files[i],
                                });
                                cy.log('--------------------------------------------------');
                                cy.log(`Uploaded ${files[i]} to ${obj.code} (Version id=${obj.id})'`);
                            }
                        } // end for
                    });
            });

        }); // end prep regression spec
        // Set standard thumbnail-related prefs for all thumbnail tests 
        cy.set_thumbnail_prefs();

        
    }); // end before 

    beforeEach(function() {
        cy.set_thumbnail_routes();
    });
    
    it('sends summary email on playlist with mixed versions', function() {
        const playlist_name = `Playlist ${name_slug}`;
        const email = 'benjamin.willenbring@autodesk.com';
        let summary_email_id;
        cy.create_entity('Playlist', {
            code: playlist_name,
            project: { type:'Project', id: Cypress.config('TEST_PROJECT').id },
            versions: [
                { type: 'Version', id: this.version1.id },
                { type: 'Version', id: this.version2.id },
                { type: 'Version', id: this.version3.id }
            ]
        }).then(playlist_id => {
            cy.visit(`/page/notes_app?playlist_id=${playlist_id}`);
            cy.wait_for_page_to_load();
            cy.wait_for_spinner();
            // Assert that the left pane exists, and is visible 
            cy.get('#sgw_notes_app_left_pane').as('left_pane').should('be.visible');
            cy.log('--------------------------------------------------');
            cy.log(`Notes app successfully rendered for Playlist ${playlist_id}`)

            // --------------------------------------------------
            // Click refresh until you see 2 s3 thumbnails show up
            // --------------------------------------------------
            cy.waitUntil(()=> cy.get('#refresh').click({ force: true }).then(() => {
                cy.wait_for_spinner();
                cy
                    .get('@left_pane')
                    .then(left_pane => {
                        let s3_thumbs = Cypress.$(left_pane).find('img[data-cy="project_thumbnail"][src*="s3-accelerate.amazonaws.com"]');
                        if (!s3_thumbs) {
                            return false;
                        }
                        else {
                            return s3_thumbs.length === 2;
                        }
                    });
            }), {
                timeout: 60000,
                interval: 2000
            });
            cy.log('--------------------------------------------------');
            cy.log('The 2 Versions with media are displaying their thumbnails with s3 URLs');
            // --------------------------------------------------
            // Assert there are exactly 3 Versions
            // --------------------------------------------------
            cy
                .get('@left_pane')
                .find('.version.selectable')
                .its('length')
                .should('eq', 3);
            cy.log('--------------------------------------------------');
            cy.log('There are exactly 3 Versions in this playlist\nReady to begin typing notes');


            // --------------------------------------------------
            // Begin taking notes: 1 per Version 
            // --------------------------------------------------
            for (let i=0; i<3; i++) {
                cy
                    .get('@left_pane')
                    .find(`.version.selectable:eq(${i}) .draft_content`)
                    .as('draft_content')
                    .trigger('mouseover', { force: true })
                    .click({ force: true });

                // The following torturous set of clicks and waits is due to the left pane / right pane circus of the notes app 
                // 1. Click into the div that contains the textarea that we want to type into
                cy.waitUntil(() => cy.get('@draft_content').find('textarea').as('draft_input').click({ force: true }).then(draft_input => {
                    cy.log(`I have clicked into the textarea for note ${i+1}`);
                    cy.wait_for_spinner();
                    cy.log('No spinners => you may type input now').then(() => {
                        return true;
                    });
                }), {
                    timeout: 60000,
                    interval: 2000
                });

                // Type note {i} and exit edit mode
                cy
                    .get('@draft_input')
                    .clear()
                    .type(`Note ${i+1} @ ${name_slug}\t`)
                    .trigger('change', { force: true })
                    .blur();
            }
            cy.log('--------------------------------------------------');
            cy.log('Done typing 3 notes: 1 per Version');

            // Preview & Publish
            cy.get('[sg_selector="button:preview_and_publish"]').click();
            cy.handle_menu_item('Send All Notes');
            cy.wait('@crud');
            cy
                .get('[sg_id="dialog:sg_notes_app_publish_dialog"]')
                .as('dlg')
                .should('be.visible');
            cy.wait_for_spinner();
            cy.log('--------------------------------------------------');
            cy.log('Send notes dialog (with summary email option) now visible');

            // Check the 'Summary Email' checkbox 
            cy
                .get('@dlg')
                .find('#summary_email_toggle')
                .click({ force: true });
            // Specify an email 
            cy.get('@dlg').find('[sg_selector="input:cc_external"]').click({ force: true });
            // Wait for the active editor 
            cy.waitUntil(() => cy.get_SG().then(SG => {
                return SG.globals.active_editor;
            }));
            // Type 
            cy
                .get('.entity_editor textarea')
                .clear()
                .type(email)
                .trigger('change')
                .blur();
            // Wait for the active editor to be gone 
            cy.waitUntil(() => cy.get_SG().then(SG => {
                return !SG.globals.active_editor;
            }));
            cy.log('--------------------------------------------------');
            cy.log('Done filling out send summary email dialog. About to send...');

            // click 'Send notes'
            cy.get('@dlg').find('[sg_selector="button:send_notes"]').click();
            // Wait for the request to get sent back 
            cy.wait('@send_summary_email').then(xhr => {
                console.log(JSON.stringify(xhr, undefined, 2));
                summary_email_id = (xhr.response.body) ? xhr.response.body : null;

                // Wait for the success dialog 
                cy
                    .get('[sg_id="dialog:sgd_alert"]')
                    .should('be.visible')
                    .and('contain', 'Your notes have been imported successfully');
                // Close the dialog 
                cy.get('[sg_selector="button:close"]').click();
                // No spinners
                cy.wait_for_spinner();
                // Visit the notes app summary email 
                cy.visit(`/notes_app_summary_email/${summary_email_id}`);
                cy.wait_for_page_to_load();
                cy.get('.sgw_notes_app_summary_email_preview:visible').within(email => {
                    // Assert that the html email version matches expectations
                    cy
                        .get(email)
                        .should('contain', playlist_name)
                        .and('contain', this.version1.code)
                        .and('contain', this.version2.code)
                        .and('contain', this.version3.code)
                        .and('contain', `Note 1 @ ${name_slug}`)
                        .and('contain', `Note 2 @ ${name_slug}`)
                        .and('contain', `Note 3 @ ${name_slug}`);
                });
            });
            
            cy.log('--------------------------------------------------');
            cy.log(`All done with no errors. Email sent to ${email}`);
        });

    }); // end test case    
});