import { isSitePreferencesPage } from './shotgun_app/site_preferences';
/* ------------------------------------------------------------------------------------------------------

Navigation-related commands
Clicking tabs, buttons, etc.

------------------------------------------------------------------------------------------------------ */

/**
 * Navigates to the configured home page.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example <caption>Simple</caption>
 * // Login, then go Home
 * cy.login_as('admin');
 * cy.home();
 *
 */
Cypress.Commands.add('home', () => {
    cy.navigate_to_page('');
});

/**
 * @function navigate_to_page
 * @description Navigates to a Shotgun page. Does some pre-checks, wraps `cy.visit()`, and ensures that the page is ready after navigation has occurred.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} page - The portion of the Shotgun URL excluding the `baseUrl`. Examples below.
 *
 * @example
 * // Go to the main projects page
 * cy.navigate_to_page('/projects/');
 *
 * // Account Settings
 * cy.navigate_to_page('/page/account_settings')
 *
 * // Page 882
 * cy.navigate_to_page('/page/882')
 *
 */
Cypress.Commands.add('navigate_to_page', (page = '', onLoad = null) => {
    // Visit the page
    cy.visit(page, {
        onLoad: win => {
            // If there is an onLoad function passed in, call it
            if (onLoad) {
                onLoad();
            }
        },
        retryOnStatusCodeFailure: true,
    });

    // Simply wait for the document.readyState
    cy.waitUntil(() => cy.document().its('readyState').should('eq', 'complete'));
    // Call wait for spinner - if no spinners exist, this call will not fail
    cy.wait_for_spinner();
});

/**
 * @function navigate_to_project_page
 *
 * @description Navigates to an official Project entity query page for the given `entity_type` within the configured `TEST_RPOJECT`. It does this by calling `cy.navigate_to_page` and passing in the following param:
 * ```
 * '/page/project_default?entity_type=' + entity_type + '&project_id=' + Cypress.config('TEST_PROJECT').id;
 * ```
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type in singular form.
 *
 * @example
 * // Shots page without knowing the id in advance
 * cy.navigate_to_project_page('Shot');
 *
 // Go to the Tasks page
 * cy.navigate_to_project_page('Task');
 */
Cypress.Commands.add('navigate_to_project_page', entity_type => {
    //url = "%s/page/project_default?entity_type=%s&project_id=%s" % (qa.site, entity_type, project_id)
    let redirect = false;
    let url = '/page/project_default?entity_type=' + entity_type + '&project_id=' + Cypress.config('TEST_PROJECT').id;
    if (entity_type === 'Media' || entity_type === 'media') {
        url = '/page/media_center?&project_id=' + Cypress.config('TEST_PROJECT').id;
    }
    let failOnStatusCode;
    cy.log('navigating to...' + url);
    cy.navigate_to_page(url);
});

/**
 * @function wait_for_spinner
 * @description Defensively checks to see if the page is loaded, and if necessary, reloads it. If the page is loaded, it will waits for the spinner to go away.
 * <ul>
 * <li>First, make an assertion that the spinner is not visible - eg: <br/>`cy.get('[data-cy="overlay-spinner"]').should('not.be.visible')`<br/><br/></li>
 * <li>Next, If the page has no global nav, or there is no text content...
 * <ul>
 * <li>call `cy.reload()` - and take no further defensive actions</li>
 * <li>Otherwise, call `grid.hide_loading_overlay()` - and take no further defensive actions</li>
 * </ul>
 * </li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * cy.wait_for_spinner();
 *
 */
Cypress.Commands.add('wait_for_spinner', (timeout = 60000) => {
    // Use waitUntil to safely check that all spinners are gone
    cy.waitUntil(() => Cypress.$('[data-cy="overlay-spinner"]:visible').length === 0, {
        timeout: timeout,
        interval: 2000,
    });
});

/**
 * @function global_nav
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 * @description Clicks common global nav elements by building a selector from the passed in param `item`, and mapping it to an items dictionary of allowed values.
 *
 * **How `item` maps to a selector**
 * ```
 * let items = {
 *     home: 'shotgun_logo',
 *     inbox: 'inbox',
 *     my_tasks: 'my_tasks',
 *     media: 'media',
 *     projects: 'projects_popover_button',
 *     pages: 'global_pages_overlay_button',
 *     people: 'people_button',
 *     apps: 'apps_button',
 *     user_thumbnail: 'button:user_account',
 *     plus_button: 'plus_button',
 *     plus: 'plus_button',
 *     plus_btn: 'plus_button',
 *     '+': 'plus_button',
 * };
 * cy.get("[sg_selector='" + items[item] + "']").click();
 * ```
 *
 * @param {String} item - The human-readable string that corresponds to commonly clicked on items in the global nav.
 *
 * @example
 * cy.global_nav('plus_button');
 *
 */
Cypress.Commands.add('global_nav', (item = 'plus_button') => {
    // cy.wait_for_spinner()
    let items = {
        home: 'shotgun_logo',
        inbox: 'inbox',
        my_tasks: 'my_tasks',
        media: 'media_center',
        projects: 'projects_popover_button',
        pages: 'global_pages_overlay_button',
        people: 'people_button',
        apps: 'apps_button',
        user_thumbnail: 'button:user_account',
        plus_button: 'plus_button',
        plus: 'plus_button',
        plus_btn: 'plus_button',
        '+': 'plus_button',
    };
    cy.get(`[sg_id="GlblNv"] [sg_selector="${items[item]}"]`).click();
});

Cypress.Commands.add('go_to_site_preferences', showHiddenPreferences => {
    // Navigate to the site preferences page
    cy.get('[sg_id="GlblNv:UsrAccntMnBttn"]').click();
    cy
        .get('[sg_selector="menu:site_preferences"]')
        .should('be.visible')
        .then(menuItem => {
            if (showHiddenPreferences) {
                // We need to backtrack to the first anchor that wraps the span which contains the title 'Site Preferences'
                // this is only nececessary if showing the hidden preferences.
                const anchor = menuItem.closest('a');
                anchor.attr('href', anchor.attr('href') + '?hidden_prefs_visible');
            }
        })
        .click();

    isSitePreferencesPage();
});

Cypress.Commands.add('save_site_preferences', () => {
    isSitePreferencesPage();

    // There are two save buttons on the Site Preferences page.
    cy.get('[sg_selector="button:save_changes"]').first().scrollIntoView().click();

    // Ensure the page saved
    cy.wait_for_page_to_load().then(() => {
        cy.get('[sg_selector="label:feedback_success"]').first().then(saveLabel => {
            cy.get_translation('site_prefs.update_success_msg').then(saveMessage => {
                expect(saveLabel.text()).to.eq(saveMessage);
            });
        });
    });
});

/**
 * example:
 * set_create_project_admin_permissions('Admin', 'Entity Permissions', '[sg_selector="checkbox:Project_create_admin"]', 'checkbox_checked');
 */
Cypress.Commands.add('set_permission_checkbox', (group, section, checkbox_selector, status) => {
    cy.get('[sg_id="GlblNv:UsrAccntMnBttn"]').click();
    cy.get('[sg_selector="menu:permissions_-_people"]').click();
    cy.contains(group).click();
    cy.contains(section).click();
    cy.get(checkbox_selector).then($chk => {
        if (!$chk.hasClass(status)) {
            $chk.click();
            cy.contains('Save Changes').click();
            cy.wait_for_page_to_load();
        }
    });
});

const rgb_to_array = rgb => {
    const comps = rgb.substring(rgb.indexOf('(') + 1, rgb.length - 1).split(', ');
    return {
        r: comps[0],
        g: comps[1],
        b: comps[2],
        a: comps[3] || 1,
    };
};

const is_dark_color = color => {
    const rgba = rgb_to_array(color);
    //http://www.w3.org/TR/AERT#color-contrast
    const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000;
    return brightness < 128;
};

/**
 * cy.test_element_text_color_with_theme('.some_selector', 'default')
 * cy.test_element_text_color_with_theme('.some_selector', 'dark')
 */
Cypress.Commands.add('test_element_text_color_with_theme', (themed_element, theme = 'default') => {
    cy.window().then(win => {
        cy.get(`${themed_element}`).then($el => {
            cy.log(win.getComputedStyle($el[0]).color);

            const textColor = win.getComputedStyle($el[0]).color;

            // textColor should be dark if light theme, light if dark theme
            expect(is_dark_color(textColor)).to.equal(theme === 'default');
        });
    });
});

/**
 * cy.assert_theme('light') // 'light' === 'default'
 * cy.assert_theme('dark')
 */
Cypress.Commands.add('assert_theme', (theme = 'default') => {
    if (theme === 'default' || theme === 'light') {
        // assert light
        cy.get('html').should('have.class', 'sgds-theme-root--default');
        cy.get('body').should('not.have.class', 'sg_dark_theme');
    } else if (theme === 'dark') {
        // assert dark
        cy.get('html').should('have.class', 'sgds-theme-root--dark');
        cy.get('body').should('have.class', 'sg_dark_theme');
    }
});

/**
 * @function sg_get
 * @description Like cy.get, but using Shotgun's selectors.
 *
 * **How to select a widget via cy.get, and via cy.sg_get
 * ```
 * // cy.get
 * cy.get('[sg_id="page:root_widget:ActvtyStrm:ActvtyStrmUpdtRndrrFctry:ActvtyStrmNtUpdtRndrr:NtThrdMngr:ActvtyStrmNtThrd"] [sg_selector="label:reply_textarea"]')
 *
 * // cy.sg_get
 * cy.sg_get('page:root_widget:ActvtyStrm:ActvtyStrmUpdtRndrrFctry:ActvtyStrmNtUpdtRndrr:NtThrdMngr:ActvtyStrmNtThrd', 'label:reply_textarea')
 * ```
 *
 * @param {String} id - The string that corresponds to parent widget's sg_id in the DOM
 * @param {String} selector - The string that corresponds to the target element's selector in the DOM
 * @param {String} menu_item_id - The string that corresponds to the target element's menu_item_id in the DOM
 */
Cypress.Commands.add('sg_get', (id, selector, menu_item_id) => {
    let full_selector = '';

    if (id) {
        full_selector += '[sg_id="' + id + '"]';
    }

    if (selector) {
        full_selector += ' [sg_selector="' + selector + '"]';
    }

    if (menu_item_id) {
        full_selector += ' [sg_menu_item_id="' + menu_item_id + '"]';
    }

    cy.get(full_selector);
});
