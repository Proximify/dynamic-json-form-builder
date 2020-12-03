import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import {PlusCircleIcon, PencilIcon, XIcon} from '@primer/octicons-react'
import Modal from 'react-modal';
import style from './style.module.scss';
import FileViewer from 'react-file-viewer';
import ModalStyle from './helper/ModalStyles.json'
import api from './helper/api';
import FileDownload from 'js-file-download';
// import { Consumer } from './context/language-context';


Modal.setAppElement("#root");

export function CustomHeaderTemplate(props) {
    const {id, label, children, description, errors, help, required} = props;
    return (
        <div className={`form-group row justify-content-center`}>
            <div className="col-lg-12 col-md-12 col-11 my-3">
                {/*<Consumer>{*/}
                {/*    ({globalLanguage}) => <h5>Global Language: {globalLanguage}</h5>*/}
                {/*}*/}
                {/*</Consumer>*/}
                {children}
            </div>
        </div>
    );
}

/**
 * This is the custom template for single input or selection field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function CustomFieldTemplate(props) {
    const {id, label, children, description, errors, help, required, rawErrors} = props;
    console.log("CustomFieldTemplate", props);
    return (
        <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
            <label htmlFor={id}
                   className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{label}{required ? "*" : null}</label>
            <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                {children}
                {rawErrors ? rawErrors.map((error, index) => {
                    return (<li className={style.msgError} key={index}>{error}</li>)
                }) : null}
            </div>
        </div>
    );
}

/**
 * This is the custom template for array field
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
// TODO: need refactor delete and add
export function CustomArrayFieldTemplate(props) {
    const {title, items, canAdd, onAddClick, help, required, formData} = props;
    const [isOpen, setIsOpen] = useState(false);
    const [itemIndex, setItemIndex] = useState(-1);
    const [isAddNew, setIsAddNew] = useState(false);
    const [currentData, setCurrentData] = useState(null);

    // This function read the formData parsed in and extract the data and create HTML elements for each record
    const getItemList = () => {
        const listItem = []
        formData.forEach((element, i) => {
            let html;
            html = <li className={"list-group-item p-1"} key={i}>
                <div className={"row h-50"}>
                    <div className={"col-10"}>
                        <p className={"font-weight-normal m-0 d-inline-block text-truncate"}
                           style={{maxWidth: "100%"}}>
                            {element[Object.keys(element)[0]] ? (Array.isArray(element[Object.keys(element)[0]]) ? element[Object.keys(element)[0]].join(", ") : element[Object.keys(element)[0]]) : ""}
                        </p>
                    </div>
                    <div className={"col-2"}>
                        <a href="#"
                           id={`${title}_modal_item_edit_btn_${i}`}
                           className={"btn btn-outline-custom border-0 btn-small float-right py-0"}
                           onClick={(e) => {
                               setIsOpen(true);
                               setItemIndex(i);
                               setIsAddNew(false);
                               setCurrentData(props.items[i].children.props.formData);
                           }}
                        ><PencilIcon size={16}/>
                        </a>
                    </div>
                </div>
                <div className={"row"}>
                    <div className={"col-10"}>
                        <p className={"font-weight-light m-0 d-inline-block text-truncate"}
                           style={{maxWidth: "100%"}}>
                            {element[Object.keys(element)[1]] ? (Array.isArray(element[Object.keys(element)[1]]) ? element[Object.keys(element)[1]].join(", ") : element[Object.keys(element)[1]]) : ""}
                        </p>
                    </div>
                    <div className={"col-2"}>
                        <a href="#"
                           id={`${title}_modal_item_delete_btn_${i}`}
                           className={"btn btn-outline-custom border-0 btn-small float-right py-0"}
                           onClick={items[i].onDropIndexClick(items[i].index)}
                        ><XIcon size={16}/>
                        </a>
                    </div>
                </div>
            </li>
            listItem.push(html);
            if (Object.keys(element).length === 0) {
                const newItemBtnEle = document.getElementById(`${title}_modal_item_edit_btn_${i}`);
                console.log(isOpen, itemIndex, i, isAddNew)
                if (newItemBtnEle && !isOpen && itemIndex !== i) {
                    setIsOpen(true);
                    setItemIndex(i);
                }
            }
        })
        return listItem;
    }

    function ModalFormValidator(formData) {
        let valid = false;
        if (Object.keys(formData).length === 0) {
            valid = false;
        }
        Object.keys(formData).forEach(element => {
            if (formData[element] !== undefined) {
                valid = true;
            }
        })
        return valid;
    }

    /**
     * This is the modal defination
     * @returns {JSX.Element}
     * @constructor
     */
    const ModalContent = () => {
        return (
            <Modal
                isOpen={isOpen}
                contentLabel={`${title} Modal`}
                id={`${title}_modal_${itemIndex}`}
                style={ModalStyle.modalSM}
            >
                <div className={"pt-3"}>
                    {items[itemIndex].children}
                </div>
                {console.log(currentData)}
                <div className={"d-flex align-items-end justify-content-end"}>
                    <button className={"btn btn-outline-secondary mr-2 mt-3"}
                            onClick={(e) => {
                                if (isAddNew) {
                                    const deleteItemBtnEle = document.getElementById(`${title}_modal_item_delete_btn_${itemIndex}`);
                                    deleteItemBtnEle.click();
                                } else {
                                    props.items[itemIndex].children.props.onChange(currentData)
                                }
                                setItemIndex(-1);
                                setIsOpen(false);
                            }}>Cancel
                    </button>
                    <button className={"btn btn-outline-primary mt-3"}
                            disabled={ModalFormValidator(items[itemIndex].children.props.formData) === false}
                            onClick={(e) => {
                                setIsOpen(false)
                            }}>Save
                    </button>
                </div>
            </Modal>
        )
    }

    return (
        <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
            <label className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{title}{required ? "*" : null}</label>
            <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                {canAdd &&
                <button type="button" className={"btn btn-light btn-link my-1"} onClick={() => {
                    setItemIndex(-1);
                    setIsAddNew(true);
                    return onAddClick();
                }}>< PlusCircleIcon
                    size={16}/></button>}
                <div>
                    <ul className={"list-group"}>
                        {getItemList()}
                    </ul>
                </div>
                <div id={`${title}_modal`}>
                    {isOpen ? <ModalContent/> : null}
                </div>
            </div>
        </div>
    )
}

/**
 * This is the custom template for file upload field, it use React's useStare and useEffect feature that can use
 * axois.get() to get file list and display the list of file.
 * When user upload file, it will invoke the field's widget to handle upload event
 * When the user click the individual file, it send HTTP get request that fetch the file data from server
 * When the user click delete button, it send a HTTP delete request to the server
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
// TODO: url not generic
export function CustomUploadFieldTemplate(props) {
    console.log("CustomUploadFieldTemplate", props);
    const {id, label, children, required, title} = props;

    const [state, setState] = useState({
        isLoading: true,
        fileList: null,
        selectFileIndex: null,
        isUploadModalOpen: false,
        isPreviewModalOpen: false
    })

    useEffect(() => {
        const getFileList = () => {
            api.get("file/").then(res => {
                const files = res.data.data;
                setState({...state, isLoading: false, fileList: files})
            }).catch(err => {
                console.log("err", err);
                setState({...state, isLoading: false})
            })
        }
        if (state.isLoading) {
            getFileList();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isLoading]);

    if (state.isLoading) {
        return (
            <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
                <label htmlFor={id}
                       className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{label}{required ? "*" : null}</label>
                <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                    <button type="button" className={"btn btn-light btn-link my-1"} onClick={() => {
                        setState({...state, isUploadModalOpen: true});
                    }}>< PlusCircleIcon
                        size={16}/></button>
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    const ModalAddContent = () => {
        return (
            <Modal
                isOpen={state.isUploadModalOpen}
                contentLabel="File Add Modal"
                id={`${title}_add_modal`}
                style={ModalStyle.modalXS}
            >
                <div className={"container"}>
                    {children}
                    <div className={"d-flex justify-content-end"}>
                        {/*<button className={"btn btn-outline-secondary mr-2 mt-3"}*/}
                        {/*        onClick={() => {*/}
                        {/*            setState({...state, isLoading: true, fileList: null, isUploadModalOpen: false});*/}
                        {/*        }}>Cancel*/}
                        {/*</button>*/}
                        <button className={"btn btn-outline-secondary mt-3"}
                                onClick={() => {
                                    setState({...state, isLoading: true, fileList: null, isUploadModalOpen: false});
                                }}>Close
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }

    const ModalEditContent = () => {
        return (
            <Modal
                isOpen={state.isPreviewModalOpen}
                contentLabel="File Edit Modal"
                id={`${title}_edit_modal`}
                closeOnEscape={true}
                style={ModalStyle.modalLR}
            >
                <div className={"row h-100"}>
                    <div className={"col col-2"}>
                        <button className={"btn btn-outline-primary mt-2 mr-2"} onClick={() => {
                            setState({...state, selectFileIndex: null, isPreviewModalOpen: false});
                        }}>Close
                        </button>
                        <a href="#"
                           className={"btn btn-outline-success mt-2 mr-2"}
                           onClick={() => {
                               handleFileDownload(state.selectFileIndex);
                           }}
                        >Download</a>
                    </div>
                    <div className={"col col-10"}>
                        <h2>File Content</h2>
                        <div className={"border border-secondary h-75 p-2 py-2"}>
                            <FileViewer
                                fileType={state.fileList[state.selectFileIndex].split('.').pop()}
                                filePath={`http://127.0.0.1:443/file/${state.fileList[state.selectFileIndex]}`}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }

    const handleFileDownload = (index) => {
        let fileName = state.fileList[index];
        api.get(`/file/${fileName}`, {responseType: 'blob'}).then(res => {
            console.log(window.URL.createObjectURL(new Blob([res.data])))

            FileDownload(res.data, fileName);
        }).catch(err => {
            console.log(err)
        })
    }

    const handleFileDelete = (index) => {
        let fileName = state.fileList[index];
        api.delete(`/file/${fileName}`).then(res => {
            setState({...state, isLoading: true, fileList: null});
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
            <label htmlFor={id}
                   className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{label}{required ? "*" : null}</label>
            <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                <button type="button" className={"btn btn-light btn-link my-1"} onClick={() => {
                    setState({...state, isUploadModalOpen: true});
                }}>< PlusCircleIcon
                    size={16}/></button>
                <div>
                    <ul className={"list-group"}>
                        {state.fileList ? state.fileList.map((element, index) => {
                            return (
                                <li className={"list-group-item p-1"} key={index}>
                                    <div className={"row"}>
                                        <div className={"col col-10 py-0"}>
                                            <p className={"m-0 d-inline-block text-truncate"}
                                               style={{maxWidth: "100%"}}
                                               onClick={(event) => {
                                                   setState({...state, selectFileIndex: index, isPreviewModalOpen: true});
                                               }}>{element}
                                            </p>
                                        </div>
                                        <div className={"col col-2"}>
                                            <a href="#"
                                               className={"btn btn-outline-custom border-0 btn-small float-right py-0 px-0"}
                                               onClick={(event) => handleFileDelete(index)}
                                            ><XIcon size={16}/></a>
                                        </div>
                                    </div>
                                </li>
                            )
                        }) : null}
                    </ul>
                </div>
                <div id={`${title}_add_modal`}>
                    {state.isUploadModalOpen ? <ModalAddContent/> : null}
                </div>
                <div id={`${title}_edit_modal`}>
                    {state.isPreviewModalOpen ? <ModalEditContent/> : null}
                </div>
            </div>
        </div>
    )
}

export default CustomHeaderTemplate;

