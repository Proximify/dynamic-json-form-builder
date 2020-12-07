import React, {Component} from 'react';
import Form from "@rjsf/core";
import 'bootstrap/dist/css/bootstrap.css';
import {language, LanguageContext} from "../context/language-context";
import api from '../helper/api';

import {
    MultiColSelectorWidget,
    // MultiLangTextInputWidget,
    SingleSelectWidget,
    TextInputWidget,
    WindowedSelectorWidget,
    FileInputWidget,
} from "../CustomWidgets";
import {
    CustomHeaderTemplate,
    CustomFieldTemplate,
    CustomArrayFieldTemplate,
    CustomUploadFieldTemplate,
    testArrayFieldTemplate
} from "../CustomTemplates";
import generateUISchema from "../helper/UISchemaGenerator";
import formValidatorGenerator from '../helper/formValidatorGenerator';
import {MultiLangTextInputWidget} from '../MultiLangTextInputWidget'

const customWidgets = {
    multiColSelectorWidget: MultiColSelectorWidget,
    windowedSelectorWidget: WindowedSelectorWidget,
    textWidget: TextInputWidget,
    multiLangTextInputWidget: MultiLangTextInputWidget,
    singleSelectWidget: SingleSelectWidget,
    fileInputWidget: FileInputWidget
};

const customTemplates = {
    headerTemplate: CustomHeaderTemplate,
    fieldTemplate: CustomFieldTemplate,
    arrayFieldTemplate: CustomArrayFieldTemplate,
    uploadFieldTemplate: CustomUploadFieldTemplate
}

/**
 * This is a sample UI schema
 */
const uiSchema = {
    "ui:FieldTemplate": customTemplates["headerTemplate"],
    "name": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "textWidget"
    },
    "email": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "textWidget"
    },
    "age": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "textWidget"
    },
    "gender": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "singleSelectWidget",
        "ui:emptyValue": ""
    },
    "phone": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "textWidget"
    },
    "hobby": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "windowedSelectorWidget",
        "ui:emptyValue": ""
    },
    "comment": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "multiLangTextInputWidget"
    },
    "signature": {
        "ui:FieldTemplate": customTemplates["fieldTemplate"],
        "ui:widget": "textWidget"
    },
    "education": {
        "ui:ArrayFieldTemplate": customTemplates["arrayFieldTemplate"],
        // "ui:ArrayFieldTemplate":testArrayFieldTemplate,
        "items": {
            "degree": {
                "ui:FieldTemplate": customTemplates["fieldTemplate"],
                "ui:widget": "singleSelectWidget",
                "ui:emptyValue": ""
            },
            "institution": {
                "ui:FieldTemplate": customTemplates["fieldTemplate"],
                "ui:widget": "multiColSelectorWidget",
                "ui:emptyValue": ""
            }
        }
    },
    "resume": {
        "ui:FieldTemplate": customTemplates["uploadFieldTemplate"],
        "ui:widget": "fileInputWidget"
    }
};

class FormComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            loadingError: null,
            FormSchema: null,
            FormData: undefined,
            FormID: null,
            validation: null,
            HTTPMethod: null
        };
    }

    componentDidMount() {
        if (!this.props.resourceURL) {
            this.setState({
                isLoaded: true,
                loadingError: "No form resource url provided"
            })
        } else if (!this.props.HTTPMethod || (this.props.HTTPMethod.toLowerCase() !== "post" && this.props.HTTPMethod.toLowerCase() !== "put" && this.props.HTTPMethod.toLowerCase() !== "patch")) {
            this.setState({
                isLoaded: true,
                loadingError: `No/Invalid HTTP method provided, expect 'POST','PUT','PATCH', given: ${this.props.HTTPMethod ?? "nothing"}`
            })
        } else {
            api.get(this.props.resourceURL).then(res => {
                const validationDeclaration = this.props.validationDeclaration;

                this.setState({
                    isLoaded: true,
                    FormSchema: res.data.formSchema,
                    FormData: res.data.formData ?? undefined,
                    FormID: this.props.formID ?? "form",
                    validation: function (formData, errors) {
                        formValidatorGenerator(res.data.formSchema, formData, errors, validationDeclaration);
                        return errors;
                    },
                    HTTPMethod: this.props.HTTPMethod,
                })
            }).catch(err => {
                this.setState({
                    isLoaded: true,
                    loadingError: err.message
                })
            })
        }
    }

    /**
     * This function handle the form submit event
     * @param data
     */
    onFormSubmit = (data) => {
        console.log(data);
        //document.getElementById(`${this.props.FormID}-errorMsg`).innerHTML = "";
        this.onErrorMsgChange(null);

        console.log("submitting")
        api[this.state.HTTPMethod.toLowerCase()](this.props.resourceURL + 'submit', data)
            .then(res => {
                console.log(res);
            }).catch(err => {
            console.log(err);
        })
    }

    onErrorMsgChange = (errors) => {
        const errorMsgDiv = document.getElementById(`${this.state.FormID}-errorMsg`);
        if (!errorMsgDiv)
            return;
        if (errors) {
            const errorList = errors.map(err => Object.values(err));
            errorList.forEach(err => {
                console.log(err)
                let errorMsg = document.createElement("div");
                errorMsg.className += "alert alert-danger";
                errorMsg.role = "alert";
                errorMsg.innerHTML = err;
                errorMsgDiv.appendChild(errorMsg);
            })
        } else {
            errorMsgDiv.innerHTML = "";
        }
    }

    render() {
        const {isLoaded, loadingError, FormSchema, FormData, FormID, validation} = this.state;
        if (loadingError) {
            return <h3>Loading Error: {loadingError}</h3>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className={"container"}>
                    <div className={"row d-flex justify-content-center"}>
                        <div className={"col-xl-5 col-lg-5 col-md-7 col-sm-10 col-12"}>
                            <Form
                                id={FormID}
                                schema={FormSchema}
                                uiSchema={uiSchema}
                                formData={FormData}
                                widgets={customWidgets}
                                showErrorList={false}
                                liveValidate
                                onChange={()=>{console.log("data changed")}}
                                validate={validation}
                                onError={(errors) => {
                                    this.onErrorMsgChange(errors);
                                }}
                                onSubmit={({formData}) => this.onFormSubmit(formData)}>
                                <div className={"container"}>
                                    <div id={`${FormID}-errorMsg`}>
                                    </div>

                                    <LanguageContext.Consumer>
                                        {({language}) => (
                                            <div>
                                                <button className={"btn btn-info"}
                                                        style={{backgroundColor: language.submitBtnColor}}
                                                        type="submit">{language.submitBtnContent}</button>
                                                <button className={"btn btn-secondary ml-3"}
                                                        style={{backgroundColor: language.cancelBtnColor}}
                                                        type="button">{language.cancelBtnContent}</button>
                                            </div>
                                        )}
                                    </LanguageContext.Consumer>

                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default FormComponent;