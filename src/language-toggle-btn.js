import {language, LanguageContext} from './language-context';
import React from "react";
import 'bootstrap'

function LanguageTogglerButton(props) {
    const languages = {
        EN: "English",
        FR: "French",
        SP: "Spanish"
    }

    return (
        <LanguageContext.Consumer>
            {({language, toggleLanguage}) => (
                <div className="btn-group">
                    <button type="button" className="btn btn-info dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        Change Language:
                    </button>

                    <div className="dropdown-menu">
                        {
                            props.pageLanguages.map((value, index) => {
                                return (
                                    <a className={`dropdown-item ${value === language.language.toUpperCase() ? "active" : ""}`}
                                       href="#" key={index}
                                       onClick={() => toggleLanguage(value)}>{languages[value]}</a>
                                )
                            })
                        }
                    </div>
                </div>
            )}
        </LanguageContext.Consumer>
    );

}

export default LanguageTogglerButton;