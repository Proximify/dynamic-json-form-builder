import React, {useState} from "react";
import Select from "react-select";
import WindowedSelect from "react-windowed-select";
import {XIcon} from '@primer/octicons-react'
import 'bootstrap';
import style from './style.module.scss';
// import './style.module.scss';
import axios from 'axios';

/**
 * This is the custom widget for single input field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function TextInputWidget(props) {
    console.log("TextInputWidget", props);
    const [value, setValue] = useState(props.value);
    return (
        <div className="my-auto">
            {/*<label htmlFor={props.schema.id} className="col-sm-2 col-form-label my-auto">{props.schema.title}{props.required ? "*" : null}</label>*/}
            <input
                className={"col-lg-12 col-sm-12 form-control"}
                type="text"
                id={props.schema.id}
                value={value ?? ""}
                required={props.required}
                onChange={(event) => {
                    if (!props.rawErrors || props.rawErrors.length === 0) {
                        // console.log("a");
                        setValue(event.target.value);
                    } else {
                        // console.log("b");
                        setValue(event.target.value);

                        props.onChange(event.target.value)
                    }
                    // console.log("c");

                }}
                onBlur={(event) =>
                    props.onChange(value)
                }
            />
        </div>
    );
}

/**
 * This is the custom widget for multiple languages input field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function MultiLangTextInputWidget(props) {
    // console.log("MultiLangTextInputWidget", props);
    const [deletedContent, setDeletedContent] = useState();
    let currentLanguage = "EN";

    const handleChange = (value, newLang) => {
        if (currentLanguage === newLang)
            return;
        setDeletedContent(undefined);
        if (newLang !== null) {
            const currentInputValue = props.value ? JSON.parse(props.value) : {language: "", EN: "", FR: ""}
            // 2 => 1
            if (currentInputValue.language === "Bilingual") {
                let newValueObj = null;
                if (newLang === "FR") {
                    if (currentInputValue.FR !== "") {
                        newValueObj = {
                            language: newLang,
                            FR: currentInputValue.FR,
                        }
                    } else {
                        newValueObj = {
                            language: newLang,
                            FR: currentInputValue.EN,
                        }
                    }
                } else if (newLang === "EN") {
                    newValueObj = {
                        language: newLang,
                        EN: currentInputValue.EN,
                    }
                }
                props.onChange(JSON.stringify(newValueObj));
            } else {
                // 1 => 2
                if (newLang === "Bilingual") {
                    let newValueObj;
                    if (value) {
                        newValueObj = {
                            language: newLang,
                            EN: currentInputValue.EN ?? "",
                            FR: value.content,
                        }
                    } else {
                        newValueObj = {
                            language: newLang,
                            EN: currentInputValue.EN ?? "",
                            FR: currentInputValue.FR ?? "",
                        }
                    }
                    props.onChange(JSON.stringify(newValueObj));
                }
                // 1 => 1
                else {
                    if (newLang === "EN") {
                        let newValueObj = {
                            language: newLang,
                            EN: currentInputValue.FR ?? ""
                        }
                        props.onChange(JSON.stringify(newValueObj));
                    } else {
                        let newValueObj = {
                            language: newLang,
                            FR: currentInputValue.EN ?? ""
                        }
                        props.onChange(JSON.stringify(newValueObj));
                    }
                }
            }
        } else {
            if (!value.hasOwnProperty("lang")) {
                console.warn("value missing lang property");
                return;
            }
            const currentInputValue = props.value ? JSON.parse(props.value) : {language: "", EN: "", FR: ""}
            if (currentInputValue.language === "Bilingual") {
                if (value.lang === "EN") {
                    let newValueObj = {
                        language: currentInputValue.language,
                        EN: value.content,
                        FR: currentInputValue.FR ?? "",
                    }
                    props.onChange(JSON.stringify(newValueObj));
                } else {
                    let newValueObj = {
                        language: currentInputValue.language,
                        EN: currentInputValue.EN ?? "",
                        FR: value.content,
                    }
                    props.onChange(JSON.stringify(newValueObj));
                }
            } else {
                if (value.lang === "EN") {
                    let newValueObj = {
                        language: value.lang,
                        EN: value.content
                    }
                    props.onChange(JSON.stringify(newValueObj));
                } else {
                    let newValueObj = {
                        language: value.lang,
                        FR: value.content
                    }
                    props.onChange(JSON.stringify(newValueObj));
                }
            }
        }
    }

    const getValue = () => {
        if (props.value) {
            let currentValueObj = JSON.parse(props.value);
            currentLanguage = currentValueObj.language;
            return (currentValueObj.language === "Bilingual") ? currentValueObj.EN : (currentValueObj.hasOwnProperty("EN") ? currentValueObj.EN : currentValueObj.FR);
        } else {
            currentLanguage = "EN";
            return "";
        }
    }

    return (
        <div id={`${props.id}_multi_lang_input_group`}>
            <div className="my-auto text-center input-group">
                <input
                    className={"col-lg-12 col-sm-12 form-control"}
                    type="text"
                    id={props.schema.id}
                    value={getValue()}
                    required={props.required}
                    onChange={(event) => handleChange({
                        lang: (currentLanguage === "Bilingual") ? "EN" : currentLanguage,
                        content: event.target.value
                    }, null)}
                />
                <div className="input-group-append">
                    <div className="btn-group dropright">
                        <button type="button"
                                className={`btn ${style.btnLanguage} dropdown-toggle p-0`}
                                data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false"
                                id={`${props.id}_lang_btn`}>{(currentLanguage === "Bilingual") ? "EN" : currentLanguage}
                        </button>
                        <div className="dropdown-menu" id={`${props.id}_multi_lang_selection_dropdown`}>
                            <a className={`dropdown-item ${currentLanguage === "EN" ? "active" : ""}`}
                               href="#"
                               onClick={(event) => {
                                   handleChange(null, "EN");
                               }}>English only</a>
                            <a className={`dropdown-item ${currentLanguage === "FR" ? "active" : ""}`}
                               href="#"
                               onClick={(event) => {
                                   handleChange(null, "FR");
                               }}>French only</a>
                            <div role="separator" className="dropdown-divider"/>
                            <a className={`dropdown-item ${currentLanguage === "Bilingual" ? "active" : ""}`}
                               href="#"
                               onClick={(event) => {
                                   handleChange(null, "Bilingual");
                               }}>Bilingual</a>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`my-auto text-center input-group pt-1 ${(!props.value || JSON.parse(props.value).language !== "Bilingual") ? "d-none" : ""}`}>
                <input
                    className={`col-lg-12 col-sm-12 form-control`}
                    type="text"
                    value={props.value ? (JSON.parse(props.value).FR ?? "") : ""}
                    onChange={(event) => handleChange({lang: "Bilingual", content: event.target.value}, null)}
                />
                <div className={`input-group-append`}>
                    <button type="button"
                            className={`btn ${style.btnLanguage} p-0 pl-1"`}
                            onClick={(event) => {
                                const temp = event.currentTarget.parentElement.parentElement.firstChild.value;
                                //console.log(event.currentTarget.parentElement.parentElement.firstChild.value);
                                handleChange(null, "EN");
                                setDeletedContent(temp);
                            }}>FR<XIcon verticalAlign='middle' size={13}/>
                    </button>
                </div>
            </div>
            <div>
                <a className={`btn ${style.btnUndo} ${!deletedContent ? "d-none" : ""}`}
                   onClick={() => {
                       handleChange({content: deletedContent}, "Bilingual");
                   }}>undo</a>
            </div>
        </div>
    );
}

/**
 * This is the custom widget for single select field that use React-Select
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function SingleSelectWidget(props) {
    // console.log("SelectorWidget", props);
    const {options, onChange, value} = props;

    const handleChange = (value) => {
        console.log("Selected!!", value);
        if (value === null) {
            props.onChange(undefined);
        } else {
            props.onChange(value.value);
        }
    }
    return (
        <div className="my-auto">
            {/*<label htmlFor={props.schema.id} className="col-sm-2 col-form-label my-auto">{props.schema.title}</label>*/}
            <div className="col-lg-12 col-sm-12 p-0">
                <Select
                    id={props.schema.id}
                    options={options.enumOptions}
                    defaultValue={options.enumOptions[options.enumOptions.map(function (e) {
                        return e.value;
                    }).indexOf(value)]}
                    onChange={handleChange}
                    isClearable={true}
                />
            </div>
        </div>
    );
}

/**
 * This is the custom widget for single select field that use React-Windowed-Select
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function WindowedSelectorWidget(props) {
    // console.log("WindowedSelectorWidget", props);
    const {options, onChange, value} = props;

    const handleChange = (value) => {
        console.log("Selected!!", value);
        if (value === null) {
            props.onChange(undefined);
        } else {
            props.onChange(value.value);
        }
    }

    return (
        <div>
            {/*<label htmlFor={props.schema.id} className="col-sm-2 col-form-label my-auto">{props.schema.title}</label>*/}
            <WindowedSelect
                isClearable={true}
                onChange={handleChange}
                defaultValue={options.enumOptions[options.enumOptions.map(function (e) {
                    return e.value;
                }).indexOf(value)]}
                options={options.enumOptions}
            />
        </div>
    );
}

/**
 * This is the custom widget for single multi-col select field that use React-Select
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function MultiColSelectorWidget(props) {
    console.log("MultiColSelectorWidget", props);
    const {options, onChange, value} = props;
    const enumItems = options.enumOptions;

    const handleChange = (value) => {
        console.log("Selected!!", value);
        if (value === null) {
            props.onChange(undefined);
        } else {
            props.onChange(value.value);
        }
    }

    const formatOptionLabel = ({label, value}) => (
        <table className={"table"}>
            <tbody>
            <tr>
                <td className={"w-25 p-2"}>{value[0]}</td>
                <td className={"w-25 p-2"}>{value[1]}</td>
                <td className={"w-25 p-2"}>{value[2]}</td>
                <td className={"w-25 p-2"}>{value[3]}</td>
            </tr>
            </tbody>
        </table>
    );

    return (
        <div>
            {/*<strong>{props.label}</strong>*/}
            <Select
                options={enumItems}
                onChange={handleChange}
                formatOptionLabel={formatOptionLabel}
                defaultValue={options.enumOptions[options.enumOptions.map(function (e) {
                    return e.value.join('');
                }).indexOf((value) ? value.join('') : "")]}
                isClearable
            />
        </div>
    );
}

/**
 * This is the custom widget for single select field that use React-Select
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function FileInputWidget(props) {
    //console.log("FileInputWidget", props);
    let files = [];

    const handleChange = () => {
        console.log("file has been upload, should put in uploads folder");
        // if (files.length > 0) {
        //     const data = new FormData();
        //     files.forEach(file => {
        //         data.append('file[]', file)
        //     })
        //     axios.post("file/upload/", data, {
        //         headers: {
        //             'Content-Type': 'multipart/form-data'
        //         }
        //     })
        //         .then(res => {
        //             console.log(res.data)
        //         }).catch(err => {
        //         console.log(err)
        //     })
        // }
    }
    return (
        <div className={"row"}>
            <input className={"py-1"} type="file" name="file" id={`${props.id}_input`}
                   accept={props.schema.accepts.join(",")} onChange={(event) => {
                files = event.target.files
            }} multiple/>
            <a className={"btn btn-primary"} onClick={handleChange}>UPLOAD</a>
        </div>
    )
}

export default TextInputWidget;
