import React, {useState, useEffect, useContext, useRef} from "react";
import Select from "react-select";
import WindowedSelect from "react-windowed-select";
import {XIcon} from '@primer/octicons-react'
import 'bootstrap';
import style from './style.module.scss';
import api from './helper/api';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {language, LanguageContext} from './context/language-context';


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
export function MultiLangTextInputWidget(props) {
    console.log("MultiLangTextInputWidget", props);

    const {value} = props;
    const {language} = useContext(LanguageContext);
    const isFirstRun = useRef(true);
    const isLangFirstRun = useRef(true);

    const [state, setState] = useState({
        globalLanguage: language.language,
        isBilingual: false,
        primaryLanguage: "",
        secondaryLanguage: "",
        primaryContent: "",
        secondaryContent: "",
        discardedContent: ""
    });

    useEffect(() => {
        if (value) {
            let valueObj = JSON.parse(props.value);
            if (valueObj.language === "Bilingual") {
                const primaryLanguage = state.globalLanguage;
                const secondaryLanguage = primaryLanguage === "EN" ? "FR" : "EN";
                const primaryContent = valueObj[primaryLanguage];
                const secondaryContent = valueObj[secondaryLanguage];
                setState({
                    ...state,
                    isBilingual: true,
                    primaryLanguage: primaryLanguage,
                    primaryContent: primaryContent,
                    secondaryLanguage: secondaryLanguage,
                    secondaryContent: secondaryContent
                })
            } else {
                setState({
                    ...state,
                    primaryLanguage: valueObj.language,
                    primaryContent: valueObj[valueObj.language]
                })
            }
        } else {
            setState({...state, primaryLanguage: state.globalLanguage})
        }
    }, [])

    useEffect(() => {
        if (isLangFirstRun.current) {
            isLangFirstRun.current = false;
            return;
        }
        if (!value) {
            setState({...state, globalLanguage: language.language, primaryLanguage: language.language})
        } else {
            if (state.isBilingual) {
                const primaryLanguage = language.language;
                const secondaryLanguage = language.language === "EN" ? "FR" : "EN";
                const primaryContent = state.primaryLanguage !== primaryLanguage ? state.secondaryContent : state.primaryContent;
                const secondaryContent = state.primaryLanguage !== primaryLanguage ? state.primaryContent : state.secondaryContent;
                setState({
                    ...state, globalLanguage: language.language,
                    primaryLanguage: primaryLanguage,
                    primaryContent: primaryContent,
                    secondaryLanguage: secondaryLanguage,
                    secondaryContent: secondaryContent
                })
            } else {
                setState({
                    ...state,
                    globalLanguage: language.language,
                    primaryLanguage: language.language
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
        if (state.primaryLanguage === "EN") {
            if (state.globalLanguage === "EN") {
                setState({
                    ...state,
                    isBilingual: true,
                    secondaryLanguage: "FR",
                    secondaryContent: state.discardedContent,
                    discardedContent: ""
                })
            } else {
                setState({
                    ...state,
                    isBilingual: true,
                    primaryLanguage: "FR",
                    primaryContent: state.discardedContent,
                    secondaryLanguage: "EN",
                    secondaryContent: state.primaryContent,
                    discardedContent: ""
                })
            }
        } else {
            if (state.globalLanguage === "FR") {
                setState({
                    ...state,
                    isBilingual: true,
                    secondaryLanguage: "EN",
                    secondaryContent: state.discardedContent,
                    discardedContent: ""
                })
            } else {
                setState({
                    ...state,
                    isBilingual: true,
                    primaryLanguage: "EN",
                    primaryContent: state.discardedContent,
                    secondaryLanguage: "FR",
                    secondaryContent: state.primaryContent,
                    discardedContent: ""
                })
            }
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
                            <a className={`dropdown-item ${(state.primaryLanguage === "EN" && !state.isBilingual) ? "active" : ""}`}
                               href="#"
                               onClick={(event) => {
                                   if (state.isBilingual) {
                                       if (state.primaryLanguage === "EN") {
                                           setState({
                                               ...state,
                                               isBilingual: false,
                                               primaryLanguage: "EN",
                                               primaryContent: state.primaryContent !== "" ? state.primaryContent : state.secondaryContent,
                                               secondaryLanguage: "",
                                               secondaryContent: "",
                                               discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.secondaryContent : ""
                                           })
                                       } else {
                                           setState({
                                               ...state,
                                               isBilingual: false,
                                               primaryLanguage: "EN",
                                               primaryContent: state.secondaryContent !== "" ? state.secondaryContent : state.primaryContent,
                                               secondaryLanguage: "",
                                               secondaryContent: "",
                                               discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.primaryContent : ""
                                           })
                                       }
                                   } else {
                                       if (state.primaryLanguage === "FR") {
                                           setState({...state, primaryLanguage: "EN"})
                                       }
                                   }
                               }}>English only</a>
                            <a className={`dropdown-item ${(state.primaryLanguage === "FR" && !state.isBilingual) ? "active" : ""}`}
                               href="#"
                               onClick={(event) => {
                                   if (state.isBilingual) {
                                       if (state.primaryLanguage === "FR") {
                                           setState({
                                               ...state,
                                               isBilingual: false,
                                               primaryLanguage: "FR",
                                               primaryContent: state.primaryContent !== "" ? state.primaryContent : state.secondaryContent,
                                               secondaryLanguage: "",
                                               secondaryContent: "",
                                               discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.secondaryContent : ""
                                           })
                                       } else {
                                           setState({
                                               ...state,
                                               isBilingual: false,
                                               primaryLanguage: "FR",
                                               primaryContent: state.secondaryContent !== "" ? state.secondaryContent : state.primaryContent,
                                               secondaryLanguage: "",
                                               secondaryContent: "",
                                               discardedContent: (state.primaryContent !== "" && state.secondaryContent !== "") ? state.primaryContent : ""
                                           })
                                       }
                                   } else {
                                       if (state.primaryLanguage === "EN") {
                                           setState({...state, primaryLanguage: "FR"})
                                       }
                                   }
                               }}>French only</a>
                            <div role="separator" className="dropdown-divider"/>
                            <a className={`dropdown-item ${state.isBilingual ? "active" : ""}`}
                               href="#"
                               onClick={(event) => {
                                   if (!state.isBilingual) {
                                       handleLangChange()
                                   }
                               }}>Bilingual</a>
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
                   }}>{language.language === "EN"? "undo" : "restaurer"}</a>
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
