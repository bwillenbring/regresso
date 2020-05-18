// For slack messaging 
const axios = require('axios');
const sep = '-'.repeat(75);

const notify = () => {
    const url = process.env['slack_webhooks_url'];
    // Compose the message, using Slack's block kit
    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: ":successful: Message was a success!"
            }
        }
    ]
    // Compose the message request
    data = {
        channel: '@willenb', 
        blocks: blocks,
    }

    console.log(data);
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
}

notify();
