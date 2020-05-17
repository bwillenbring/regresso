/**
 * @function login_as(role='admin')
 *
 * @description Logs in to the web app by posting a request to `/user/login`. In most cases, one should use {@link login_admin cy.login_admin()}.
 * <ul>
 * <li>Regardless of passed-in value of `role`, this command <u>always uses the configured admin username and password</u></li>
 * <li>Will create a web session token that is distinct from the REST API token, and has different expiry characteristics</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} role=admin - The role.
 *
 * @example
 * // Login as the admin
 * cy.login_as('admin');
 * // Then navigate somewhere
 * cy.navigate_to_project_page('Shot');
 *
 */
Cypress.Commands.add('login_as', role => {
    cy
        .request({
            method: 'POST',
            url: '/user/login',
            form: true,
            followRedirect: true, // turn on/off following redirects
            body: {
                'user[login]': Cypress.config('admin_login'),
                'user[password]': Cypress.config('admin_pwd'),
                ignore_browser_check: 1,
            },
        })
        .then(resp => {
            //Go home
            let csrf_name = 'csrf_token_u' + Cypress.config('admin_id');
            cy.getCookies().then(cookies => {
                for (const idx in cookies) {
                    if (cookies[idx].name.startsWith('csrf_token_u')) {
                        console.log('Cookie value of ' + csrf_name + '=' + cookies[idx].value);
                        Cypress.config(csrf_name, cookies[idx].value);
                        return;
                    }
                }
                throw new Error('Could not find a csrf token value!');
            });
            cy.getCookie('_session_id').then(cookie => {
                // console.log('_session_id Cookie value of ' + cookie.value);
                Cypress.config('_session_id', cookie.value);
            });
        });
});

Cypress.Commands.add('ui_login_as', role => {
    cy.visit('/user/login');
    switch (role) {
        case 'admin':
        default:
            cy.get('#user_login').type(Cypress.config('admin_login'));
            cy.get('#user_password').type(Cypress.config('admin_pwd'));
            break;
    }
    //Submit
    cy.get('form.sg_reset_form').submit().then(() => {
        //Get the schema
    });
    cy.url().should('not.contains', '/user/login', "You're no longer on the login page.");
});

// This ensures that your session and cookies are destroyed
// It should be invoked prior to the running of each test case
Cypress.Commands.add('logout', function() {
    cy.request('/user/logout').then($resp => {
        assert.isTrue($resp.status == 200, 'Logout good!');
    });
});

// dismiss the term of use
Cypress.Commands.add('ToU_agreement', (user, password) => {
    // / Get the current url
    cy.url().then(resp => {
        if (resp.includes('terms_agreement')) {
            // Wait for the modal terms checkbox input selector
            cy.wait_for('#termsAgreementCheckbox').click({ force: true });
            // Click the Accept button
            cy.wait_for('[id="termsAgreementAcceptButton"]').click();
            // Confirm that navigation away from the modal terms dialog has occurred
            cy.url().should('not.contains', '/terms_agreement');
        }
    });
});

// dismiss the profile_data page
Cypress.Commands.add('profile_data_page', (user, password) => {
    // Get the current url
    cy.url().then(url => {
        // Test for the presence of the profile data dialog
        if (url.includes('profile_data')) {
            cy.get('[id="profileDataRoleSelect"]').should('be.visible');
            cy.wait_for('[id=profileDataRoleDeclineButton]').click();
            // Ensure that the click has resulted in navigation away from the profile data page
            cy.url().should('not.contains', '/profile_data');
        }
    });
});

// Log in through UI
Cypress.Commands.add('uiSignIn', (user, password) => {
    cy.get('input[id=user_login]').type(user);
    cy.get('input[id=user_password]').type(password);
    cy.get('[name="commit"]').contains('Sign in').click();
    // Ensure that the current url is no longer the login form
    cy.url().should('not.contains', '/user/login', "You're no longer on the login page.");
    // Handle the possibility of the Terms & Agreement modal form
    cy.ToU_agreement();
    // Handle the possibility of the Profile Data
    cy.profile_data_page();
    cy.url().then(url => {
        if (!url.includes('welcome_render')) {
            // Validating Global nav componnents
            cy.get('[sg_id=GlblNv] [sg_selector=shotgun_logo]').should('be.visible');
            cy.get('[sg_id=GlblNv] [sg_selector=my_tasks]').should('be.visible');
        }
    });
});

// Log out through UI
Cypress.Commands.add('uiSignOut', (vendor = false) => {
    cy.get('[sg_id=GlblNv] [sg_selector=inbox]').should('be.visible');
    cy.get('[sg_id=GlblNv]').then($GlblNv => {
        if ($GlblNv.has('[sg_selector=button\\:user_account]').length != 0) {
            // Most user log out got throught these steps
            cy.wait_for('[sg_id=GlblNv:UsrAccntMnBttn] [sg_selector=button:user_account]').click();
            cy.wait_for('[sg_id=GlblNv:UsrAccntMnBttn:Mn] [sg_selector="menu:about"]').should('be.visible');
            cy.wait_for('[sg_id=GlblNv:UsrAccntMnBttn:Mn] [sg_selector=menu:sign_out]').click();
        } else if ($GlblNv.has('[sg_selector=button:user_account]').length === 0) {
            // Vendor log out
            cy.get('[sg_id="GlblNv"] [sg_selector="nav:logout"]').click();
        }
    });
    cy.get('input[id=user_login]').should('be.visible');
    cy.get('input[id=user_password]').should('be.visible');
    cy.get('[name="commit"]').contains('Sign in').should('be.visible');
});

/**
 * @function login_admin
 * @description Logs in to the web app by posting a request to `/user/login`, and resets `Cypress.config('admin_id')`` based on the cookie value returned by Shotgun.
 *
 * By default, it will persist the session so that subsequent calls to login are not needed in between test cases. This command is preferable to {@link login_as cy.login_as('admin')} in almost all cases, and should be used instead.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Boolean} persist=true - Whether or not to persist the session in this manner...
 * ```
 * Cypress.Cookies.defaults({
 *    whitelist: ['_session_id', `csrf_token_u${Cypress.config('admin_id')}`],
 * });
 * ```
 *
 * @example
 * describe('Test Suite', function() {
 *     before(function() {
 *         // Login as admin and also persist your session (default behavior)
 *         cy.login_admin();
 *     });
 *
 *     // Now, there is no need to login over and over betweent test cases
 *
 *     it('Visit home page', function() {
 *         cy.home();
 *     });
 *
 *     it('Visit Shots Page', function() {
 *         cy.navigate_to_project_page('Shot');
 *     })
 *
 *     it('Set page to list mode', function() {
 *         cy.set_page_mode('list');
 *     })
 *
 *     it('Run a quick filter on boo', function() {
 *         cy.run_quick_filter('boo');
 *     })
 *
 *     it('Clear the quick filter', function() {
 *         cy.clear_quick_filter();
 *     })
 * });
 *
 * @example
 * // Do this if you DON'T want your session cookies persisted
 * cy.login_admin(false);
 *
 */
Cypress.Commands.add('login_admin', function(persist = true) {
    cy
        .request({
            method: 'POST',
            url: '/user/login',
            form: true,
            followRedirect: true, // turn on/off following redirects
            body: {
                'user[login]': Cypress.config('admin_login'),
                'user[password]': Cypress.config('admin_pwd'),
                ignore_browser_check: 1,
            },
        })
        .then(resp => {
            // There are 2 important cookies to retrieve
            // 1. csrf_token_u{number}
            // 2. _session_id
            cy.getCookies().then(cookies => {
                // Locate the cookie whose name starts with csrf_token_u
                for (const idx in cookies) {
                    if (cookies[idx].name.startsWith('csrf_token_u')) {
                        // let csrf_name = 'csrf_token_u' + Cypress.config('admin_id');
                        let csrf_name = cookies[idx].name;
                        // Derive the user's id from the cookie name (rather than blindly trusting cypress.json config)
                        let id = Number(csrf_name.replace('csrf_token_u', ''));
                        // Reset the Cypress.config('admin_id') to the real value as determined by the login - not the config
                        Cypress.config('admin_id', id);
                        cy.log('Admin id==' + id);
                        Cypress.config(csrf_name, cookies[idx].value);
                        return;
                    }
                }
                throw new Error('Could not find a csrf token value!');
            });
            // Set _session_id
            cy.getCookie('_session_id').then(cookie => {
                Cypress.config('_session_id', cookie.value);
            });
        })
        .then(() => {
            if (persist == true) {
                // Persist the session-related cookies so that a login is not required in between test cases
                Cypress.Cookies.defaults({
                    whitelist: ['_session_id', `csrf_token_u${Cypress.config('admin_id')}`],
                });
            }
        });
});

/**
 * @function login_manager
 * @description Logs in to the web app as a default manager user whose login == `shotgun_manager`. 
 *   - If no such user exists, the user will be created on the spot (via ruby console) with all of the correct defaults, and login will succeed
 *   - If the user is found, all of that user's attributes will be reset (via ruby console) to the correct defaults, and login will succeed
 *   - Examples of defaults not listed in params: 
 *      - Projects = [Configured Cypress Template Project]
 *      - Welcome Page = Bypassed
 *      - Profile Dialog = Bypassed
 *      - Terms Agreement Dialog = Bypassed
 *      - Forced to Change Password at Next Login = Bypassed
 *   - Custom commands that directly send requests to Shotgun using csrf_token (ie: getting and setting prefs) will inherit Manager permissions
 *   - Note: login happens by temporarily overwriting the configured admin's credentials with those of the default manager, then by calling {@link login_admin}.
 * @param {Object} props - Destructured arguments, all of which have default values.  
 * @param {string} [props.manager_name=Shotgun Manager] - The full name attribute.
 * @param {string} [props.manager_login=shotgun_manager] - The login of the manager.
 * @param {string} [props.manager_pwd=Manager.12345] - The full name attribute.
 * @param {string} [props.manager_email=shotgun_manager@shotgunsoftware.com] - The email attribute.
 *
 * @example
 * cy.login_manager();
 * // Now visit a page as a manager user
 * cy.navigate_to_project_page('Shot');
 *
 */
Cypress.Commands.add('login_manager', function(
    {
        manager_name = 'Shotgun Manager',
        manager_login = 'shotgun_manager',
        manager_pwd = 'Manager.12345',
        manager_email = 'shotgun_manager@shotgunsoftware.com',
    } = {}
) {
    let statement;
    // Construct your ruby console snippet that creates or resets the manager
    cy.ruby_console_do(`h = HumanUser.find_by_login('${manager_login}'); h ? h.id : puts("false")`).then(val => {
        cy.log('val...', val);
        console.log(val);
        if (!Cypress.$.isNumeric(val)) {
            cy.log('Creating shotgun_manager with default attributes...');
            statement = `h = HumanUser.new(:name => '${manager_name}', :login => '${manager_login}', :email => '${manager_email}', :permission_rule_set => PermissionRuleSet.find_by_code('manager'), :sg_status_list => 'act', :projects => [Project.find_by_id(${Cypress.config(
                'TEST_PROJECT'
            )
                .id})], :welcome_page_visited => true, :locked_until => nil, :profile_data_page_visited => true, :terms_agreement_date => '2018-12-04 00:12:01', :verified => 1, :retirement_date => nil, :password_temp => nil, :password_proxy => '${manager_pwd}', :password_set => true, :password_change_next_login => false, :password_change_reason => nil); h.id`;
        } else {
            cy.log('Found user shotgun_manager. Resetting all attributes...');
            statement = `h = HumanUser.find_by_login('${manager_login}'); h.attributes =  {name: '${manager_name}', email: '${manager_email}', permission_rule_set: PermissionRuleSet.find_by_code('manager'), sg_status_list: 'act', projects: [Project.find_by_id(${Cypress.config(
                'TEST_PROJECT'
            )
                .id})], welcome_page_visited: true, locked_until: nil, profile_data_page_visited: true, terms_agreement_date: '2018-12-04 00:12:01', verified: 1, retirement_date: nil, password_temp: nil, password_proxy: '${manager_pwd}', password_set: true, password_change_next_login: false, password_change_reason: nil}; h.save; h.id`;
        }

        // Execute your create or update ruby statement
        cy.ruby_console_do(statement).then(val => {
            cy.log(`Default Manager id=${val}`);
            // Set manager credentials as the admin credentials
            const manager_id = Number(val);
            Cypress.config('admin_id', manager_id);
            Cypress.config('admin_login', 'shotgun_manager');
            Cypress.config('admin_pwd', manager_pwd);
            // Then login as the manager by calling cy.login_admin()
            cy.login_admin();
        });
    });
});
