import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import {PlusCircleIcon, PencilIcon, XIcon} from '@primer/octicons-react'
import Modal from 'react-modal';
import FileViewer from 'react-file-viewer';
import ModalStyle from './helper/ModalStyles.json'
import * as fs from 'fs';
import axios from 'axios';
import style from './style.module.scss';

export function CustomHeaderTemplate(props) {
    const {id, label, children, description, errors, help, required} = props;
    return (
        <div className={`form-group row justify-content-center`} >
            <div className="col-lg-12 col-md-12 col-11 my-3">
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
    const {id, label, children, description, errors, help, required} = props;
    return (
        <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
            <label htmlFor={id}
                   className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{label}{required ? "*" : null}</label>
            <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                {children}
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
    const [isOpen, setIsOpen] = useState(false);
    const [itemIndex, setItemIndex] = useState(-1);
    const [isAddNew, setIsAddNew] = useState(false);
    const [currentData, setCurrentData] = useState(null);
    const {title, items, canAdd, onAddClick, help, required, formData} = props;
    console.log("ArrayFiledTemplate", props);
    // console.log("isOpen", isOpen, "itemIndex", itemIndex, "isAddNew", isAddNew)
    Modal.setAppElement("#root");

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

// export function testArrayFieldTemplate(props) {
//     console.log("testArrayFieldTemplate", props);
//     // const [isNeedSave, setIsNeedSave] = useState(false);
//     const [count, setCount] = useState(0);
//     useEffect(() => {
//         console.log("component did mount");
//         console.log("existed item", props.formData);
//     }, [])
//
//     useEffect(() => {
//         console.log("formData has been update");
//         // if (props.items.length){
//         //     // console.log(props.onAddClick.toString())
//         //     // console.log(props.items[0].onAddIndexClick.toString())
//         //
//         //     //props.items[props.items.length - 1].onDropIndexClick(props.items.length - 1)
//         //    //  let lastRecordValue = props.items[props.items.length - 1].children.props.formData;
//         //    //  console.log(lastRecordValue)
//         //    //  // Object.keys(lastRecordValue).forEach(key =>{
//         //    //  //     console.log(key,lastRecordValue[key])
//         //    //  //
//         //    //  // })
//         //    // props.items[0].children.props.onChange(lastRecordValue)
//         //     //return props.items[props.items.length - 1].onAddIndexClick(props.items.length - 1);
//         // }
//         console.log(props.formData)
//     }, [count])
//
//
//     return (
//         <div className={""}>
//             {props.items.map(element => element.children)}
//             {props.canAdd && <button type="button" onClick={props.onAddClick}>ADD</button>}
//             <a className={"btn"} onClick={ ()=>{
//                 let lastRecordValue = props.items[props.items.length - 1].children.props.formData;
//                 props.items[0].children.props.onChange(lastRecordValue)
//                 setCount(count + 1)}
//                 //props.items[props.items.length - 1].onAddIndexClick(0)}
//             }>Save</a>
//         </div>
//     );
// }

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
export function CustomUploadFieldTemplate(props) {
    //console.log("CustomUploadFieldTemplate", props);
    const {id, label, children, description, errors, help, required, title} = props;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [fileList, setFileList] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    Modal.setAppElement("#root");

    useEffect(() => {
        axios.get("https://powerful-brushlands-46492.herokuapp.com/").then(response => {
            console.log(response);
            setLoading(false);
            // setFileList(response.data);
            setFileList("");
        });
        setLoading(false);
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
                <label htmlFor={id}
                       className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{label}{required ? "*" : null}</label>
                <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                    <button type="button" className={"btn btn-light btn-link my-1"} onClick={() => {
                        setIsAddOpen(true);
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
                isOpen={isAddOpen}
                contentLabel="File Add Modal"
                id={`${title}_add_modal`}
                style={ModalStyle.modalXS}
            >
                <div className={"container"}>
                    {children}
                    <div className={"d-flex justify-content-end"}>
                        <button className={"btn btn-outline-secondary mr-2 mt-3"}
                                onClick={(e) => {
                                    setLoading(true)
                                    setFileList("")
                                    setIsAddOpen(false)
                                }}>Cancel
                        </button>
                        <button className={"btn btn-outline-primary mt-3"}
                                onClick={(e) => {
                                    setIsAddOpen(false)
                                    setLoading(true)
                                    setFileList("")
                                }}>Save
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }

    const ModalEditContent = () => {
        return (
            <Modal
                isOpen={isEditOpen}
                contentLabel="File Edit Modal"
                id={`${title}_edit_modal`}
                closeOnEscape={true}
                style={ModalStyle.modalLR}
            >
                <div className={"row h-100"}>
                    <div className={"col col-2"}>
                        <button className={"btn btn-outline-primary mt-2 mr-2"} onClick={() => {
                            setIsEditOpen(false);
                            setSelectedFile(null);
                        }}>Close
                        </button>
                        <a href={`../../uploads/${selectedFile}`}
                           className={"btn btn-outline-success mt-2 mr-2"}>Download</a>
                    </div>
                    <div className={"col col-10"}>
                        <h2>File Content</h2>
                        <div className={"border border-secondary h-75 p-2 py-2"}>
                            <FileViewer
                                fileType={selectedFile.split('.').pop()}
                                filePath={`../../uploads/${selectedFile}`}
                            /></div>
                    </div>
                </div>
            </Modal>
        )
    }

    const handleFileDelete = (event) => {
        // console.log(event.currentTarget)
        let fileName = event.currentTarget.parentElement.parentElement.firstChild.firstChild.innerHTML;
        // axios.delete(`file/delete/${fileName}`).then(res => {
        //     setLoading(true);
        //     setFileList("");
        //     setIsAddOpen(false);
        //     console.log(res);
        // }).catch(err => {
        //     console.log(err)
        // })
        console.log("should delete file nd then get file uploads");
            setLoading(true);
            setFileList("");
            setIsAddOpen(false);
    }

    return (
        <div className="form-group row justify-content-center mx-auto my-xl-3 my-lg-3 my-md-2 my-sm-2 my-0">
            <label htmlFor={id}
                   className="col-lg-4 col-md-3 col-sm-3 col-10 col-form-label">{label}{required ? "*" : null}</label>
            <div className="col-lg-8 col-md-9 col-sm-9 col-10">
                <button type="button" className={"btn btn-light btn-link my-1"} onClick={() => {
                    setIsAddOpen(true);
                }}>< PlusCircleIcon
                    size={16}/></button>
                <div>
                    <ul className={"list-group"}>
                        {fileList !== "" ? fileList.split(" ").map((element, index) => {
                            return (
                                <li className={"list-group-item p-1"} key={index}>
                                    <div className={"row"}>
                                        <div className={"col col-10 py-0"}>
                                            <p className={"m-0 d-inline-block text-truncate"}
                                               style={{maxWidth: "100%"}}
                                               onClick={(event) => {
                                                   setSelectedFile(event.currentTarget.innerHTML);
                                                   setIsEditOpen(true);
                                               }}>{element}
                                            </p>
                                        </div>
                                        <div className={"col col-2"}>
                                            <a href="#"
                                               className={"btn btn-outline-custom border-0 btn-small float-right py-0 px-0"}
                                               onClick={(event) => handleFileDelete(event)}
                                            ><XIcon size={16}/></a>
                                        </div>
                                    </div>
                                </li>
                            )
                        }) : ""}
                    </ul>
                </div>
                <div id={`${title}_add_modal`}>
                    {isAddOpen ? <ModalAddContent/> : null}
                </div>
                <div id={`${title}_edit_modal`}>
                    {isEditOpen ? <ModalEditContent/> : null}
                </div>
            </div>
        </div>
    )
}

export default CustomHeaderTemplate;

