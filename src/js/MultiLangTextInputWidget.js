import React, {useContext, useEffect, useRef, useState} from "react";
import 'bootstrap';
import {language, LanguageContext} from './context/language-context';
import style from "./style.module.scss";
import {XIcon} from "@primer/octicons-react";

/**
 * This is the custom widget for multiple languages input field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 // */
export function MultiLangTextInputWidget(props) {
    console.log("MultiLangTextInputWidget", props);

    const {value} = props;
    const {language} = useContext(LanguageContext);
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

    useEffect(() => {
        if (value) {
            let valueObj = JSON.parse(props.value);
            const languageList = props.registry.rootSchema["fieldLanguages"].map(lang => lang.toUpperCase()) ?? [document.documentElement.lang.toUpperCase()];
            if (valueObj.language === "Bilingual" && languageList.length === 2) {
                const primaryLanguage = document.documentElement.lang.toUpperCase();
                const secondaryLanguage = primaryLanguage === languageList[0] ? languageList[1] : languageList[0];
                const primaryContent = valueObj[primaryLanguage];
                const secondaryContent = valueObj[secondaryLanguage];
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
            setState({...state, primaryLanguage: document.documentElement.lang.toUpperCase()})
        }
    }, [])

    useEffect(() => {
        if (isLangFirstRun.current) {
            isLangFirstRun.current = false;
            return;
        }
        if (!value) {
            setState({...state, primaryLanguage: document.documentElement.lang.toUpperCase()})
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
            }
        }
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
                EN: state.primaryLanguage === "EN" ? state.primaryContent : state.secondaryContent,
                FR: state.primaryLanguage === "FR" ? state.primaryContent : state.secondaryContent,
            }
        } else {
            if (state.primaryLanguage === "EN") {
                newValue = {
                    language: "EN",
                    EN: state.primaryContent,
                }
            } else {
                newValue = {
                    language: "FR",
                    FR: state.primaryContent,
                }
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


        // if (state.primaryLanguage === "EN") {
        //     if (document.documentElement.lang.toUpperCase() === "EN") {
        //         setState({
        //             ...state,
        //             isBilingual: true,
        //             secondaryLanguage: "FR",
        //             secondaryContent: state.discardedContent,
        //             discardedContent: ""
        //         })
        //     } else {
        //         setState({
        //             ...state,
        //             isBilingual: true,
        //             primaryLanguage: "FR",
        //             primaryContent: state.discardedContent,
        //             secondaryLanguage: "EN",
        //             secondaryContent: state.primaryContent,
        //             discardedContent: ""
        //         })
        //     }
        // } else {
        //     if (document.documentElement.lang.toUpperCase() === "FR") {
        //         setState({
        //             ...state,
        //             isBilingual: true,
        //             secondaryLanguage: "EN",
        //             secondaryContent: state.discardedContent,
        //             discardedContent: ""
        //         })
        //     } else {
        //         setState({
        //             ...state,
        //             isBilingual: true,
        //             primaryLanguage: "EN",
        //             primaryContent: state.discardedContent,
        //             secondaryLanguage: "FR",
        //             secondaryContent: state.primaryContent,
        //             discardedContent: ""
        //         })
        //     }
        // }
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
                                               if (state.primaryLanguage === lang){
                                                   setState({
                                                       ...state,
                                                       isBilingual: false,
                                                       primaryContent: state.primaryContent !== "" ? state.primaryContent : state.secondaryContent,
                                                       secondaryLanguage: "",
                                                       secondaryContent: "",
                                                       discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.secondaryContent : ""
                                                   })
                                               }else {
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
                                       }}>{lang} Only</a>
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


                            {/*<a className={`dropdown-item ${(state.primaryLanguage === "EN" && !state.isBilingual) ? "active" : ""}`}*/}
                            {/*   href="#"*/}
                            {/*   onClick={(event) => {*/}
                            {/*       if (state.isBilingual) {*/}
                            {/*           if (state.primaryLanguage === "EN") {*/}
                            {/*               setState({*/}
                            {/*                   ...state,*/}
                            {/*                   isBilingual: false,*/}
                            {/*                   primaryLanguage: "EN",*/}
                            {/*                   primaryContent: state.primaryContent !== "" ? state.primaryContent : state.secondaryContent,*/}
                            {/*                   secondaryLanguage: "",*/}
                            {/*                   secondaryContent: "",*/}
                            {/*                   discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.secondaryContent : ""*/}
                            {/*               })*/}
                            {/*           } else {*/}
                            {/*               setState({*/}
                            {/*                   ...state,*/}
                            {/*                   isBilingual: false,*/}
                            {/*                   primaryLanguage: "EN",*/}
                            {/*                   primaryContent: state.secondaryContent !== "" ? state.secondaryContent : state.primaryContent,*/}
                            {/*                   secondaryLanguage: "",*/}
                            {/*                   secondaryContent: "",*/}
                            {/*                   discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.primaryContent : ""*/}
                            {/*               })*/}
                            {/*           }*/}
                            {/*       } else {*/}
                            {/*           if (state.primaryLanguage === "FR") {*/}
                            {/*               setState({...state, primaryLanguage: "EN"})*/}
                            {/*           }*/}
                            {/*       }*/}
                            {/*   }}>English only</a>*/}
                            {/*<a className={`dropdown-item ${(state.primaryLanguage === "FR" && !state.isBilingual) ? "active" : ""}`}*/}
                            {/*   href="#"*/}
                            {/*   onClick={(event) => {*/}
                            {/*       if (state.isBilingual) {*/}
                            {/*           if (state.primaryLanguage === "FR") {*/}
                            {/*               setState({*/}
                            {/*                   ...state,*/}
                            {/*                   isBilingual: false,*/}
                            {/*                   primaryLanguage: "FR",*/}
                            {/*                   primaryContent: state.primaryContent !== "" ? state.primaryContent : state.secondaryContent,*/}
                            {/*                   secondaryLanguage: "",*/}
                            {/*                   secondaryContent: "",*/}
                            {/*                   discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.secondaryContent : ""*/}
                            {/*               })*/}
                            {/*           } else {*/}
                            {/*               setState({*/}
                            {/*                   ...state,*/}
                            {/*                   isBilingual: false,*/}
                            {/*                   primaryLanguage: "FR",*/}
                            {/*                   primaryContent: state.secondaryContent !== "" ? state.secondaryContent : state.primaryContent,*/}
                            {/*                   secondaryLanguage: "",*/}
                            {/*                   secondaryContent: "",*/}
                            {/*                   discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.primaryContent : ""*/}
                            {/*               })*/}
                            {/*           }*/}
                            {/*       } else {*/}
                            {/*           if (state.primaryLanguage === "EN") {*/}
                            {/*               setState({...state, primaryLanguage: "FR"})*/}
                            {/*           }*/}
                            {/*       }*/}
                            {/*   }}>French only</a>*/}
                            {/*<div role="separator" className="dropdown-divider"/>*/}
                            {/*<a className={`dropdown-item ${state.isBilingual ? "active" : ""}`}*/}
                            {/*   href="#"*/}
                            {/*   onClick={(event) => {*/}
                            {/*       if (!state.isBilingual) {*/}
                            {/*           handleLangChange()*/}
                            {/*       }*/}
                            {/*   }}>Bilingual</a>*/}
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