/**
 * @function get_translation
 * @description - Retrieves the i18n translation of a string based on its
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} keys - The json key of the item you'd like a translation string for. eg: `preferences.feature.enable_tag_list_translation`. The `keys` arg is passed to the wrapped function `i18next.t`.
 * @param {Object} Additional options. The `options` arg is passed to the wrapped function `i18next.t`.
 *
 * @returns {String} A translated string.
 *
 * @example
 * cy.get_translation('preferences.feature.enable_tag_list_translation').then(str => {
 *    assert.isTrue(str == "Translate 'tag_list' references in API calls");
 * });
 *
 * @example
 * cy.get_translation('canvas.designer.design_mode_title', { title: 'dog gonnit'}).then(str => {
 *    assert.isTrue(str == 'DESIGN MODE - dog gonnit')
 * });
 *
 */
export function get_translation(keys, options) {
    // Return i18next.t(str);
    cy.window().its('i18next').invoke('t', keys, options);
}
