import React, {Component} from 'react';
import ReactDOM from 'react-dom';
//import Form from "@rjsf/core";
import 'bootstrap/dist/css/bootstrap.css';
// import FormData from './data/formData.json'
// import FormSchema from './data/formSchema.json';
import Form from './js/component/formComponent'

// import {
//     MultiColSelectorWidget,
//     MultiLangTextInputWidget,
//     SingleSelectWidget,
//     TextInputWidget,
//     WindowedSelectorWidget,
//     FileInputWidget
// } from "./js/CustomWidgets";
// import {
//     CustomHeaderTemplate,
//     CustomFieldTemplate,
//     CustomArrayFieldTemplate,
//     CustomUploadFieldTemplate,
//     testArrayFieldTemplate
// } from "./js/CustomTemplates";
// import generateUISchema from "./js/helper/UISchemaGenerator";
//
// const customWidgets = {
//     multiColSelectorWidget: MultiColSelectorWidget,
//     windowedSelectorWidget: WindowedSelectorWidget,
//     textWidget: TextInputWidget,
//     multiLangTextInputWidget: MultiLangTextInputWidget,
//     singleSelectWidget: SingleSelectWidget,
//     fileInputWidget: FileInputWidget
// };
//
// const customTemplates = {
//     headerTemplate: CustomHeaderTemplate,
//     fieldTemplate: CustomFieldTemplate,
//     arrayFieldTemplate: CustomArrayFieldTemplate,
//     uploadFieldTemplate: CustomUploadFieldTemplate
// }
//
// /**
//  * This is a sample UI schema
//  */
// const uiSchema = {
//     "ui:FieldTemplate": customTemplates["headerTemplate"],
//     "name": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "textWidget"
//     },
//     "email": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "textWidget"
//     },
//     "age": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "textWidget"
//     },
//     "gender": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "singleSelectWidget",
//         "ui:emptyValue": ""
//     },
//     "phone": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "textWidget"
//     },
//     "hobby": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "windowedSelectorWidget",
//         "ui:emptyValue": ""
//     },
//     "comment": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "multiLangTextInputWidget"
//     },
//     "signature": {
//         "ui:FieldTemplate": customTemplates["fieldTemplate"],
//         "ui:widget": "textWidget"
//     },
//     "education": {
//         "ui:ArrayFieldTemplate": customTemplates["arrayFieldTemplate"],
//         // "ui:ArrayFieldTemplate":testArrayFieldTemplate,
//         "items": {
//             "degree": {
//                 "ui:FieldTemplate": customTemplates["fieldTemplate"],
//                 "ui:widget": "singleSelectWidget",
//                 "ui:emptyValue": ""
//             },
//             "institution": {
//                 "ui:FieldTemplate": customTemplates["fieldTemplate"],
//                 "ui:widget": "multiColSelectorWidget",
//                 "ui:emptyValue": ""
//             }
//         }
//     },
//     "resume": {
//         "ui:FieldTemplate": customTemplates["uploadFieldTemplate"],
//         "ui:widget": "fileInputWidget"
//     }
// };
//
// /**
//  * This is the validator for the form data
//  * @param formData
//  * @param errors
//  * @returns {*}
//  */
// function validate(formData, errors) {
//     if (formData.name === null || formData.name === "") {
//         errors.name.addError("is a required property");
//     }
//     return errors;
// }
//
// /**
//  * This function handle the form submit event
//  * @param data
//  */
// const onFormSubmit = (data) => {
//     console.log(data)
//     // axios.post(`form/`, {
//     //     formData: data
//     // })
//     //     .then(response => {
//     //         alert('FormData has been modified');
//     //     })
// }

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        //const uiSchema = generateUISchema(window.schema);
        return (
            <Form />
            // <div className={"container"}>
            //     <div className={"row d-flex justify-content-center"}>
            //         <div className={"col-xl-5 col-lg-5 col-md-7 col-sm-10 col-12"}>
            //             <Form
            //                 schema={FormSchema}
            //                 uiSchema={uiSchema}
            //                 formData={FormData}
            //                 widgets={customWidgets}
            //                 validate={validate}
            //                 onSubmit={({formData}) => onFormSubmit(formData)}>
            //             </Form>
            //         </div>
            //     </div>
            // </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'))