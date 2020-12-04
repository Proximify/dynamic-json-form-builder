import {LanguageContext} from '../context/language-context';
import React from "react";

function LanguageTogglerButton() {
    return (
        <LanguageContext.Consumer>
            {({language, toggleLanguage}) => (
                <button
                    onClick={toggleLanguage}
                    style={{backgroundColor: language.color}}>
                    Change Language: {language.language}
                </button>
            )}
        </LanguageContext.Consumer>
    );
}

export default LanguageTogglerButton;