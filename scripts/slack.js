// For slack messaging 
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
// For parsing command line args
const args = require('yargs').argv;
const sep = '-'.repeat(75);

module.exports = {
    build_block: ({
        text='...',
        type='text'
    } = {}) => {
        switch (type) {
            case 'context':
                // --------------------------------------------------
                // Context 
                return {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: text.toString()
                        }
                    ]
                }
                break;

            case 'divider':
                // --------------------------------------------------
                // Divider
                return { type: 'divider' }
                break;

            default:
                // --------------------------------------------------
                // Text 
                return {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: text.toString() || 'Cannot read item string'
                    }
                }
                break;
        }
    },
    notify: async({
        msg='Greetings from Regresso!',
        salutation='You have a message!'
        recipient=null,
        testResults=null
    }={}) => {
        // Begin forming Slack Message
        const url = process.env['slack_webhooks_url'];
        // Compose the message, using Slack's block kit
        const header = module.exports.build_block({ text: msg });
        const divider = module.exports.build_block({ type: 'divider'});
        // Compose the header and divider only 
        const blocks = [header, divider];
        // Add on the content
        if (testResults) {
            const results = await module.exports.format_results(testResults) || 'Could not format results!';
            results.forEach(r => {
                let block = module.exports.build_block({ type: 'context', text: r});
                blocks.push(block, divider);
            });
        }
        // -----
        // Compose the message request
        data = {
            channel: recipient, 
            text: 'Hi!',
            blocks: blocks,
        }
        console.log(JSON.stringify(data, undefined, 2));
        // Send the slack message 
        axios
            .post(url, data)
            .catch((err) => {
                console.log(`Something went wrong! See error message below:\n${err.message}\n${sep}`);
            })
            .then(r => {
                if (r.status == 200) {
                    console.log('Slack message sent!');
                }
            });
    },
    get_shotgun_version: async (url) => {
        let promise = new Promise((resolve, reject) => {
            axios.get(`${url}/api/v1`).then(r => {
                resolve(r.data.data.shotgun_version)
            });
        });

        let version = await promise;
        return version;
    },
    read_results: () => {
        const results = JSON.parse(fs.readFileSync('results.json'));
        return results;
    },
    format_results: async (results) => {
        // const results = module.exports.read_results();
        const url = results.config.baseUrl;
        const shotgun_version = await module.exports.get_shotgun_version(url);
        const config = results.config;
        const runs = results.runs;
        const suite_status = results.totalFailed === 0 ? ':successful: Pass' : ':failed: Fail';
        // High level + Stats 
        const info = [];
        // Details 
        const details = [];
        // ----------
        delete(results.config);
        // console.log(results);
        // ----------
        // High level + Stats
        info.push(`*Shotgun Site*: ${config.baseUrl}`);
        info.push(`*Shotgun Version:* ${shotgun_version}`);
        info.push(`*Cypress Version:* ${results.cypressVersion}`);
        info.push(`*Browser:* ${_.startCase(results.browserName)} ${results.browserVersion}`);
        info.push(`*Total Tests:* ${results.totalTests}`);
        info.push(`*Total Passed:* ${results.totalPassed}`);
        info.push(`*Total Failed:* ${results.totalFailed}`);
        info.push(`*Total Time:* ${module.exports.format_milliseconds(results.totalDuration)}`);
        info.push(`*Status:* ${suite_status}`);
        // ----------
        // Test Case Titles...
        let c = 1;
        for (let i=0; i < runs.length; i++) {
            const run = runs[i];
            const spec = run.spec;
            details.push("`" + spec.relative + "`");
            for (let j=0; j< run.tests.length; j++) {
                const test = run.tests[j];
                const title = test.title;
                let display_title = '';                
                if (title.length > 1) {
                    display_title = `${title[0]} => ${title.pop()}`
                } else {
                    display_title = title[0] || title.toString();
                }
                details.push(`  ${c}. ${display_title}`);
                c++;
            }
        }

        // ----------
        // Return a 2-item array
        return [info.join('\n'), details.join('\n')];
    },
    format_milliseconds: (ms) => {
        let str_time = '';
        let min = moment(ms).format('m');
        let sec = moment(ms).format('s');
        let frac = moment(ms).format('SS');
        if (min == '0') {
            return `${sec}.${frac} seconds`;
        }
        else {
            return `${min} min ${sec}.${frac} sec`;
        }
    }
}

if (args.recipient && args.msg) {
    const params = {
        recipient: args.recipient,
        msg: msg
    }
    if (args.salutation) params.salutation = args.salutation;
    module.exports.notify(params);
}