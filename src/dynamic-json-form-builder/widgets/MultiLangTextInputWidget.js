import React, {useContext, useEffect, useRef, useState} from "react";
import 'bootstrap';
import {XIcon} from "@primer/octicons-react";

/**
 * This is the custom widget for multiple languages input field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 // */
export function MultiLangTextInputWidget(props) {
    // console.log("MultiLangTextInputWidget", props);

    const {value} = props;
    const {language} = useContext(props.formContext.globalContext.LanguageContext);
    const style = props.formContext.style;
    const isFirstRun = useRef(true);
    const isLangFirstRun = useRef(true);

    const [state, setState] = useState({
        isBilingual: false,
        primaryLanguage: "",
        secondaryLanguage: "",
        primaryContent: "",
        secondaryContent: "",
        discardedContent: "",
        languageList: []
    });

    const languageLabel = {
        EN: "English",
        FR: "French",
        SP: "Spanish"
    }

    useEffect(() => {
        if (value) {
            let valueObj = JSON.parse(props.value);
            const languageList = props.registry.rootSchema["fieldLanguages"].map(lang => lang.toUpperCase()) ?? [document.documentElement.lang.toUpperCase()];
            if (valueObj.language === "Bilingual" && languageList.length === 2) {
                const htmlPageLang = document.documentElement.lang;
                const primaryLanguage = languageList.includes(htmlPageLang.toUpperCase()) ? htmlPageLang.toUpperCase() : languageList[0];
                const secondaryLanguage = primaryLanguage === languageList[0] ? languageList[1] : languageList[0];
                const primaryContent = valueObj.hasOwnProperty(primaryLanguage) ? valueObj[primaryLanguage] : "";
                const secondaryContent = valueObj.hasOwnProperty(secondaryLanguage) ?valueObj[secondaryLanguage] : "";
                setState({
                    ...state,
                    isBilingual: true,
                    primaryLanguage: primaryLanguage,
                    primaryContent: primaryContent,
                    secondaryLanguage: secondaryLanguage,
                    secondaryContent: secondaryContent,
                    languageList: languageList
                })
            } else {
                setState({
                    ...state,
                    primaryLanguage: valueObj.language,
                    primaryContent: valueObj[valueObj.language],
                    languageList: languageList
                })
            }
        } else {
            const languageList = props.registry.rootSchema["fieldLanguages"].map(lang => lang.toUpperCase()) ?? [document.documentElement.lang.toUpperCase()];
            setState({...state, primaryLanguage: document.documentElement.lang.toUpperCase(),languageList: languageList})
        }
    }, [])

    useEffect(() => {
        if (isLangFirstRun.current) {
            isLangFirstRun.current = false;
            return;
        }
        if (!value) {
            if (state.isBilingual){
                if (state.languageList.includes(document.documentElement.lang.toUpperCase())){
                    const primaryLanguage = document.documentElement.lang.toUpperCase();
                    const secondaryLanguage = primaryLanguage === state.languageList[0] ? state.languageList[1] : state.languageList[0];
                    setState({
                        ...state,
                        primaryLanguage: primaryLanguage,
                        secondaryLanguage: secondaryLanguage
                    })
                }
            }else {
                if (state.languageList.includes(document.documentElement.lang.toUpperCase()))
                    setState({...state, primaryLanguage: document.documentElement.lang.toUpperCase()})
            }
        } else if (state.languageList.includes(document.documentElement.lang.toUpperCase())) {
            if (state.isBilingual && state.languageList.length === 2) {
                const primaryLanguage = document.documentElement.lang.toUpperCase();
                const secondaryLanguage = primaryLanguage === state.languageList[0] ? state.languageList[1] : state.languageList[0];
                const primaryContent = state.primaryLanguage !== primaryLanguage ? state.secondaryContent : state.primaryContent;
                const secondaryContent = state.primaryLanguage !== primaryLanguage ? state.primaryContent : state.secondaryContent;
                setState({
                    ...state,
                    primaryLanguage: primaryLanguage,
                    primaryContent: primaryContent,
                    secondaryLanguage: secondaryLanguage,
                    secondaryContent: secondaryContent
                })
            } else {
                if (!state.isBilingual && (!state.primaryContent || state.primaryContent === "")) {
                    setState({
                        ...state,
                        primaryLanguage: document.documentElement.lang.toUpperCase()
                    })
                }
            }
        }

        handleChange()

    }, [language])

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        handleChange();
    }, [state.isBilingual, state.primaryLanguage, state.secondaryLanguage])

    const handleChange = () => {
        let newValue;
        if (state.isBilingual) {
            newValue = {
                language: "Bilingual",
                [state.languageList[0]]: state.primaryLanguage === state.languageList[0] ? state.primaryContent : state.secondaryContent,
                [state.languageList[1]]: state.primaryLanguage === state.languageList[1] ? state.primaryContent : state.secondaryContent,
            }
        } else {
            newValue = {
                language: state.primaryLanguage,
                [state.primaryLanguage]: state.primaryContent
            }
        }
        if (value !== JSON.stringify(newValue)) {
            props.onChange(JSON.stringify(newValue));
        }
    }

    const handleLangChange = () => {
        // handle language change from 1 to 2
        if (state.languageList.length < 2)
            return;

        if (state.primaryLanguage === document.documentElement.lang.toUpperCase()) {
            setState({
                ...state,
                isBilingual: true,
                secondaryLanguage: state.primaryLanguage === state.languageList[0] ? state.languageList[1] : state.languageList[0],
                secondaryContent: state.discardedContent,
                discardedContent: ""
            })
        } else {
            setState({
                ...state,
                isBilingual: true,
                primaryLanguage: state.primaryLanguage === state.languageList[0] ? state.languageList[1] : state.languageList[0],
                primaryContent: state.discardedContent,
                secondaryLanguage: state.primaryLanguage,
                secondaryContent: state.primaryContent,
                discardedContent: ""
            })
        }
    }

    return (
        <div id={`${props.id}_multi_lang_input_group`}>
            <div className="my-auto text-center input-group">
                <input
                    className={"col-lg-12 col-sm-12 form-control"}
                    type="text"
                    id={props.schema.id}
                    value={state.primaryContent}
                    required={props.required}
                    onChange={(event) => {
                        setState({...state, primaryContent: event.target.value})
                    }}
                    onBlur={() => {
                        handleChange()
                    }}
                />
                <div className="input-group-append">
                    <div className="btn-group dropright">
                        <button type="button"
                                className={`btn ${style.btnLanguage} dropdown-toggle p-0`}
                                data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false"
                                id={`${props.id}_lang_btn`}>{state.primaryLanguage}
                        </button>

                        <div className="dropdown-menu" id={`${props.id}_multi_lang_selection_dropdown`}>
                            {state.languageList.map((lang, index) => {
                                return (
                                    <a className={`dropdown-item ${(state.primaryLanguage === lang && !state.isBilingual) ? "active" : ""}`}
                                       href="#"
                                       onClick={() => {
                                           if (state.isBilingual) {
                                               if (state.primaryLanguage === lang) {
                                                   setState({
                                                       ...state,
                                                       isBilingual: false,
                                                       primaryContent: state.primaryContent !== "" ? state.primaryContent : state.secondaryContent,
                                                       secondaryLanguage: "",
                                                       secondaryContent: "",
                                                       discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.secondaryContent : ""
                                                   })
                                               } else {
                                                   setState({
                                                       ...state,
                                                       isBilingual: false,
                                                       primaryLanguage: state.secondaryLanguage,
                                                       primaryContent: state.secondaryContent !== "" ? state.secondaryContent : state.primaryContent,
                                                       secondaryLanguage: "",
                                                       secondaryContent: "",
                                                       discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.primaryContent : ""
                                                   })
                                               }

                                           } else {
                                               if (state.primaryLanguage !== lang) {
                                                   setState({...state, primaryLanguage: lang})
                                               }
                                           }
                                       }}>{languageLabel[lang]} Only</a>
                                )
                            })}
                            {state.languageList.length === 2 ?
                                <a className={`dropdown-item ${state.isBilingual ? "active" : ""}`}
                                   href="#"
                                   onClick={() => {
                                       if (!state.isBilingual) {
                                           handleLangChange()
                                       }
                                   }}>Bilingual</a>
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`my-auto text-center input-group pt-1 ${!state.isBilingual ? "d-none" : ""}`}>
                <input
                    className={`col-lg-12 col-sm-12 form-control`}
                    type="text"
                    value={state.secondaryContent}
                    onChange={(event) => {
                        setState({...state, secondaryContent: event.target.value})
                    }}
                    onBlur={() => {
                        handleChange()
                    }}
                />
                <div className={`input-group-append`}>
                    <button type="button"
                            className={`btn ${style.btnLanguage} p-0 pl-1"`}
                            onClick={(event) => {
                                setState({
                                    ...state,
                                    isBilingual: false,
                                    secondaryLanguage: "",
                                    secondaryContent: "",
                                    discardedContent: state.secondaryContent
                                })
                            }}>{state.secondaryLanguage}<XIcon verticalAlign='middle' size={13}/>
                    </button>
                </div>
            </div>
            <div>
                <a className={`btn ${style.btnUndo} ${!state.discardedContent ? "d-none" : ""}`}
                   onClick={() => {
                       handleLangChange()
                   }}>{language.language === "EN" ? "undo" : "restaurer"}</a>
            </div>
        </div>
    );
}