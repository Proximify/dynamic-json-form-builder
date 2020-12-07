import React, {Component} from 'react';
import Form from "@rjsf/core";
import 'bootstrap/dist/css/bootstrap.css';
import _ from 'lodash';

import {
    MultiColSelectorWidget,
    SingleSelectWidget,
    TextInputWidget,
    WindowedSelectorWidget,
    FileInputWidget,
} from "../CustomWidgets";
import {
    CustomFieldTemplate,
    CustomArrayFieldTemplate,
    CustomUploadFieldTemplate
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
    fieldTemplate: CustomFieldTemplate,
    arrayFieldTemplate: CustomArrayFieldTemplate,
    uploadFieldTemplate: CustomUploadFieldTemplate
}

/**
 * This is a sample UI schema
 */
const uiSchema = {
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
            FormContext: this.props.formContext,
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
        } else if (!this.props.formContext.hasOwnProperty('api')) {
            this.setState({
                isLoaded: true,
                loadingError: `No API/Base URL provided`
            })
        } else {
            this.state.FormContext.api.get(this.props.resourceURL).then(res => {
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
        this.onErrorMsgChange(null);

        console.log("submitting");

        this.state.FormContext.api[this.state.HTTPMethod.toLowerCase()](this.props.resourceURL + 'submit', data)
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
        const {isLoaded, loadingError, FormSchema, FormData, FormContext, FormID, validation} = this.state;
        const globalContext = FormContext.globalContext ?? null;

        if (loadingError) {
            return <h3>Loading Error: {loadingError}</h3>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            console.log(_.isEqual(generateUISchema(FormSchema),uiSchema));
            return (
                <div className={"container"}>
                    <div className={"row d-flex justify-content-center"}>
                        <div className={"col-xl-5 col-lg-5 col-md-7 col-sm-10 col-12"}>
                            <Form
                                id={FormID}
                                schema={FormSchema}
                                uiSchema={generateUISchema(FormSchema)}
                                formData={FormData}
                                formContext={
                                    this.props.formContext ?? null
                                }
                                widgets={customWidgets}
                                showErrorList={false}
                                liveValidate
                                onChange={() => {
                                    console.log("data changed")
                                }}
                                validate={validation}
                                onError={(errors) => {
                                    this.onErrorMsgChange(errors);
                                }}
                                onSubmit={({formData}) => this.onFormSubmit(formData)}>
                                <div className={"container"}>
                                    <div id={`${FormID}-errorMsg`}>
                                    </div>
                                    {(globalContext && globalContext.hasOwnProperty("LanguageContext")) ?
                                        <globalContext.LanguageContext.Consumer>
                                            {({language}) => (
                                                <div>
                                                    <button className={"btn btn-info"}
                                                            style={
                                                                {backgroundColor: language.submitBtnColor}}
                                                            type="submit">{language.submitBtnContent}
                                                    </button>
                                                    <button className={"btn btn-secondary ml-3"}
                                                            style={{backgroundColor: language.cancelBtnColor}}
                                                            type="button">{language.cancelBtnContent}
                                                    </button>
                                                </div>
                                            )}
                                        </globalContext.LanguageContext.Consumer>
                                        : <div>
                                            <button className={"btn btn-info"}
                                                    type="submit">Submit
                                            </button>
                                            <button className={"btn btn-secondary ml-3"}
                                                    type="button">Cancel
                                            </button>
                                        </div>}

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