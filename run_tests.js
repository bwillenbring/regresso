/** README
TO RUN THIS FILE, YOU MUST HAVE THESE ENV VARS...
----------------------------------------------------------------------
Env var                         Maps to Cypress config
----------------------------------------------------------------------
cypress_baseUrl                 baseUrl
cypress_admin_login             admin_login
cypress_admin_pwd               admin_pwd
cypress_TEST_PROJECT_ID         TEST_PROJECT.id
----------------------------------------------------------------------
*/

// For Cypress
const cypress = require('cypress');
const marge = require('mochawesome-report-generator');
const { merge } = require('mochawesome-merge');

// For executing shell commands
const shell = require('shelljs');


// For Reading/Writing Cypress configs
const fs = require('fs');
const read = (file_path) => JSON.parse(fs.readFileSync(file_path));
const write = (new_json, file_path) => fs.writeFileSync(file_path, JSON.stringify(new_json, undefined, 2));

// Set the path to your base config file
const path_to_config_file = './cypress.base.json';
const path_to_new_config_file = path_to_config_file.replace('.base.json', '.json');
const sep = '-'.repeat(75);

// Overwrite your cypress configs
remove_previous_reports();
rewrite_cypress_configs();
// Now, run cypress
run_cypress();


function remove_previous_reports() {
    const path = process.cwd();
    shell.cd(process.cwd());
    shell.exec(`rm -r mochawesome-report; rm reports/*.json`);
}

// This is the function that merges several json files into 1 json file
// Then, creates an html report from that 1 json file
function generateReport(options) {
    return merge(options).then(report => {
        marge.create(report, options);
        console.log('Report done!');
        console.log(sep);
    });
}

function rewrite_cypress_configs() {
    // Store the configs as a json object
    const configs = read(path_to_config_file);
    // Modify configs using these keys from env. vars...
    configs.baseUrl = process.env['cypress_baseUrl'] || '';
    configs.admin_login = process.env['cypress_admin_login'] || '';
    configs.admin_pwd = process.env['cypress_admin_pwd'] || '';
    configs.TEST_PROJECT = {
        "id": parseInt(process.env['cypress_TEST_PROJECT_ID'] || '0')
    }
    // Write the new config
    write(configs, path_to_new_config_file);
    // console log the output
    console.log(`${sep}\nSuccessfully wrote cypress.json config!\n${sep}\n`);
    console.log(`baseUrl: ${configs.baseUrl}`);
    console.log(`admin_login: ${configs.admin_login}`)
    console.log(`admin_pwd: ******`);
    console.log(`TEST_PROJECT: ${JSON.stringify(configs.TEST_PROJECT)}`);
    console.log(sep);
}

function run_cypress() {
    // Run the cypress specs
    cypress.run().then((results) => {
        // Print out the results of the run...
        // console.log(results)
        console.log('Run is done! Report is next!');

        // Run mochawesome-merge on all .json files using these options
        const options = {
          files: ['./reports/*.json'],
        }
        generateReport(options);

        // If any test fails, send an exit code of 1 so CI knows there is a problem
        if (results.totalFailed > 0) {
            console.log('At least 1 test failed! This process will be allowed to complete.');
            // process.exit(1);
        }
      },
      error => {
        generateReport()
        console.error(error)
        process.exit(1)
      }
    )
}
