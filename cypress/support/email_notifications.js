// TODO: Document this function
export function get_mail_catcher_url() {
    if (Cypress.config('baseUrl').includes(':8888')) {
        // You're running locally
        return Cypress.config('baseUrl').replace(':8888', ':1080');
    } else {
        // You're in CI - the URL of mailcatcher is based off its docker-compose service name
        return 'http://smtp:1080';
    }
}

const mailCatcherUrl = get_mail_catcher_url();

// TODO: Document this function
export function enable_email_notifications(
    { type = 'email_notifier', event_service_url = 'http://eventservice:3000' } = {}
) {
    /*
    Documentation for enabling Email by Event Pipeline here:
    https://wiki.autodesk.com/display/SHOT/BBD+-+Email+Pipeline#BBD-EmailPipeline-ActivatingEventPipelineEmailNotifications
    */

    // As a precaution, first enable Email Notifications in general
    cy.update_preference({ data: { email_notifications: 'yes' } }).then(() => {
        // Always do this - if email notifier is being used, this is good enough
        // Disable the Event Pipeline and Email by Event Pipeline
        cy
            .update_preference({
                data: {
                    enable_event_pipeline: 'no',
                    enable_email_by_event_pipeline: 'no',
                },
            })
            .then(() => {
                if (type !== 'email_notifier') {
                    // 1. Set Event Service URL
                    cy.update_preference({ data: { event_service_url: event_service_url } });
                    // 2. Enable Event Pipeline
                    cy.update_preference({ data: { enable_event_pipeline: 'yes' } });
                    // 3. Enable Email Service by Event Pipeline
                    cy.update_preference({ data: { enable_email_by_event_pipeline: 'yes' } });
                }
            });
    });
    Cypress.config('email_notifications_type', type);
    cy.log(`Enabled email notifications with type=${type}`);
}

// TODO: DELETE this function, and replace with cy.fetch_message_by_params()
// Only referenced in 1 spec: email_notifications_classic_spec.js
export function fetch_message_by_subject({ subject = '', createdAfter = null, timeout = 75000, interval = 5000 } = {}) {
    let message;
    cy.waitUntil(() => cy.message_by_subject_exists(subject), {
        errorMsg: `Waiting for ${subject}`,
        timeout: timeout,
        interval: interval,
    });
    cy.log(`Found a Mail Catcher message with subject matching: ${subject}`);
    cy
        .fetch_messages()
        .then(messages => {
            message = Cypress._.filter(messages, function(o) {
                // Match the subject
                if (o.subject.includes(subject)) {
                    console.log('SUBJECT');
                    return o;
                }
            });
        })
        .then(() => {
            // Make a simple GET request to get the message body...
            return cy.request(`${mailCatcherUrl}/messages/${message[0].id}.html`).its('body');
        });
}

// TODO: // TODO: DELETE this function after cy.fetch_message_by_subject is deleted
export function message_by_subject_exists(subject) {
    let filtered_messages;
    cy
        .fetch_messages()
        .then(messages => {
            filtered_messages = Cypress._.filter(messages, function(o) {
                if (o.subject.includes('Note')) {
                    console.log(JSON.stringify(o, undefined, 2));
                }
                if (o.subject.includes(subject)) {
                    return o;
                }
            });
        })
        .then(() => {
            return filtered_messages.length > 0;
        });
}

// TODO: Document this function
export function display_message_html(html) {
    // Render the given html into the current page's html tag
    cy.get('html').invoke('html', html);
}

// TODO: Document this function
export function clear_messages() {
    cy
        .request('DELETE', `${mailCatcherUrl}/messages`)
        .its('status')
        .should('eq', 204, 'Deleted all previous mailcatcher messages.');
}

// TODO: Document this function
export function fetch_messages() {
    return cy.request(`${mailCatcherUrl}/messages`).its('body');
    /*
    Returns an array of messages like this...
    [{
        "id": 1,
        "sender": "<shotgun@shotgunlocalhost.com>",
        "recipients": ["<ben.artist@gmail.com>"],
        "subject": "Testing  (Email Notifs 1579212683985)",
        "size": "4224",
        "created_at": "2020-01-16T22:11:40+00:00"
    }, {
        "id": 2,
        "sender": "<shotgun@shotgunlocalhost.com>",
        "recipients": ["<ben.artist@gmail.com>"],
        "subject": "Shotgun's Note on Query Fields 1579118858346 [Links: Project Query Fields 1579118858346] (Query Fields 1579118858346)",
        "size": "4842",
        "created_at": "2020-01-16T22:19:46+00:00"
    }]
    */
}

// TODO: Document this function
export function message_by_params_exists({ subject = '', recipient = '' } = {}) {
    // Begin function...
    let filtered_messages;
    cy
        .fetch_messages()
        .then(messages => {
            filtered_messages = Cypress._.filter(messages, function(o) {
                if (subject && recipient) {
                    let recipient_found = Cypress._.filter(o.recipients, function(p) {
                        return p.includes(recipient);
                    });
                    if (recipient_found && o.subject.includes(subject)) {
                        return o;
                    }
                } else if (subject) {
                    return o.subject.includes(subject);
                } else {
                    return false;
                }
            });
        })
        .then(() => {
            // Return true | false
            // return filtered_messages.length > 0;
            if (filtered_messages.length > 0) {
                return filtered_messages[0];
            } else {
                return false;
            }
        });
}

// TODO: Document this function
export function fetch_message_by_params(
    { subject = '', recipient = '', timeout = 75000, interval = 500, returnType = 'html' || 'json' } = {}
) {
    // Begin function...
    let message;
    cy.waitUntil(
        () =>
            cy.message_by_params_exists({
                subject: subject,
                recipient: recipient,
            }),
        {
            errorMsg: `Waiting for ${subject}`,
            timeout: timeout,
            interval: interval,
        }
    );

    cy.log(`Found a Mail Catcher message with params that match: ${subject}`);
    cy
        .fetch_messages()
        .then(messages => {
            message = Cypress._.filter(messages, function(o) {
                // Match the subject
                if (o.subject.includes(subject) && recipient && o.recipients.find(any => any.includes(recipient))) {
                    return o;
                } else if (o.subject.includes(subject)) {
                    return o;
                }
            });
        })
        .then(() => {
            // Make a simple GET request to get the message body...
            if (returnType == 'json') {
                return message;
            } else {
                return cy.request(`${mailCatcherUrl}/messages/${message[0].id}.html`).its('body');
            }
        });
}

// TODO: Document this function
export function set_email_notifications_for_user(
    {
        user_id = {},
        email_all_deliveries = false,
        email_all_notes = false,
        email_all_security = false,
        email_all_tasks = false,
        email_all_tickets = false,
        email_all_versions = true,
        email_deliveries = false,
        email_inbox_notes = false,
        email_inbox_general = false,
        email_notes = false,
        email_tasks = false,
        email_tickets = false,
        email_versions = false,
        email_version_link_cc = false,
    } = {}
) {
    // Set the User's email notifications subscriptions (which all default to unchecked)
    cy.edit_entity('HumanUser', user_id, {
        email_all_deliveries: email_all_deliveries,
        email_all_notes: email_all_notes,
        email_all_security: email_all_security,
        email_all_tasks: email_all_tasks,
        email_all_tickets: email_all_tickets,
        email_all_versions: email_all_versions,
        email_deliveries: email_deliveries, // My Deliveries
        email_inbox_notes: email_inbox_notes, // My Inbox Note Emails
        email_inbox_general: email_inbox_general, // My Inbox Update Emails
        email_notes: email_notes, // Classic => My Notes
        email_tasks: email_tasks, // Classic => My Tasks
        email_tickets: email_tickets, // Classic => My Tickets
        email_versions: email_versions, // Classic => My Versions
        email_version_link_cc: email_version_link_cc, // Classic => Version Emails for Cc'd Link
    });
}

// TODO: Create helper function to trigger a client review site share
export function create_client_review_site_share(
    {
        project = { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
        email_message = 'Test Share',
        playlist = {},
        user = {}, // ClientUser
    } = {}
) {}
