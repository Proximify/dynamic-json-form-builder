import React, {useState} from "react";
import Select from "react-select";
import WindowedSelect from "react-windowed-select";
import {XIcon} from '@primer/octicons-react'
import 'bootstrap';
import style from './style.module.scss';
import api from './helper/api';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import {Consumer} from './context/language-context';


// import './style.module.scss';


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
                        setValue(event.target.value);
                    } else {
                        setValue(event.target.value);

                        props.onChange(event.target.value)
                    }
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
// TODO: refactor use state
export function MultiLangTextInputWidget(props) {
    console.log("MultiLangTextInputWidget", props);
    const [deletedContent, setDeletedContent] = useState();
    let currentLanguage = null;

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


    // const [value] = props;
    //
    // const [state, setState] = useState({
    //     primaryLanguage: null,
    //     secondaryLanguage: null,
    //     primaryContent: null,
    //     secondaryContent: null
    // });
    //
    // const getValue = () => {
    //     if (value) {
    //         let contentObj = JSON.parse(props.value);
    //         currentLanguage = currentValueObj.language;
    //         return (currentValueObj.language === "Bilingual") ? currentValueObj.EN : (currentValueObj.hasOwnProperty("EN") ? currentValueObj.EN : currentValueObj.FR);
    //     } else {
    //         return "";
    //     }
    // }
    //
    // return (
    //     <div id={`${props.id}_multi_lang_input_group`}>
    //         <div className="my-auto text-center input-group">
    //
    //             <input
    //                 className={"col-lg-12 col-sm-12 form-control"}
    //                 type="text"
    //                 id={props.schema.id}
    //                 value={getValue()}
    //                 required={props.required}
    //                 onChange={(event) => handleChange({
    //                     lang: (currentLanguage === "Bilingual") ? "EN" : currentLanguage,
    //                     content: event.target.value
    //                 }, null)}
    //             />
    //             <div className="input-group-append">
    //                 <div className="btn-group dropright">
    //                     <Consumer>{
    //                         ({globalLanguage}) => <button type="button"
    //                                                       className={`btn ${style.btnLanguage} dropdown-toggle p-0`}
    //                                                       data-toggle="dropdown"
    //                                                       aria-haspopup="true" aria-expanded="false"
    //                                                       id={`${props.id}_lang_btn`}>{(currentLanguage === "Bilingual") ? "EN" : currentLanguage}
    //                         </button>
    //                     }</Consumer>
    //
    //                     <div className="dropdown-menu" id={`${props.id}_multi_lang_selection_dropdown`}>
    //                         <a className={`dropdown-item ${currentLanguage === "EN" ? "active" : ""}`}
    //                            href="#"
    //                            onClick={(event) => {
    //                                handleChange(null, "EN");
    //                            }}>English only</a>
    //                         <a className={`dropdown-item ${currentLanguage === "FR" ? "active" : ""}`}
    //                            href="#"
    //                            onClick={(event) => {
    //                                handleChange(null, "FR");
    //                            }}>French only</a>
    //                         <div role="separator" className="dropdown-divider"/>
    //                         <a className={`dropdown-item ${currentLanguage === "Bilingual" ? "active" : ""}`}
    //                            href="#"
    //                            onClick={(event) => {
    //                                handleChange(null, "Bilingual");
    //                            }}>Bilingual</a>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //         <div
    //             className={`my-auto text-center input-group pt-1 ${(!props.value || JSON.parse(props.value).language !== "Bilingual") ? "d-none" : ""}`}>
    //             <input
    //                 className={`col-lg-12 col-sm-12 form-control`}
    //                 type="text"
    //                 value={props.value ? (JSON.parse(props.value).FR ?? "") : ""}
    //                 onChange={(event) => handleChange({lang: "Bilingual", content: event.target.value}, null)}
    //             />
    //             <div className={`input-group-append`}>
    //                 <button type="button"
    //                         className={`btn ${style.btnLanguage} p-0 pl-1"`}
    //                         onClick={(event) => {
    //                             const temp = event.currentTarget.parentElement.parentElement.firstChild.value;
    //                             //console.log(event.currentTarget.parentElement.parentElement.firstChild.value);
    //                             handleChange(null, "EN");
    //                             setDeletedContent(temp);
    //                         }}>FR<XIcon verticalAlign='middle' size={13}/>
    //                 </button>
    //             </div>
    //         </div>
    //         <div>
    //             <a className={`btn ${style.btnUndo} ${!deletedContent ? "d-none" : ""}`}
    //                onClick={() => {
    //                    handleChange({content: deletedContent}, "Bilingual");
    //                }}>undo</a>
    //         </div>
    //     </div>
    // );


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
    console.log("FileInputWidget", props);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [loaded, setLoaded] = useState(0);

    // list allow mime type
    const types = ['application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png', 'image/jpeg', 'image/jpg']

    const checkMimeType = (event) => {
        //getting file object
        let files = event.target.files
        //define message container
        let err = []
        // loop access array
        for (let x = 0; x < files.length; x++) {
            // compare file type find doesn't match
            if (!types.includes(files[x].type)) {
                // create error message and assign to container
                err[x] = files[x].type + ' is not a supported format\n';
            }
        }
        for (let z = 0; z < err.length; z++) {// if message not same old that mean has error
            // discard selected file
            toast.error(err[z])
            event.target.value = null
        }
        return true;
    }

    const maxSelectFile = (event) => {
        let files = event.target.files
        if (files.length > 5) {
            const msg = 'Only 5 images can be uploaded at a time'
            event.target.value = null
            toast.warn(msg)
            return false;
        }
        return true;
    }

    const checkFileSize = (event) => {
        let files = event.target.files
        let size = 2000000
        let err = [];
        for (let x = 0; x < files.length; x++) {
            if (files[x].size > size) {
                err[x] = files[x].type + 'is too large, please pick a smaller file\n';
            }
        }
        for (let z = 0; z < err.length; z++) {// if message not same old that mean has error
            // discard selected file
            toast.error(err[z])
            event.target.value = null
        }
        return true;
    }

    const onChangeHandler = event => {
        let files = event.target.files
        if (maxSelectFile(event) && checkMimeType(event) && checkFileSize(event)) {
            // if return true allow to setState
            setSelectedFiles(files);
            setLoaded(0);
        }
    }

    const onClickHandler = () => {
        if (!selectedFiles)
            return;
        const data = new FormData();
        for (let x = 0; x < selectedFiles.length; x++) {
            data.append('files', selectedFiles[x])
        }
        api.post("/file/", data, {
            onUploadProgress: ProgressEvent => {
                setLoaded(ProgressEvent.loaded / ProgressEvent.total * 100);
            },
        })
            .then(res => { // then print response status
                toast.success('upload success');
            })
            .catch(err => { // then print response status
                toast.error('upload fail');
            })
    }

    return (
        <div className={"container p-2"}>
            <div className={"row"}>
                <input className={"py-1"} type="file" name="file" id={`${props.id}_input`}
                       accept={types} onChange={onChangeHandler} multiple/>
                <a className={"btn btn-primary"} onClick={onClickHandler}>UPLOAD</a>
            </div>
            <div className={"row mt-1"}>
                <ToastContainer/>
                <div className={`progress ${selectedFiles ? "visible" : "invisible"}`}
                     style={{width: '26%', height: '10px'}}>
                    <div className={"progress-bar progress-bar-striped progress-bar-animated"} role={"progressbar"}
                         style={{width: `${loaded}%`}}
                         aria-valuenow={loaded} aria-valuemin="0"
                         aria-valuemax="100">{Number(loaded.toFixed(2))}%
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TextInputWidget;
