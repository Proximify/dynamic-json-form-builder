import {CustomFieldTemplate, CustomArrayFieldTemplate, CustomUploadFieldTemplate} from "../templates/CustomTemplates";

const customTemplates = {
    fieldTemplate: CustomFieldTemplate,
    arrayFieldTemplate: CustomArrayFieldTemplate,
    uploadFieldTemplate: CustomUploadFieldTemplate
}

/**
 * This function is used to generate the JSON Object type UISchema for rjsf library to render the form component
 * For each field, the widget property which control the logic (eg. search) can define by string directly
 * But the template property which define how the field looks like need to pass in a function by function name
 * After parse the JSON string to object, call customTemplatesSwitcher() to convert the string value to function
 *
 * @param schema
 * @returns {any}
 * @constructor
 */
export default function GenerateUISchema(schema) {
    let generateUISchema = generateUISchemaRecursively(schema);
    generateUISchema = `{${generateUISchema}}`.replaceAll(",}", "}");
    // console.log(generateUISchema)
    let jsonSchema = JSON.parse(generateUISchema);
    customTemplatesConverter(jsonSchema)
    return jsonSchema;
}

/**
 * A helper function that extract the passed in json schema object's properties and assign it the UISchema
 * For 'ui:widget' properties, assign string directly,
 * For 'ui:FieldTemplate' properties, temporarily assign it a string that can map to the function
 *
 * @param schemaObj
 * @returns {string}
 */
const generateUISchemaRecursively = (schemaObj) => {
    let json = "";
    if (schemaObj.hasOwnProperty("id")) {
        if (schemaObj.type === "string") {
            // determine whether the object passed in is one of the items in the parent object array by the object id
            // id named: "parentObjectId_array_item" => obj_array_item
            json += (schemaObj.id.includes("_array_item")) ? `` : `"${schemaObj.id}":{`;
            // if obj has property "enum", its a selection field
            if (schemaObj.hasOwnProperty("enum")) {
                // if obj has largeEnum:true property, use react-windowed-select widget
                if (schemaObj.hasOwnProperty("largeEnum") && schemaObj.largeEnum === true) {
                    json += `"ui:FieldTemplate":"fieldTemplate","ui:widget":"windowedSelectorWidget","ui:emptyValue":""`
                } else {
                    // use regular select widget
                    json += `"ui:FieldTemplate":"fieldTemplate","ui:widget":"singleSelectWidget","ui:emptyValue":""`;
                }
            } else if (schemaObj.hasOwnProperty("style")) {
                if (schemaObj.style === "textarea") {
                    json += `"ui:widget":"textarea"`;
                } else {
                    console.warn("Unhandled schema string object style, expect 'textarea', given: ", schemaObj);
                }
            } else if (schemaObj.hasOwnProperty("format")) {
                if (schemaObj.format === "file") {
                    json += `"ui:FieldTemplate":"uploadFieldTemplate","ui:widget":"fileInputWidget"`;
                } else {
                    console.warn("Unhandled schema string object format, expect 'file', given: ", schemaObj);
                }
            } else if (schemaObj.hasOwnProperty("bilingual") && schemaObj.bilingual === true) {
                json += `"ui:FieldTemplate":"fieldTemplate","ui:widget":"multiLangTextInputWidget"`;
            } else {
                json += `"ui:FieldTemplate":"fieldTemplate","ui:widget":"textWidget"`;
            }
            json += (schemaObj.id.includes("_array_item")) ? `` : `},`;
        } else if (schemaObj.type === "integer") {
            json += (schemaObj.id.includes("_array_item")) ? `` : `"${schemaObj.id}":{`;
            if (schemaObj.hasOwnProperty("enum")) {
                json += `"ui:widget":"singleSelectWidget","ui:emptyValue": ""`;
            } else {
                json += `"ui:FieldTemplate":"fieldTemplate","ui:widget":"textWidget"`;
            }
            json += (schemaObj.id.includes("_array_item")) ? `` : `},`;
        }
        /*
         * handle multi-column (table style) dropdown separately because
         * define its type to be string or integer will trigger rjsf's default validation
         */
        else if (schemaObj.hasOwnProperty("multiCol") && schemaObj.multiCol === true && schemaObj.hasOwnProperty("enum")) {
            json += `"${schemaObj.id}":{`;
            if (schemaObj.hasOwnProperty("enum")) {
                json += `"ui:FieldTemplate":"fieldTemplate","ui:widget":"multiColSelectorWidget","ui:emptyValue":""`;
            } else {
                console.warn("Unhandled situation, expect property 'enum', given: ", schemaObj);
            }
            json += "},"
        } else if (schemaObj.type === "array") {
            if (schemaObj.hasOwnProperty("items")) {
                json += `"${schemaObj.id}":{"ui:ArrayFieldTemplate":"arrayFieldTemplate","items":{`;
                if (schemaObj.items.type === "string") {
                    json += generateUISchemaRecursively(schemaObj.items);
                } else if (schemaObj.items.type === "object") {
                    json += generateUISchemaRecursively(schemaObj.items)
                } else {
                    console.warn("Unhandled item type, expect string or object, given: ", schemaObj);
                }
                json += "}},"
            } else {
                console.warn("Unhandled schema object, expect property 'items', given: ", schemaObj);
            }
        } else if (schemaObj.type === "object") {
            if (schemaObj.hasOwnProperty("properties")) {
                Object.keys(schemaObj.properties).forEach((childObjectKey) => {
                    const childObject = schemaObj.properties[childObjectKey];
                    json += generateUISchemaRecursively(childObject);
                })
            }
        } else {
            console.warn("Unhandled schema object type", schemaObj);
        }
    } else {
        console.warn("Unhandled schema object, expect property 'id', given: ", schemaObj);
    }
    return json;
}

/**
 * A help function that map the template function by the object's 'ui:FieldTemplate' property (string)
 * @param UISchemaObj
 */
const customTemplatesConverter = (UISchemaObj) => {
    Object.keys(UISchemaObj).forEach((key) => {
        if (UISchemaObj[key].hasOwnProperty("items")) {
            Object.keys(UISchemaObj[key]["items"]).forEach((subKey) => {
                if (UISchemaObj[key]["items"][subKey].hasOwnProperty("ui:FieldTemplate")) {
                    UISchemaObj[key]["items"][subKey]['ui:FieldTemplate'] = customTemplates[UISchemaObj[key]["items"][subKey]['ui:FieldTemplate']];
                } else if (UISchemaObj[key]["items"][subKey].hasOwnProperty("ui:ArrayFieldTemplate")) {
                    console.log(customTemplates[UISchemaObj[key]["items"][subKey]['ui:ArrayFieldTemplate']]);
                    UISchemaObj[key]["items"][subKey]['ui:ArrayFieldTemplate'] = customTemplates[UISchemaObj[key]["items"][subKey]['ui:ArrayFieldTemplate']];
                }
            })
        }
        if (UISchemaObj[key].hasOwnProperty("ui:FieldTemplate")) {
            UISchemaObj[key]['ui:FieldTemplate'] = customTemplates[UISchemaObj[key]['ui:FieldTemplate']];
        } else if (UISchemaObj[key].hasOwnProperty("ui:ArrayFieldTemplate")) {
            UISchemaObj[key]['ui:ArrayFieldTemplate'] = customTemplates[UISchemaObj[key]['ui:ArrayFieldTemplate']];
        }
    })
}