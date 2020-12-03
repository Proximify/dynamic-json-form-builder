import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {language, LanguageContext} from './js/context/language-context';
import LanguageTogglerButton from './js/component/language-toggle-btn';
import 'bootstrap/dist/css/bootstrap.css';
import Form from './js/component/formComponent'


class App extends Component {
    constructor(props) {
        super(props);

        this.toggleLanguage = () => {
            this.setState(state => ({
                language:state.language === language.EN
                    ? language.FR
                    : language.EN,
            }));
        };

        this.state = {
            language: language.EN,
            toggleLanguage: this.toggleLanguage
        };
    }

    validationMethods = {
        requiredField: (value) => {
            return value ? null : "is a required property";
        },
        emailField: (value) => {
            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return !value ? null : (re.test(value) ? null : "is not a valid email");
        },
        customTestFiled: (value) => {
            return !value ? null : (value === "test" ? null : "is not valid");
        },
        customFieldLessThan100: (value) => {
            return !value ? null : (value < 100 ? null : "is too large");
        }
    }

    validationDeclaration = {
        name: this.validationMethods["requiredField"],
        email: this.validationMethods["emailField"],
        signature: this.validationMethods["customTestFiled"],
        age: this.validationMethods["customFieldLessThan100"]
    }

    render() {
        return (
            <LanguageContext.Provider value={this.state}>
                <LanguageTogglerButton />
                <Form
                    formID={"user-profile-form"}
                    resourceURL={"form/"}
                    validationDeclaration={this.validationDeclaration}
                    HTTPMethod={"PATCH"}
                />
            </LanguageContext.Provider>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'))