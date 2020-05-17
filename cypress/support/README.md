<h1>66 Documented Custom Cypress Commands</h1><ol><li><a href="#clear_quick_filter">clear_quick_filter</a></li><li><a href="#clear_thumbnail">clear_thumbnail</a></li><li><a href="#conditionally_create">conditionally_create</a></li><li><a href="#create_entity">create_entity</a></li><li><a href="#create_field">create_field</a></li><li><a href="#create_query_field">create_query_field</a></li><li><a href="#delete_entity">delete_entity</a></li><li><a href="#delete_field">delete_field</a></li><li><a href="#disable_custom_entity">disable_custom_entity</a></li><li><a href="#display_fields_in_grid">display_fields_in_grid</a></li><li><a href="#edit_entity">edit_entity</a></li><li><a href="#edit_field_in_grid">edit_field_in_grid</a></li><li><a href="#expand_pref_section">expand_pref_section</a></li><li><a href="#field_exists">field_exists</a></li><li><a href="#get_SG">get_SG</a></li><li><a href="#get_access_token">get_access_token</a></li><li><a href="#get_entity">get_entity</a></li><li><a href="#get_field_by_display_name">get_field_by_display_name</a></li><li><a href="#get_grid">get_grid</a></li><li><a href="#get_page">get_page</a></li><li><a href="#get_page_id_by_name">get_page_id_by_name</a></li><li><a href="#get_preference">get_preference</a></li><li><a href="#get_preferences">get_preferences</a></li><li><a href="#get_prefs_page_id">get_prefs_page_id</a></li><li><a href="#get_rest_endpoint">get_rest_endpoint</a></li><li><a href="#get_rest_endpoint_should">get_rest_endpoint_should</a></li><li><a href="#get_translation">get_translation</a></li><li><a href="#global_nav">global_nav</a></li><li><a href="#handle_menu_item">handle_menu_item</a></li><li><a href="#invoke_dlg_configure_field">invoke_dlg_configure_field</a></li><li><a href="#invoke_dlg_manage_columns">invoke_dlg_manage_columns</a></li><li><a href="#invoke_dlg_manage_fields">invoke_dlg_manage_fields</a></li><li><a href="#invoke_dlg_manage_steps">invoke_dlg_manage_steps</a></li><li><a href="#invoke_new_entity_form">invoke_new_entity_form</a></li><li><a href="#login_admin">login_admin</a></li><li><a href="#login_as">login_as</a></li><li><a href="#move_column">move_column</a></li><li><a href="#navigate_to_page">navigate_to_page</a></li><li><a href="#navigate_to_project_page">navigate_to_project_page</a></li><li><a href="#paste">paste</a></li><li><a href="#refresh_grid">refresh_grid</a></li><li><a href="#remove_all_step_columns">remove_all_step_columns</a></li><li><a href="#remove_page_summaries">remove_page_summaries</a></li><li><a href="#revive_entity">revive_entity</a></li><li><a href="#right_click_on">right_click_on</a></li><li><a href="#run_quick_filter">run_quick_filter</a></li><li><a href="#save_page">save_page</a></li><li><a href="#set_field_in_NwEnttyDlg">set_field_in_NwEnttyDlg</a></li><li><a href="#set_page_mode">set_page_mode</a></li><li><a href="#set_preference">set_preference</a></li><li><a href="#set_preferences">set_preferences</a></li><li><a href="#set_task_thumbnail_render_mode">set_task_thumbnail_render_mode</a></li><li><a href="#setup_backbone_suite">setup_backbone_suite</a></li><li><a href="#setup_suite">setup_suite</a></li><li><a href="#setup_tests_rest">setup_tests_rest</a></li><li><a href="#sg_should">sg_should</a></li><li><a href="#step_column_menu_action">step_column_menu_action</a></li><li><a href="#stow_gantt">stow_gantt</a></li><li><a href="#ungroup_page">ungroup_page</a></li><li><a href="#unstow_gantt">unstow_gantt</a></li><li><a href="#upload_file">upload_file</a></li><li><a href="#upload_file_curl">upload_file_curl</a></li><li><a href="#upload_file_ui">upload_file_ui</a></li><li><a href="#verify_field_exists">verify_field_exists</a></li><li><a href="#wait_for_grid">wait_for_grid</a></li><li><a href="#wait_for_spinner">wait_for_spinner</a></li></ol><hr/><a name="clear_quick_filter"></a>

## clear\_quick\_filter()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Simulates clicking the Quick Filter `x` icon to reset the quick filter, then automatically makes a call to `cy.wait_for_spinner()`. See also [cy.run_quick_filter()](#run_quick_filter).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
cy.clear_quick_filter();
```

* * *

<a name="clear_thumbnail"></a>

## clear\_thumbnail(entity_type, id) ⇒ <code>Object</code>
**Imported from:** <code>commands.backbone.js</code><br/>Sets the thumbnail for a particular entity (by type and id) to `null`.

**Kind**: global function  
**Returns**: <code>Object</code> - }  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type |
| id | <code>Number</code> | The id of the entity. |

**Example**  
```js
// Clear out Asset 1167's thumbnail
cy.clear_thumbnail('Asset', 1167);
```

* * *

<a name="conditionally_create"></a>

## conditionally\_create(entity_type, data) ⇒ <code>Number</code>
**Imported from:** <code>commands.crud.js</code><br/>Based on filter criteria passed in to the call, it will either...
<ol>
<li>Find an entitty that matches your filter(s) and return its id</li>
<li>Creates an entity with the attributes you've passed in, then return that id</li>
</ol>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type. |
| data | <code>Object</code> | The payload of attribute/value pairs - exactly like the python api. In addition, you must include a `filters` key. See below |
| data.filters | <code>Array</code> | An array of 1 or more filter conditions that will be used to locate a potential entity match. |

**Example**  
```js
// Assuming there is a shot named 'needle in a haystack' the create won't occur
// but the id of the matching shot will be returned
cy.conditionally_create('Shot', {
   project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
   code: 'needle in a haystack',
   filters: [['code','is', 'needle in a haystack']]
}).then(id => {
   // Go to the Shot detail page
   cy.navigate_to_page(`/detail/Shot/${id}`);
});
```

* * *

<a name="create_entity"></a>

## create\_entity(entity_type, data) ⇒ <code>Number</code>
**Imported from:** <code>commands.crud.js</code><br/>Creates a single entity using a POST request to the REST api endpoint, then returns the id of the created entity.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type you'd like to create. |
| data | <code>Object</code> | The payload of attribute/value pairs - exactly like the python api. |

**Example** *(Simple)*  
```js
// Create a Shot named foo in the Test Project
cy.create_entity('Shot', {
   project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
   code: 'foo'
}).then(id => {
   // Go ahead and navigate to the detail page
   cy.navigate_to_page(`/detail/Shot/${id}`);
});
```

* * *

<a name="create_field"></a>

## create\_field(entity_type, data_type, properties) ⇒ <code>Object</code>
**Imported from:** <code>commands.backbone.js</code><br/>Creates a field using the REST API. Returns the REST api response from the POST request used to create the field. Important to note: **this method cannot be used to create a query field**. See [create_query_field](#create_query_field).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The entity type. |
| data_type | <code>String</code> | The data type of the field to create |
| properties | <code>Array</code> | A list of key/value pairs |

**Example** *(Calculated Field)*  
```js
// Create a calculated field via the REST api
let entity_type = 'Task';
let data_type = 'calculated';
let properties = [
    {
        property_name: 'name',
        value: 'Cypress Calculated field',
    },
    {
        property_name: 'calculated_function',
        value: 'CONCAT("Cypress ✔★♛ - id ^2=", {id}*{id}*{id}*{id})',
    },
];
cy.create_field(entity_type, data_type, properties).then($resp => {
    console.log(JSON.stringify($resp, undefined, 2));
});
```

* * *

<a name="create_query_field"></a>

## create\_query\_field(props) ⇒ <code>Object</code>
**Imported from:** <code>query_fields.js</code><br/>Creates a query field by sending an xhr POST request to `background_job/configure_dc`

**Kind**: global function  
**Returns**: <code>Object</code> - The Response object of the xhr request to `background_job/configure_dc`  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| props | <code>Array.&lt;Object&gt;</code> |  | Set of query field properties to pass along to the function. |
| props.field_owner_entity_type | <code>String</code> |  | The entity type on which the query field will be created. |
| props.field_name | <code>String</code> |  | The display name of the field. eg: `Some Query Field on Project` |
| props.summary_field | <code>String</code> | <code>id</code> | The field on which to summarize. |
| props.summary_default | <code>String</code> | <code>record_count</code> | The display mode of the query field. Valid options are...<ul><li>null</li><li>single_record</li></ul> |
| props.summary_value | <code>String</code> | <code>&#x60;null&#x60;</code> | Only necessary if using a non-null summary_default. This must be passed in as a stringified JSON object. |
| props.query | <code>Object</code> | <code>{logical_operator:&#x27;and&#x27;,conditions:[{path:&#x27;id&#x27;,relation:&#x27;greater_than&#x27;,values:[0],active:&#x27;true&#x27;}]}</code> | The query |

**Example** *(Shot &#x3D;&gt; Versions)*  
```js
// Finds all Versions, even ones not linked to the Shot
// Displays a record count
cy.create_query_field({
   field_owner_entity_type: 'Shot',
   entity_type: 'Version',
   field_name: 'All Versions',
})
// The resulting query field will have the default filter since one was not passed in.
```
**Example** *(Shot &#x3D;&gt; Latest Note sorted by Date Created)*  
```js
// Finds all Notes linked to the current Shot sorted by created_at desc
// Displays the Latest note, using the content field (no detail page link)
cy.create_query_field({
    field_owner_entity_type: 'Shot',
    entity_type: 'Note',
    field_name: 'Latest Note',
    summary_field: 'content',
    summary_default: 'single_record',
    summary_value: JSON.stringify({ column: 'created_at', direction: 'desc', detail_link: false }),
    filters: {
        logical_operator: 'and',
        conditions: [
            {
                path: 'note_links',
                relation: 'is',
                values: [
                    {
                        type: 'Shot',
                        id: 0,
                        name: 'Current Shot',
                        valid: 'parent_entity_token',
                    },
                ],
                active: 'true',
            },
        ],
    },
});
```

* * *

<a name="delete_entity"></a>

## delete\_entity(entity_type, id) ⇒ <code>Object</code>
**Imported from:** <code>commands.crud.js</code><br/>Deletes (aka: retires) a single entity. Returns whether or not the delete succeeded - `true` or `false`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type. |
| id | <code>Number</code> | The id of the entity you'd like to delete. |

**Example**  
```js
cy.delete_entity('Asset', 1140);
```

* * *

<a name="delete_field"></a>

## delete\_field(entity_type, system_field_name, delete_forever) ⇒ <code>Object</code>
**Imported from:** <code>commands.backbone.js</code><br/>Deletes a field (not permanently). Returns the REST api response from the `DELETE` call.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entity_type | <code>String</code> |  | The CamelCase entity type. |
| system_field_name | <code>String</code> |  | The system field name. |
| delete_forever | <code>Boolean</code> | <code>false</code> | Whether or not to additionally call `cy.delete_field_forever()`. |

**Example**  
```js
cy.delete_field('Task','sg_qa_currency');
```

* * *

<a name="disable_custom_entity"></a>

## disable\_custom\_entity(entity_type) ⇒ <code>Object</code>
**Imported from:** <code>commands.backbone.js</code><br/>Disables a custom entity by making a call to `cy.set_preference()` and passing in a `pref_key` built from entity_type in the following way:
```
let pref = 'use_' + SG.schema.entity_types[entity_type].name_pluralized_underscored;
cy.set_preference({pref: 'no'});
```

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type of the entity to disable. |

**Example** *(Simple)*  
```js
cy.disable_custom_entity('CustomEntity05');
```

* * *

<a name="display_fields_in_grid"></a>

## display\_fields\_in\_grid(field_array)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Displays a list of fields in the grid - passed in as an `Array`. Important things to note:
<ul>
<li>Assumes that the page mode is already set to `list`</li>
<li>Does not add the supplied list of fields to the already-displayed fields.</li>
<li>Results in ONLY the supplied list of fields being displayed</li>
<li>Bubbled fields can be passed in... eg: `entity.Shot.sg_status_list`</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| field_array | <code>Array</code> | A list of fields to display. This list must be supplied as an `Array`. |

**Example** *(Shot Code and ALL TASKS pipeline step column)*  
```js
cy.display_fields_in_grid(['code', 'step_0']);
```
**Example** *(Shot fields)*  
```js
// Show Shot code, description, and open notes count fields
cy.display_fields_in_grid(['code', 'description', 'open_notes_count']);
```
**Example** *(Version fields &amp; Bubbled Shot Fields)*  
```js
// Show version name, thumbnail, and linked Shot code
cy.display_fields_in_grid(['code', 'image', 'entity.Shot.code']);
```

* * *

<a name="edit_entity"></a>

## edit\_entity(entity_type, id, data) ⇒ <code>Boolean</code>
**Imported from:** <code>commands.crud.js</code><br/>Edits an entity by issuing a `PUT` request to a REST api endpoint. Returns the status of the edit having succeeded.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type. |
| id | <code>Number</code> | The Id of the entity you'd like to edit. |
| data | <code>Object</code> | The payload of attribute/value pairs - exactly like the python api. |

**Example**  
```js
// From a page of Assets...
// Use the REST api to edit Asset 1140
cy.edit_entity('Asset', 1140, {sg_status_list: 'ip', description: 'Changing status'});
```

* * *

<a name="edit_field_in_grid"></a>

## edit\_field\_in\_grid(field)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Edits a field value in the currently visible grid for a specific entity. Note: this does not make any assertions. This command assumes the following:
<ul>
<li>The page is already set to list mode</li>
<li>The targeted entity `id` is visible in the current grid</li>
<li>The targeted field is visible in the current grid</li>
<li>The targeted entity does not appear multiple times - as may happen if grouping is applied</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| field | <code>Array.&lt;Object&gt;</code> |  | A hash of the following. |
| field.id | <code>Number</code> |  | The id of the entity to edit. |
| field.system_field_name | <code>String</code> |  | The system field name of the field you'd like to edit. |
| field.new_value | <code>Object</code> |  | The field value that should be set (not typed). Appropriate for complex data types like `multi-entity` or `entity` fields. |
| field.autocomplete | <code>Boolean</code> | <code>false</code> | **Optional** - whether or not the editor requires the clicking of a menu item of possible matches. |

**Example** *(Text)*  
```js
// description (text)
cy.edit_field_in_grid({
    id: 1167,
    system_field_name: 'description',
    new_value: 'Lrem ipsum yahda yahdad',
});
```
**Example** *(Date)*  
```js
// sg_qa_date (date)
cy.edit_field_in_grid({
    id: 1167,
    system_field_name: 'sg_sg_date',
    new_value: 'July 4, 2018'
});
```
**Example** *(Multi-entity with matching autocomplete)*  
```js
// shots (multi-entity)
cy.edit_field_in_grid({
    id: 1167,
    system_field_name: 'shots',
    new_value: 'foo-shot',
    autocomplete: true,
});
```

* * *

<a name="expand_pref_section"></a>

## expand\_pref\_section(section)
**Imported from:** <code>commands.backbone.js</code><br/>Scrolls down to and expands a pref section, using the display name of the accordion (eg: `Feature Prefernces`). You must be logged in, and currently on the prefs page for this to work.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| section | <code>String</code> | The name that is displayed on the pref header accordion. |

**Example**  
```js
cy.expand_pref_section('Feature Preferences');
```

* * *

<a name="field_exists"></a>

## field\_exists(entity_type, system_field_name) ⇒ <code>Boolean</code>
**Imported from:** <code>commands.backbone.js</code><br/>Returns whether or not a given field exists for a given entity type.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type. |
| system_field_name | <code>String</code> | The system field name. |

**Example**  
```js
cy.field_exists('Task', 'sg_qa_currency').then(exists => {
   assert.isTrue(exists);
})
```

* * *

<a name="get_SG"></a>

## get\_SG() ⇒ <code>Object</code>
**Imported from:** <code>commands.entity_query_page.js</code><br/>Gets the SG object that should exist on all Shotgun pages.

**Kind**: global function  
**Returns**: <code>Object</code> - `SG`  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example** *(Using &#x60;.then&#x60;)*  
```js
cy.get_SG().then(SG => {
    assert.isTrue(SG.globals.current_user.id > 0);
})
```
**Example** *(Using &#x60;.its&#x60;)*  
```js
cy.get_SG().its('globals.current_user.id').should('be.above', 0)
```

* * *

<a name="get_access_token"></a>

## get\_access\_token()
**Imported from:** <code>commands.js</code><br/>Gets a REST api auth token, using the configured admin login and password. Stores this token Object in `Cypress.config('TOKEN')`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Get a rest api token and examine its attributes...
cy.get_access_token().then(TOKEN => {
   let access_token = TOKEN.body.access_token;
   let expires_in = TOKEN.body.expires_in;
   let refresh_token = TOKEN.body.refresh_token;
   let token_type = TOKEN.body.token_type;
   // Remember, all of this ^^ is always available in Cypress.config('TOKEN');
})
```

* * *

<a name="get_entity"></a>

## get\_entity(entity_type, id, fields) ⇒ <code>Object</code>
**Imported from:** <code>commands.crud.js</code><br/>Gets 1 or more fields on the entity by issuing a `GET` request to a REST api endpoint. Accepts a querystring parameter of `?fields` to restrict the fields returned. Returns the response object of that request.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type. |
| id | <code>Number</code> | The id of the entity. |
| fields | <code>Array</code> | **OPTIONAL** - a list of 1 or more fields to return, which is helpful for speeding up requests. If the flag isn't provided, all fields on the entity are returned. |

**Example**  
```js
cy.get_entity('Asset', 1140, ['code', 'description', 'sg_status_list']).then(resp => {
   // Assert that the description is not an empty string
   assert.isTrue(resp.attributes.description !== '');
});
```
**Example**  
```js
cy.get_entity('Version', 1140, ['image_source_entity']).then(resp => {
   // Assert that the image source entity id is a number
   expect(resp.relationships.image_source_entity.data.id).to.be.a('number');
});
```
**Example**  
```js
// Get Attachment id=1000, and make assertions on its attributes
cy.get_entity('Attachment', 1000, fields).then(resp => {
   // Assert the attachment is actually linked to Note 40
   expect(resp.relationships.attachment_links.data[0]).to.deep.include({
       id: 40,
       type: 'Note',
   });

   // Further assertions
   expect(resp.attributes.this_file.name).to.equal('test-cypress.jpg);
   expect(resp.attributes.this_file.content_type).to.equal('image/jpeg');
   expect(resp.attributes.this_file.link_type).to.equal('upload');
   expect(resp.relationships.image_source_entity.data.type).to.equal('Attachment');
});
```

* * *

<a name="get_field_by_display_name"></a>

## get\_field\_by\_display\_name(entity_type, display_name) ⇒ <code>String</code> \| <code>null</code>
**Imported from:** <code>query_fields.js</code><br/>Gets a field by entity name and display name.

**Kind**: global function  
**Returns**: <code>String</code> \| <code>null</code> - - The system name of the field.  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity name. |
| display_name | <code>String</code> | The configured display name of the field. |

**Example**  
```js
cy.get_field_by_display_name('Shot', 'Shot Name').then(system_field_name => {
   assert.isTrue(system_field_name == 'code');
})
```

* * *

<a name="get_grid"></a>

## get\_grid() ⇒ <code>Object</code>
**Imported from:** <code>commands.entity_query_page.js</code><br/>Gets the grid object that contains several callable methods. Important to note:
<ul>
<li>This is very handy, but...</li>
<li>Will only work if the page is in `list` mode</li>
<li>Extracts the grid from `SG.globals.page.root_widget`</li>
</ul>

**Kind**: global function  
**Returns**: <code>Object</code> - The `grid_widget` object extracted from `SG.globals.page.root_widget`.  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Does this and this
cy.get_grid().then(grid => {
   // Find out how many records are in the grid
   let total_recs = grid.get_record_count();
   // Set the column header of the code field to Purple
   ng.set_column_header_color('code', 6);
   // Set wordwrap on the code column
   ng.set_wrappaed('code', true);
})
```

* * *

<a name="get_page"></a>

## get\_page() ⇒ <code>Object</code>
**Imported from:** <code>commands.entity_query_page.js</code><br/>Gets the page object which contains several callable methods.

**Kind**: global function  
**Returns**: <code>Object</code> - `SG.globals.page.root_widget.get_child_widgets()[2]`  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Get the page, then do stuff...
cy.get_page().then(page => {
   // find out the page mode
   let mode = page.get_mode();
   // Get the page's current entity type
   let entity_type = page.get_entity_type();
})
```

* * *

<a name="get_page_id_by_name"></a>

## get\_page\_id\_by\_name() ⇒ <code>Number</code>
**Imported from:** <code>commands.backbone.js</code><br/>Returns the id of a page by name by calling this REST api endpoint: `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[name]=${page_name}`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example** *(Navigate to common page URL&#x27;s without knowing their ID)*  
```js
// My Tasks
cy.get_page_id_by_name('My Tasks').then(id => {
    cy.navigate_to_page(`/page/${id}`);
})

// Global People Page
cy.get_page_id_by_name('People').then(id => {
    cy.navigate_to_page(`/page/${id}`);
})

// Permissions - People
cy.get_page_id_by_name('Permissions - People').then(id => {
    cy.navigate_to_page(`/page/${id}`);
})

// Inbox
cy.get_page_id_by_name('Inbox').then(id => {
    cy.navigate_to_page(`/page/${id}`);
})
```

* * *

<a name="get_preference"></a>

## get\_preference(pref_list) ⇒ <code>Object</code>
**Imported from:** <code>commands.backbone.js</code><br/>Gets 1 or more preferences by `pref_key`, and returns the result. Does this by making a GET request to `preferences/get_prefs?_dc=`. This command is aliased by `cy.get_preferences` (plural).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| pref_list | <code>Array</code> \| <code>String</code> | 1 or more prefs by pref_key. See below for examples. |

**Example** *(Get 1 preference at a time)*  
```js
// Get s3_primary_bucket
cy.get_preference('s3_primary_bucket').then(pref => {
   // Now you have an object
   assert.isTrue(pref.s3_primary_bucket !== '', 'Pref value is not empty string');
});

// Get enable_new_exporter
cy.get_preference('enable_new_exporter').then(pref => {
   expect(pref.enable_new_exporter).to.be.oneOf(['yes', true])
});
```
**Example** *( 2 or more Prefs)*  
```js
// Get a list of prefs
cy.get_preference(['s3_primary_bucket', 'enable_new_exporter']).then(pref => {
   console.log(JSON.stringify(pref, undefined, 2));
});

// logs this...
{
   "enable_new_exporter": "yes",
   "s3_primary_bucket": "U.S.: Oregon (local)"
}
```

* * *

<a name="get_preferences"></a>

## get\_preferences()
**Imported from:** <code>commands.backbone.js</code><br/>- An alias for [cy.get_preference()](#get_preference).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

* * *

<a name="get_prefs_page_id"></a>

## get\_prefs\_page\_id() ⇒ <code>Number</code>
**Imported from:** <code>commands.backbone.js</code><br/>Returns the id of the Site Preferences page by calling this REST api endpoint: `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[page_type]=site_prefs`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Navigate to the hidden prefs page without knowing the ID in advance
cy.get_prefs_page_id().then(id => {
    cy.navigate_to_page(`/page/${id}?hidden_prefs_visible`);
})
```

* * *

<a name="get_rest_endpoint"></a>

## get\_rest\_endpoint(url, method, failOnStatusCode, data, content_type, response_content_type) ⇒ <code>Object</code>
**Imported from:** <code>commands.js</code><br/>Makes a call to a REST api endpoint, using the passed-in params. Always returns the REST api response object.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>String</code> |  | The endpoint: eg: `/api/v1/entity/Note/55`. |
| method | <code>String</code> | <code>GET</code> | The method: `GET`, `POST`, `UPDATE`, `DELETE`. |
| failOnStatusCode | <code>Boolean</code> | <code>true</code> | Whether the call should fail on a non 200'ish status code. Sometimes, you will want to set this to `false` when you are testing error messages that are sent with non-200 codes. |
| data | <code>Object</code> | <code>{}</code> | The payload of form vars to send along. This is commonly included in `POST` requests with entity-create or entity-search endpoints. |
| content_type | <code>String</code> | <code>application/json</code> | The content_type of the request. |
| response_content_type | <code>String</code> | <code>application/json</code> | This param is optional.  The only other allowed value is `application/xml`. |

**Example** *(Get a note&#x27;s followers)*  
```js
cy.get_rest_endpoint('/api/v1/entity/Note/55/followers', 'GET').then(resp => {
   //Expect json
   expect($resp.headers['content-type']).to.contains('application/json');
   //status == 200
   assert.isTrue(resp.status == 200, 'Status code of the request is 200');
});
```
**Example** *(Requesting xml by setting response_content_type)*  
```js
let data, failOnStatusCode, content_type, response_content_type;
cy
    .get_rest_endpoint(
        '/api/v1/entity/projects',
        'GET',
        (failOnStatusCode = true),
        (data = {}),
        (content_type = 'application/json'),
        (response_content_type = 'application/xml')
    )
    .then(resp => {
        //Expect xml because that is what you asked for
        expect(resp.headers['content-type']).to.contains('application/xml');
        //status == 200
        assert.isTrue(resp.status == 200, 'Status code of the request is 200');
    });
```

* * *

<a name="get_rest_endpoint_should"></a>

## get\_rest\_endpoint\_should(url, method, validator, failOnStatusCode, data, content_type, response_content_type)
**Imported from:** <code>commands.js</code><br/>Allows to use the get_rest_endpoint functionality in a should-like fashion.

If the validator raises an exception, the REST call will be reinvoked
until the validator completes succesfully.

This specific implementation is required because commands that can have side-effects
can't use .should(...).

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Path on the Shotgun server. |
| method | <code>string</code> | Verb to use when loading the path on Shotgun. |
| validator | <code>function</code> | Method that validates the response. |
| failOnStatusCode | <code>boolean</code> | When set to True, method will pass only on 2xx and 3xx http codes. |
| data | <code>Object</code> | Payload to send in the body of the request. |
| content_type | <code>string</code> | Value of the Content-Type header. |
| response_content_type | <code>string</code> | Format requested for the response type. |


* * *

<a name="get_translation"></a>

## get\_translation(keys, Additional) ⇒ <code>String</code>
**Imported from:** <code>i18n.js</code><br/>- Retrieves the i18n translation of a string based on its

**Kind**: global function  
**Returns**: <code>String</code> - A translated string.  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>String</code> | The json key of the item you'd like a translation string for. eg: `preferences.feature.enable_tag_list_translation`. The `keys` arg is passed to the wrapped function `i18next.t`. |
| Additional | <code>Object</code> | options. The `options` arg is passed to the wrapped function `i18next.t`. |

**Example**  
```js
cy.get_translation('preferences.feature.enable_tag_list_translation').then(str => {
   assert.isTrue(str == "Translate 'tag_list' references in API calls");
});
```
**Example**  
```js
cy.get_translation('canvas.designer.design_mode_title', { title: 'dog gonnit'}).then(str => {
   assert.isTrue(str == 'DESIGN MODE - dog gonnit')
});
```

* * *

<a name="global_nav"></a>

## global\_nav(item)
**Imported from:** <code>commands.navigation.js</code><br/>Clicks common global nav elements by building a selector from the passed in param `item`, and mapping it to an items dictionary of allowed values.

**How `item` maps to a selector**
```
let items = {
    home: 'shotgun_logo',
    inbox: 'inbox',
    my_tasks: 'my_tasks',
    media: 'media',
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
cy.get("[sg_selector='" + items[item] + "']").click();
```

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>String</code> | The human-readable string that corresponds to commonly clicked on items in the global nav. |

**Example**  
```js
cy.global_nav('plus_button');
```

* * *

<a name="handle_menu_item(txt)"></a>

## handle\_menu\_item(txt)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Clicks a menu item by menu item display name. Important to note:
<ul>
<li>`txt` must be a case-sensitive <i>EXACT MATCH</i></li>
<li>Before locating a match, asserts that a menu is visible</li>
<li>Iterates over every menu item in the visible menu to locate a match</li
<li>Will fail if a match cannot be found</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| txt | <code>String</code> | The menu item's display name. |

**Example** *(Correct)*  
```js
// This succeeds...
cy.handle_menu_item('Add Note to Selected...')
```
**Example** *(Incorrect)*  
```js
// All of these will fail
cy.handle_menu_item('Add Note to Selected..')
cy.handle_menu_item('Add Note to Selected')
cy.handle_menu_item('Add note to selected...');
```
**Example**  
```js
// Go to the shots page
cy.navigate_to_project_page('Shot');
// Set mode to list
cy.set_page_mode('list');
// Click Toolbar => 'More'
cy.click_toolbar_item('More');
// Select 'Add note to selected'
cy.handle_menu_item('Add Note to Selected...');
```

* * *

<a name="invoke_dlg_configure_field"></a>

## invoke\_dlg\_configure\_field(field_name)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Right-clicks on a single column header of a field, and brings up the `Configure Field` dialog for that field.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| field_name | <code>String</code> | The system name of the field. |

**Example**  
```js
cy.invoke_dlg_configure_field('sg_status_list');
// Now you can drag/reorder the statuses and submit the form
```
**Example**  
```js
cy.invoke_dlg_configure_field('updated_by');
// Assert there is no 'Delete field' option
cy.get('[sg_selector="button:send_to_trash"]').should('not.exist');
```

* * *

<a name="invoke_dlg_manage_columns"></a>

## invoke\_dlg\_manage\_columns()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Invokes the Manage Columns dialog from an entity query page. This is the dialog that allows users to select 1 or more fields to dsiplay in the grid.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Go to a Tasks page
cy.navigate_to_project_page('Task');
// Set page mode to list
cy.set_page_mode('list');
// Display Task Name and Duration
cy.display_fields_in_grid(['content', 'duration']);
// Bring up the configure
cy.invoke_dlg_manage_columns();
// Now the dialog is open and you can check the checkboxes
```

* * *

<a name="invoke_dlg_manage_fields"></a>

## invoke\_dlg\_manage\_fields()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Invokes the Manage Fields dialog. This dialog allows users to toggle field visibility, and also to *create new fields*.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example** *(Simple)*  
```js
// Does this and this
cy.invoke_dlg_manage_fields()
```

* * *

<a name="invoke_dlg_manage_steps"></a>

## invoke\_dlg\_manage\_steps()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Invokes the Manage Pipeline Steps dialog.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Go to a Shots page
cy.navigate_to_project_page('Shot');
cy.set_page_mode('list');

// Invoke the dialog
cy.invoke_dlg_manage_steps();

// Assert that the dialog header copy is correct
cy.get('[sg_selector="label:dialog_header_text"]').should('contain', 'Manage Shot Pipeline Steps');
```

* * *

<a name="invoke_new_entity_form"></a>

## invoke\_new\_entity\_form(entity_type)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Brings up the new entity form for a given entity_type. Must be used from a Shotgun page with a global nav, while logged in.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | A valid CamelCase entity type (not the Display Name). |

**Example** *(Bring up new Project form)*  
```js
cy.invoke_new_entity_form('Project');
```
**Example** *(Bring up new Shot form)*  
```js
cy.invoke_new_entity_form('Shot');
```
**Example** *(Bring up new Task form)*  
```js
cy.invoke_new_entity_form('Task');
```

* * *

<a name="login_admin"></a>

## login\_admin(persist)
**Imported from:** <code>commands.login.js</code><br/>Logs in to the web app by posting a request to `/user/login`, and resets `Cypress.config('admin_id')`` based on the cookie value returned by Shotgun.

By default, it will persist the session so that subsequent calls to login are not needed in between test cases. This command is preferable to [cy.login_as('admin')](login_as) in almost all cases, and should be used instead.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| persist | <code>Boolean</code> | <code>true</code> | Whether or not to persist the session in this manner... ``` Cypress.Cookies.defaults({    whitelist: ['_session_id', `csrf_token_u${Cypress.config('admin_id')}`], }); ``` |

**Example**  
```js
describe('Test Suite', function() {
    before(function() {
        // Login as admin and also persist your session (default behavior)
        cy.login_admin();
    });

    // Now, there is no need to login over and over betweent test cases

    it('Visit home page', function() {
        cy.home();
    });

    it('Visit Shots Page', function() {
        cy.navigate_to_project_page('Shot');
    })

    it('Set page to list mode', function() {
        cy.set_page_mode('list');
    })

    it('Run a quick filter on boo', function() {
        cy.run_quick_filter('boo');
    })

    it('Clear the quick filter', function() {
        cy.clear_quick_filter();
    })
});
```
**Example**  
```js
// Do this if you DON'T want your session cookies persisted
cy.login_admin(false);
```

* * *

<a name="login_as(role=admin)"></a>

## login\_as(role)
**Imported from:** <code>commands.login.js</code><br/>Logs in to the web app by posting a request to `/user/login`. In most cases, one should use [cy.login_admin()](#login_admin).
<ul>
<li>Regardless of passed-in value of `role`, this command <u>always uses the configured admin username and password</u></li>
<li>Will create a web session token that is distinct from the REST API token, and has different expiry characteristics</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| role | <code>String</code> | <code>admin</code> | The role. |

**Example**  
```js
// Login as the admin
cy.login_as('admin');
// Then navigate somewhere
cy.navigate_to_project_page('Shot');
```

* * *

<a name="move_column"></a>

## move\_column(col_name)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Moves a grid column - in list mode - to a new 0-based index position. Uses `grid.move_column(idx, 0)`. Allows passing in tokens like `first` and `last`. This command makes no assertions, but may cause js errors if the page is not in list mode.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| col_name | <code>String</code> | The system name of the field/column. eg: `sg_status_list`. |
|  | <code>new\_index</code> | The new index you would like the column to be moved to. |

**Example** *(Assumes page is already in list mode)*  
```js
// moves code column to 5th position
cy.move_column('code', 4)

// moves thumbnail to first spot
cy.move_column('image','first')

// moves status to last spot
cy.move_column('sg_status_list', 'last')
```

* * *

<a name="navigate_to_page"></a>

## navigate\_to\_page(page)
**Imported from:** <code>commands.navigation.js</code><br/>Navigates to a Shotgun page. Does some pre-checks, wraps `cy.visit()`, and ensures that the page is ready after navigation has occurred.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| page | <code>String</code> | The portion of the Shotgun URL excluding the `baseUrl`. Examples below. |

**Example**  
```js
// Go to the main projects page
cy.navigate_to_page('/projects/');

// Account Settings
cy.navigate_to_page('/page/account_settings')

// Page 882
cy.navigate_to_page('/page/882')
```

* * *

<a name="navigate_to_project_page"></a>

## navigate\_to\_project\_page(entity_type)
**Imported from:** <code>commands.navigation.js</code><br/>Navigates to an official Project entity query page for the given `entity_type` within the configured `TEST_RPOJECT`. It does this by calling `cy.navigate_to_page` and passing in the following param:
```
'/page/project_default?entity_type=' + entity_type + '&project_id=' + Cypress.config('TEST_PROJECT').id;
```

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type in singular form. |

**Example**  
```js
// Shots page without knowing the id in advance
cy.navigate_to_project_page('Shot');

 // Go to the Tasks page
cy.navigate_to_project_page('Task');
```

* * *

<a name="paste"></a>

## paste(subject, pasteOptions) ⇒
**Imported from:** <code>clipboard.js</code><br/>Simulates a paste event.

**Kind**: global function  
**Returns**: The subject parameter.  

| Param | Description |
| --- | --- |
| subject | A jQuery context representing a DOM element. |
| pasteOptions | Set of options for a simulated paste event. |
| pasteOptions.pastePayload | Simulated data that is on the clipboard. |
| pasteOptions.simple | Determines whether or not to use a simple paste. Use this when there is no paste event bound to the element resolved by the selector. |
| pasteOptions.pasteFormat | The format of the simulated paste payload. Default value is 'text'. |

**Example**  
```js
cy.get('[sg_id="Imprtr:ImprtrGtDt"] [sg_selector="drop_area"]').paste({
 pastePayload,
 simple: false,
 });
```

* * *

<a name="refresh_grid"></a>

## refresh\_grid(reload_schema)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Simulates a grid refresh by calling `SG.globals.page.refresh()`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| reload_schema | <code>Boolean</code> | <code>false</code> | Whether or not to call `SG.schema.reload_schema()` prior to refreshing the grid. |

**Example**  
```js
cy.refresh_grid();
```

* * *

<a name="remove_all_step_columns"></a>

## remove\_all\_step\_columns()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Hides all Step Columns on an entity query page by calling `grid.hide_all_task_pivot_columns()`. Makes no assertions, and does nothing if no step columns are visible.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// From a page of Shots with 1 or more Step Column groups in the layout
cy.remove_all_step_columns();
```

* * *

<a name="remove_page_summaries"></a>

## remove\_page\_summaries()
**Imported from:** <code>commands.entity_query_page.js</code><br/>undefined

**Kind**: global function  
**Desription**: Removes page summaries, if they are currently applied to the page by calling the grid js function `grid.toggle_summaries_visible()`.  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
cy.remove_page_summaries();
```

* * *

<a name="revive_entity"></a>

## revive\_entity(entity_type, id) ⇒ <code>Object</code>
**Imported from:** <code>commands.crud.js</code><br/>Revives (aka: undeletes) a single entity. Returns whether or not the operation succeeded - `true` or `false`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| entity_type | <code>String</code> | The CamelCase entity type. |
| id | <code>Number</code> | The id of the entity you'd like to delete. |

**Example**  
```js
cy.revive_entity('Asset', 1140);
```

* * *

<a name="right_click_on"></a>

## right\_click\_on(selector)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Attempts to invoke a Shotgun context menu on the dom element that is passed in as `selector`, then calls `cy.wait_for_spinner()`. This command makes no assertions, so has a low likelihood of failure even in the absence of a context menu. It works well on entity query pages for...
<ul>
<li>Column headers</li>
<li>Row selectors</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>String</code> | The selector that you wish to target the right-click. |

**Example**  
```js
// Go to a Shots page
cy.navigate_to_page('Shot');
// Set page mode to list
cy.set_page_mode('list');
// Display the Shot Name and Description fields
cy.display_fields_in_grid(['code', 'description']);
// Right-click on the Description header
cy.right_click_on('td.heading[sg_selector="label:description"]');
// Assert that the Configure field menu item is showing
cy.get('.sg_menu_body:contains("Configure Field")').should('be.visible');
```

* * *

<a name="run_quick_filter"></a>

## run\_quick\_filter(txt)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Runs a quick filter on an entity query page by typing the passed in text input, and simulates the press of the `{enter}` key. Afterwards, automatically makes a call to `cy.wait_for_spinner()`, then `cy.wait_for_grid()`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| txt | <code>String</code> | The text value of the quick filter. |

**Example**  
```js
cy.run_quick_filter('_');
```

* * *

<a name="save_page"></a>

## save\_page()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Simulates user clicking Page actions menu, then choosing 'Save Page'. This will fail if the page is not in a dirty state.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
cy.save_page();
```

* * *

<a name="set_field_in_NwEnttyDlg"></a>

## set\_field\_in\_NwEnttyDlg(fld, val)
**Imported from:** <code>new_entity_forms.js</code><br/>Sets a field value in the currently visible new entity form. Will work with the following data types:
<ul>
<li>Date</li>
<li>Duration</li>
<li>Entity</li>
<li>List</li>
<li>Number</li>
<li>Status List (pass in the short code)</li>
<li>Text</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| fld | <code>String</code> | The system name of the field you wold like to edit. |
| val | <code>String</code> | The value you would like to apply. |

**Example** *(Sets various fields in currently visible new Shot Form)*  
```js
// Description
cy.set_field_in_NwEnttyDlg('description', 'Closeup');
// Shot Type
cy.set_field_in_NwEnttyDlg('sg_shot_type', 'Regular');
// Status
cy.set_field_in_NwEnttyDlg('sg_status_list', 'ip');
// Cut In
cy.set_field_in_NwEnttyDlg('sg_cut_in', '5599');
// Task Template
cy.set_field_in_NwEnttyDlg('task_template', 'Animation - Shot');
```

* * *

<a name="set_page_mode"></a>

## set\_page\_mode(mode)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Sets the page mode to either list, thumbnail, master detail, card, task, or calendar.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| mode | <code>String</code> | The page mode |

**Example**  
```js
// list
cy.set_page_mode('list')
// thumb
cy.set_page_mode('thumb');
// master_detail
cy.set_page_mode('master_detail');
//
```

* * *

<a name="set_preference"></a>

## set\_preference(values) ⇒ <code>Object</code>
**Imported from:** <code>commands.backbone.js</code><br/>Sets 1 or more preferences by `pref_key`, then reloads the schema - all with xhr requests. This command is aliased by `cy.set_preferences` (plural).
<ul>
<li>No UI is required, but [the user must be logged in](login_as)</li>
<li>If invalid `pref_keys` are passed in, this command will not fail, but obviously, non-existent prefs will not be set</li>
<li>Returns the response object of the request made to `page/reload_schema?_dc=`</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| values | <code>Object</code> | A JSON object of key value pairs, using the `pref_key` names as keys. |

**Example** *(Set 1 pref)*  
```js
// Turn on the enable_new_exporter feature
cy.set_preference({enable_new_exporter: 'yes'});
```
**Example** *(Set multiple prefs)*  
```js
// Enable Chinese, and set it as the language
cy.set_preference({
   enable_zh_hans_translation: 'yes',
   language: 'zh-hans',
});
```

* * *

<a name="set_preferences"></a>

## set\_preferences()
**Imported from:** <code>commands.backbone.js</code><br/>- An alias for [cy.set_preference()](#set_preference).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

* * *

<a name="set_task_thumbnail_render_mode"></a>

## set\_task\_thumbnail\_render\_mode(config) ⇒
**Imported from:** <code>commands.backbone.js</code><br/>Configures the render mode of Task.image to one of 3 possible values:
<ol>
<li>manual</li>
<li>latest</li>
<li>query</li>
</ol>

**Kind**: global function  
**Returns**: Returns this...  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>String</code> | <code>manual</code> | The render mode. Must be one of the allowed values. |

**Example**  
```js
// Configure for manual Uploads
cy.set_task_thumbnail_render_mode('manual');

// Latest Version or Note
cy.set_task_thumbnail_render_mode('latest');

// Query-based (uses the default query)
cy.set_task_thumbnail_render_mode('query');
```

* * *

<a name="setup_backbone_suite"></a>

## setup\_backbone\_suite(options)
**Imported from:** <code>commands.backbone.js</code><br/>Runs through particular test suite setup for Shotgun Create data model tests.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Array.&lt;Object&gt;</code> |  | A hash of properties |
| options.upload_project_thumbnail | <code>Boolean</code> | <code>false</code> | Whether or not to upload a thumbnail to the test project, using `fixtures/uploads/thumbnails/project-thumb.jpg`. |
| options.upload_project_billboard | <code>Boolean</code> | <code>false</code> | Whether or not to upload a billboard image to the test project, using `fixtures/uploads/billboards/billboard_pipeline.jpg`. |
| options.activate_viewmaster | <code>Boolean</code> | <code>false</code> | Whether or not to activate viewmaster via the prefs. |
| options.create_shot | <code>Boolean</code> | <code>false</code> | Whether or not to create a Shot in the test project. If set to true, a Shot thumbnail will be uploaded using `fixtures/uploads/thumbnails/shot_thumb.png`. |
| options.create_task | <code>Boolean</code> | <code>false</code> | Whether or not to create a Task in the test project. If set to true, a Task will be created, it will be *unlinked*, and it will have its own thumbnail using `fixtures/uploads/thumbnails/task_thumb.png`. |
| options.create_version | <code>Boolean</code> | <code>false</code> | Whether or not to create a Version in the test project. If set to true, a Version will be created, it will be *unlinked*, and it will have its own thumbnail using `fixtures/uploads/thumbnails/version_media.png`. |
| options.create_note | <code>Boolean</code> | <code>false</code> | Whether or not to create a Note in the test project. If set to true, a Note will be created, will be *unlinked*, and will have NO thumbnail. |

**Example** *(Setup the test suite with none of the defaults)*  
```js
cy.setup_backbone_suite();
```

* * *

<a name="setup_suite"></a>

## setup\_suite()
**Imported from:** <code>commands.js</code><br/>Does Test suite setup, and is commonly used in the REST api cypress test specs. Handles the following: <ul>
<li>Sets `Cypress.config('admin_id') if it is incorrectly set, or not set</li>
<li>Creates a test project named `Cypress Test Project [${Cypress.moment()}]`</li>
<li>Sets the admin user's home page to the Test Project's overview page</li>
<li>**Test setup DOES NOT login to the web app**</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Usually done in a top-level before block
before(function() {
   cy.setup_suite();
});
```

* * *

<a name="setup_tests_rest"></a>

## setup\_tests\_rest() ⇒ <code>Object</code>
**Imported from:** <code>commands.js</code><br/>Gets an API access token, then fetches the Shotgun schema for the current site under test. The schema entities returned are stored in `Cypress.config('ENTITIES')`, and this config variable is extensively used in REST api test specs.

**Kind**: global function  
**Returns**: <code>Object</code> - All schema entities of the current Shotgun site.  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
describe('REST API test suite', function() {
    // This before listener runs ONCE before ALL tests in this 'describe' block
    before(function() {
        // Run the setups
        cy.setup_tests_rest();
    });

    // Now your test cases have all they need
    it('GET /api/v1', function() {
        cy.get_rest_endpoint('/api/v1', 'GET').then($resp => {
            assert.isTrue($resp.status == 200, 'Status code of the request is 200');
        });
    });
});
```

* * *

<a name="sg_should"></a>

## sg\_should(cmd, validator)
**Imported from:** <code>commands.js</code><br/>Implements a should-like logic for any arbitrary commands. This allows to use a should-like
syntax on commands that do not support them, like request.

The command is executed in a loop until the validator passes or a timeout of 30 seconds
is reached.

For example:

```js
   cy.sg_should(
       () => cy.get_rest_endpoint("/api/v1/webhooks/deliveries", "GET"),
       (resp) => assert.equal(resp.length, 10)
   );
```

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>function</code> | Cypress command or function that needs to be executed. |
| validator | <code>function</code> | Validator function that indicates if the command                             succeeded or not. |


* * *

<a name="step_column_menu_action"></a>

## step\_column\_menu\_action(step, menu_action)
**Imported from:** <code>commands.entity_query_page.js</code><br/>Dispatches a right-click on a step column group header, and invokes a menu item specfici to Pipeline step columns.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| step | <code>String</code> | <code>step_0</code> | The name of the step column (eg: `step_0`) |
| menu_action | <code>String</code> |  | The name of the menu action to call. |

**Example**  
```js
// Expand ALL TASKS closed step column
cy.step_column_menu_action('step_0', 'Expand')
```
**Example**  
```js
// Render ALL TASKS in Details only mode
cy.step_column_menu_action('step_0', 'Show Details Only')
```

* * *

<a name="stow_gantt"></a>

## stow\_gantt()
**Imported from:** <code>commands.backbone.js</code><br/>Hides the gantt pane (if it is visible). Assumes the page is either in list mode (for Tasks) or schedule mode (for entities that support Tasks).

Also see [cy.unstow_gantt()](#unstow_gantt).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Assumes the page of tasks is in list mode
cy.stow_gantt();
```

* * *

<a name="ungroup_page"></a>

## ungroup\_page()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Ungroups the page by calling `cy.get_grid().invoke('ungroup')`, then calls `cy.wait_for_spinner()`. Important to note:
<ul>
<li>Will work for single or multi-level grouping</li>
<li>Will only work on pages in list mode</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Assume the current page of Tasks is grouped
cy.ungroup_page();
```

* * *

<a name="unstow_gantt"></a>

## unstow\_gantt()
**Imported from:** <code>commands.backbone.js</code><br/>Reveals the gantt pane (if it is currently stowed). Assumes the page is either in list mode (for Tasks) or schedule mode (for entities that support Tasks).

Also see [cy.stow_gantt()](#stow_gantt).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Assumes the page of tasks is in list mode
cy.unstow_gantt();
```

* * *

<a name="upload_file"></a>

## upload\_file(options) ⇒ <code>Boolean</code>
**Imported from:** <code>commands.file_uploads.js</code><br/>Uploads a single file to an entity's file/link field. Will only work with files already located below `test/cypress/fixtures/uploads`. Returns whether or not the upload succeeded.

<h4>IMPORTANT</h4>
This method will NOT work if it runs locally in the Cypress Test Runner (outside of the container). It is possible that it has to do with the REST api calls failing at a preliminary step of upload URL generation because the Shotgun site baseUrl contains a port number - `:8888`.
[Also see cy.upload_file_curl()](#upload_file_curl).

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.entity_type | <code>String</code> | The CamelCase entity type. |
| options.entity_id | <code>Number</code> | The entity id. |
| options.field_name | <code>String</code> | The system field name of the file/link field that the upload will target. |
| options.file_name | <code>String</code> | The path to the file. Should be below `test/cypress/fixtures/uploads/` |

**Example** *(Asset thumbnail)*  
```js
cy.upload_file({
   entity_type: 'Asset',
   entity_id: entity_id,
   field_name: 'image',
   file_name: 'fixtures/uploads/worm.jpg',
});
```
**Example** *(Project Billboard)*  
```js
// Upload the project billboard
cy.upload_file({
   entity_type: 'Project',
   entity_id: Cypress.config('TEST_PROJECT').id,
   field_name: 'billboard',
   file_name: 'fixtures/uploads/billboards/billboard_pipeline.jpg',
});
```

* * *

<a name="upload_file_curl"></a>

## upload\_file\_curl(options) ⇒ <code>String</code>
**Imported from:** <code>commands.file_uploads.js</code><br/>Uploads a single file to an entity's file/link field, and mirrors the functioning of [cy.upload_file()](#upload_file). This command relies on an `api2` endpoint, and was only used because of testing related to the TLS deprecation in May 2019. This method of uploading files will work in the Cypress Test Runner.
Also see [cy.upload_file()](#upload_file).

**Kind**: global function  
**Returns**: <code>String</code> - stdout  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.entity_type | <code>String</code> | The CamelCase entity type. |
| options.entity_id | <code>Number</code> | The entity id. |
| options.field_name | <code>String</code> | The system field name of the file/link field that the upload will target. |
| options.file_name | <code>String</code> | The path to the file. Should be below `test/cypress/fixtures/uploads/` |

**Example** *(Asset thumbnail)*  
```js
cy.upload_file_curl({
   entity_type: 'Asset',
   entity_id: entity_id,
   field_name: 'image',
   file_name: 'fixtures/uploads/worm.jpg',
});
```

* * *

<a name="upload_file_ui"></a>

## upload\_file\_ui(props)
**Imported from:** <code>commands.file_uploads.js</code><br/>Uploads a file in the UI by converting a file fixture into a blob, then triggering a drop event on the single file uploader.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| props | <code>Array.&lt;Object&gt;</code> |  | An object... |
| props.first_name | <code>String</code> |  | A string |
| props.age | <code>Number</code> | <code>47</code> | Age whose default value is 47. |

**Example**  
```js
it('uploads a file from a files page', function() {
   // Go to files page
   cy.navigate_to_project_page('Attachment');

   // Bring up new file entity creation form
   cy.invoke_new_entity_form('File');

   // Drop a file into the form's dropzone
   let selector = 'div.sg_new_entity_form [sg_id="NwEnttyDlg:AttchmntCntrl"]';
   let fileUrl = '/img/cypress-screenshot.png';

   // Call the method
   cy.upload_file_ui(selector, fileUrl);

   // Click 'Create File'
   cy.get('div.controls input[sg_selector="button:create"]').click();

   // Wait for 'Uploading...' Progress indicator to appear & disappear
   cy.get('div.progress_indicator_overlay').should('contain', 'Uploading...');
   cy.get('div.progress_indicator_overlay').should('not.be.visible');
});
```

* * *

<a name="verify_field_exists"></a>

## verify\_field\_exists() ⇒ <code>Boolean</code>
**Imported from:** <code>query_fields.js</code><br/>Verifies that a field (by entity type) and display name actually exists in the schema. This is called automatically at the end of `cy.create_query_field()` so that the command does not exit until the query field actually exists.

**Kind**: global function  
**Returns**: <code>Boolean</code> - true or false.  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
|  | <code>options</code> |  |  |
| options.entity_type | <code>String</code> |  | The CamcelCase entity type. |
| options.field_display_name | <code>String</code> |  | The display name of the field. eg: `Shot Name`. Note: case is important. |
| options.number_of_checks | <code>Number</code> | <code>5</code> | The number of times to poll the schema before giving up. Default is `5`. |
| options.interval | <code>Number</code> | <code>2000</code> | The number of `milliseconds` to wait in between checks. Default is `2000`. |

**Example**  
```js
cy.verify_field_exists({entity_type: 'Shot', field_display_name: 'Type'}).then(exists => {
   assert.isTrue(exists)
});
```
**Example**  
```js
cy.verify_field_exists({entity_type: 'Shot', field_display_name: 'Type', number_of_checks: 1}).then(exists => {
   assert.isTrue(exists)
});
```

* * *

<a name="wait_for_grid"></a>

## wait\_for\_grid()
**Imported from:** <code>commands.entity_query_page.js</code><br/>Makes an assertion that `grid.data_set.loaded == true`.

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
// Go to a page of Tasks
cy.navigate_to_project_page('Task');
cy.wait_for_grid();
```

* * *

<a name="wait_for_spinner"></a>

## wait\_for\_spinner()
**Imported from:** <code>commands.navigation.js</code><br/>Defensively checks to see if the page is loaded, and if necessary, reloads it. If the page is loaded, it will waits for the spinner to go away.
<ul>
<li>First, make an assertion that the spinner is not visible - eg: <br/>`cy.get('.progress_indicator_overlay_container').should('not.be.visible')`<br/><br/></li>
<li>Next, If the page has no global nav, or there is no text content...
<ul>
<li>call `cy.reload()` - and take no further defensive actions</li>
<li>Otherwise, call `grid.hide_loading_overlay()` - and take no further defensive actions</li>
</ul>
</li>
</ul>

**Kind**: global function  
**Author**: Ben Willenbring <benjamin.willenbring@autodesk.com>  
**Example**  
```js
cy.wait_for_spinner();
```

* * *

