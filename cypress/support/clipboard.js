/**
 * Simulates a paste event.
 *
 * @param subject A jQuery context representing a DOM element.
 * @param pasteOptions Set of options for a simulated paste event.
 * @param pasteOptions.pastePayload Simulated data that is on the clipboard.
 * @param pasteOptions.simple Determines whether or not to use a simple paste. Use this when there is no paste event bound to the element resolved by the selector.
 * @param pasteOptions.pasteFormat The format of the simulated paste payload. Default value is 'text'.
 *
 * @returns The subject parameter.
 *
 * @example
 * cy.get('[sg_id="Imprtr:ImprtrGtDt"] [sg_selector="drop_area"]').paste({
 *  pastePayload,
 *  simple: false,
*  });
 */
export function paste(subject, { pastePayload, simple = true, pasteType = 'text' }) {
    const [pasteDestination] = subject;

    if (simple) {
        if (!('value' in pasteDestination)) {
            throw new Error('simple paste is only for form elements that have a value property.');
        }

        pasteDestination.value = pastePayload;
        return;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    const pasteEvent = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
        clipboardData: {
            getData: (type = pasteType) => pastePayload,
        },
    });
    pasteDestination.dispatchEvent(pasteEvent);

    return subject;
}
