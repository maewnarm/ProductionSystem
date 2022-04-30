import React, { PureComponent } from 'react';
import './scss/DocSetting.scss';
import axios from 'axios';
import {
    Button,
    Table,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    FormText,
    Input,
    UncontrolledTooltip,
    InputGroup,
    Pagination,
    PaginationItem,
    PaginationLink,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEdit,
    faTrash,
    faEye,
    faPlusCircle,
    faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
const showPage = 5
const perPage = 10

var naturalSortMCno = function (a, b) {
    return ('' + a.mcno).localeCompare(('' + b.mcno), 'en', { numeric: true });
}

var naturalSortDocType = function (a, b) {
    return ('' + a.doctype).localeCompare(('' + b.doctype), 'en', { numeric: true });
}

class DocumentSetting extends PureComponent {
    state = {
        mcList: [],
        docMCList: [],
        pageMCShow: [],
        pageDocShow: [],
        filteredMClist: [],
        filteredDocMCList: [],
        mcnoView: true,
        docmcView: false,
        currentViewNo: "",
        selectType: "...",
        selectFile: "",
        findType: "All",
        editPathEnable: {},
        editFileEnable: {},
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getMCLists();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getMCLists = async () => {
        console.log("get st")
        api.get(`/docview/mcnodist/`)
            .then(mclist => {
                console.log(mclist.data)
                this.setState({
                    mcList: mclist.data,
                    filteredMClist: mclist.data
                })
            })
            .catch(error => alert(error))
    }

    getDocLists = async (mcno) => {
        api.get(`/docview/${mcno}`)
            .then(doclist => {
                this.setState({
                    docMCList: doclist.data,
                    filteredDocMCList: doclist.data
                })
            })
            .catch(error => alert(error))
    }

    checkAddMCno = (e) => {
        const mclist = this.state.mcList
        var flag = false
        mclist.forEach(list => {
            if (list.mcno === e) {
                flag = true
            }
        })
        this.setState({
            mcnoRepeated: flag
        })
    }

    addMCno = () => {
        const mcno = document.getElementById('add-mcno').value
        if (mcno === "") {
            alert("Machine no is empty")
        } else if (this.state.mcnoRepeated) {
            alert("Machine no is already exists")
        } else {
            api.post(`/docview/create/`, {
                mcno: mcno,
                doctype: "none"
            })
                .then(res => {
                    console.log(res)
                    this.getMCLists()
                })
                .catch(err => console.log(err))
        }
    }

    toggleView = (mcno, flag, procname) => {
        //flag is select process or not
        this.setState({
            currentViewNo: mcno,
            mcnoView: false,
            docmcView: true
        }, () => {
            this.getDocLists(mcno)
        })
    }

    toggleEdit = (id, mcno) => {
        this.setState({
            isModalEditOpen: !this.state.isModalEditOpen,
            listid: id,
            mcnoEdit: mcno
        });
        //console.log("open")
    }

    toggleDelete = (itemid, type, msg) => {
        var delText = ""
        switch (type) {
            case "mcno":
                delText = `Machine no: ${msg}`
                break
            case "doc":
                delText = `Document no: ${msg}`
                break
            default:
                delText = ""
        }
        this.setState({
            Deleteitemid: itemid,
            DeleteType: type,
            deleteText: delText,
            isModalDeleteOpen: !this.state.isModalDeleteOpen,
        })
    }

    createMCPagination = () => {
        //console.log(this.state.filtereditemlist.length)
        const pgamount = Math.ceil(this.state.filteredMClist.length / perPage)
        //console.log(pgamount)
        var arrPage = []
        for (var i = 1; i <= pgamount; i++) {
            if (i <= showPage) {
                arrPage = [...arrPage, i]
            }
        }
        this.setState({
            pageMCAmount: pgamount,
            pageMCActive: 1,
            pageMCShow: arrPage
        })
    }

    clickMCPagination = (pg) => {
        //console.log(pg)
        //console.log(this.state.pageItemAmount)
        const pgItemAmount = this.state.pageItemAmount
        if (pg >= 1 && pg <= pgItemAmount) {
            this.setState({
                pageItemActive: pg
            })
        }
        var arrpageShow = this.state.pageItemShow
        //console.log(arrpageShow[0])
        if (pg === 1) {
            arrpageShow = []
            for (var i = 1; i <= showPage; i++) {
                if (i <= pgItemAmount) {
                    arrpageShow = [...arrpageShow, i]
                }
            }
        } else if (pg === pgItemAmount) {
            arrpageShow = []
            for (var j = 1; j <= showPage; j++) {
                if (pgItemAmount - showPage + j > 0) {
                    arrpageShow = [...arrpageShow, pgItemAmount - showPage + j]
                }
            }
        }
        if (pg === arrpageShow[arrpageShow.length - 1] && pg < pgItemAmount && pg > arrpageShow[0]) {
            arrpageShow.forEach((item, ind) => {
                arrpageShow[ind] += 1
            })
        } else if (pg === arrpageShow[0] && pg > 1) {
            arrpageShow.forEach((item, ind) => {
                arrpageShow[ind] -= 1
            })
        }
        this.setState({
            pageItemShow: arrpageShow
        })
    }

    createDocPagination = () => {
        //console.log(this.state.filtereditemlist.length)
        const pgamount = Math.ceil(this.state.filteredDocMCList.length / perPage)
        //console.log(pgamount)
        var arrPage = []
        for (var i = 1; i <= pgamount; i++) {
            if (i <= showPage) {
                arrPage = [...arrPage, i]
            }
        }
        this.setState({
            pageDocAmount: pgamount,
            pageDocActive: 1,
            pageDocShow: arrPage
        })
    }

    clickDocPagination = (pg) => {
        //console.log(pg)
        //console.log(this.state.pageItemAmount)
        const pgItemAmount = this.state.pageDocAmount
        if (pg >= 1 && pg <= pgItemAmount) {
            this.setState({
                pageItemActive: pg
            })
        }
        var arrpageShow = this.state.pageDocShow
        //console.log(arrpageShow[0])
        if (pg === 1) {
            arrpageShow = []
            for (var i = 1; i <= showPage; i++) {
                if (i <= pgItemAmount) {
                    arrpageShow = [...arrpageShow, i]
                }
            }
        } else if (pg === pgItemAmount) {
            arrpageShow = []
            for (var j = 1; j <= showPage; j++) {
                if (pgItemAmount - showPage + j > 0) {
                    arrpageShow = [...arrpageShow, pgItemAmount - showPage + j]
                }
            }
        }
        if (pg === arrpageShow[arrpageShow.length - 1] && pg < pgItemAmount && pg > arrpageShow[0]) {
            arrpageShow.forEach((item, ind) => {
                arrpageShow[ind] += 1
            })
        } else if (pg === arrpageShow[0] && pg > 1) {
            arrpageShow.forEach((item, ind) => {
                arrpageShow[ind] -= 1
            })
        }
        this.setState({
            pageDocShow: arrpageShow
        })
    }

    SearchByMC = (mcno) => {
        //const partno = document.getElementById('part-search').value
        var filtered = []
        //console.log(this.state.lists)
        this.state.mcList.forEach((item) => {
            if (item.mcno.includes(mcno)) {
                filtered = [...filtered, item]
            }
        })
        filtered.sort(naturalSortMCno)
        //console.log(filtered)
        this.setState({
            filteredMClist: filtered,
        }, () => {
            this.createMCPagination()
        })
    }

    checkRepeatmcnoEdit = (e) => {
        const mclist = this.state.mcList
        const curMCno = this.state.mcnoEdit
        var flag = false
        mclist.forEach(list => {
            if (list.mcno === e && e !== curMCno) {
                flag = true
            }
        })
        this.setState({
            mcnoEditRepeated: flag
        })
    }

    updateList = async () => {
        const oldMCno = this.state.mcnoEdit
        const newMCno = document.getElementById('mcnomodal').value
        await api.put(`/docview/mcnoupdate/${oldMCno}_${newMCno}`)
            .then(res => {
                console.log(res)
                this.getMCLists()
                this.toggleEdit()
            })
            .catch(err => console.log(err))
    }

    deleteList = async (id) => {
        const type = this.state.DeleteType
        var apiurl = ""
        if (type === "mcno") {
            apiurl = `/docview/${id}/delete/`
        } else if (type === "doc") {
            apiurl = `/controlitems/${id}/delete/`
        } else {
            alert("delete type error")
            return
        }
        await api.delete(apiurl)
            .then(res => {
                console.log(res)
                if (type === "mcno") {
                    this.getMCLists();
                    this.setState({
                        isModalDeleteOpen: false,
                    })
                } else if (type === "doc") {
                    this.setState({
                        isModalDeleteOpen: false,
                    }, () => {
                        this.toggleView(this.state.currentViewNo, false)
                    })
                }
            })
            .catch(error => alert(error))
    }

    unControlToolTipPack = (targetid, text) => {
        return (
            <UncontrolledTooltip placement="top" target={targetid} hideArrow={true} >
                {text}
            </UncontrolledTooltip>
        )
    }

    toggleSettingType = () => {
        this.setState({
            settingTypeOpen: !this.state.settingTypeOpen
        })
    }

    SettingTypeSelect = (type) => {
        this.setState({
            selectType: type
        })
    }

    addFile = (e) => {
        console.log(e.target.files)
        var filename = ""
        if (e.target.files.length === 1) {
            filename = e.target.files[0].name
        } else {
            alert("Select File error")
        }
        this.setState({
            selectFile: filename
        })
    }

    insertDoc = async () => {
        const mcno = this.state.currentViewNo
        const type = this.state.selectType
        const path = document.getElementById('docpathinput').value
        const filename = this.state.selectFile
        if (type === "...") {
            alert("Please select Document type")
        } else if (filename === "") {

        }
        api.post(`/docview/create/`, {
            mcno: mcno,
            doctype: type,
            docpath: path,
            docfile: filename
        })
            .then(res => {
                console.log(res)
                this.getDocLists(mcno)
                this.setState({
                    selectType: "...",
                })
                document.getElementById('docfileinput').value = null
            })
            .catch(err => console.log(err))
    }

    deleteDoc = async (id) => {
        var conf = window.confirm("Are you sure to delete ?")
        if (conf) {
            await api.delete(`/docview/${id}/delete/`)
                .then(res => {
                    console.log(res)
                    this.getDocLists(this.state.currentViewNo)
                })
                .catch(err => console.log(err))
        }
    }

    backToMCno = () => {
        this.setState({
            mcnoView: true,
            docmcView: false,
            currentViewNo: "",
            docMCList: [],
            filteredDocMCList: [],
        })
    }

    SearchByFile = (file) => {
        //const partno = document.getElementById('part-search').value
        var filtered = []
        const type = this.state.findType
        //console.log(this.state.lists)
        this.state.docMCList.forEach((item) => {
            if (item.docpath.includes(file)) {
                console.log(type)
                console.log(item.doctype)
                if (type === "All" || type === item.doctype) {
                    filtered = [...filtered, item]
                }
            }
        })
        filtered.sort(naturalSortDocType)
        //console.log(filtered)
        this.setState({
            filteredDocMCList: filtered,
        }, () => {
            this.createDocPagination()
        })
    }

    toggleFindType = () => {
        this.setState({
            findTypeOpen: !this.state.findTypeOpen
        })
    }

    findTypeSelect = (type) => {
        this.setState({
            findType: type
        }, () => {
            const file = document.getElementById('file-search').value
            this.SearchByFile(file)
        })
    }

    editFilePath = (id) => {
        this.setState({
            editPathEnable: {
                ...this.state.editPathEnable,
                [id]: !this.state.editPathEnable[id]
            }
        })
    }

    saveEditPath = async (id) => {
        const newpath = document.getElementById(`filepath-${id}`).value
        await api.patch(`/docview/${id}/update/`, {
            docpath: newpath
        })
            .then(res => {
                console.log(res)
                this.getDocLists(this.state.currentViewNo)
                this.setState({
                    editPathEnable: {
                        ...this.state.editPathEnable,
                        [id]: false
                    }
                })
            })
            .catch(err => console.log(err))
    }

    cancelEditPath = (id) => {
        document.getElementById(`filepath-${id}`).value = document.getElementById(`filepath-${id}`).defaultValue
        this.setState({
            editPathEnable: {
                ...this.state.editPathEnable,
                [id]: false
            }
        })
    }

    editFileName = (id) => {
        this.setState({
            editFileEnable: {
                ...this.state.editFileEnable,
                [id]: !this.state.editFileEnable[id]
            }
        })
    }

    addEditFile = async (files, id) => {
        if (files.length === 1) {
            await api.patch(`/docview/${id}/update/`, {
                docfile: files[0].name
            })
                .then(res => {
                    console.log(res)
                    this.getDocLists(this.state.currentViewNo)
                    this.setState({
                        editFileEnable: {
                            ...this.state.editFileEnable,
                            [id]: false
                        }
                    })
                })
                .catch(err => console.log(err))
        } else {
            alert("Edit Document path error")
        }
    }

    render() {
        return (
            <div className="doc-set-table-div">
                <h1 className="title">Machine Setting Path</h1>
                {this.state.mcnoView &&
                    <div className="doc-set-mcview">
                        <div className="doc-set-add-mcno">
                            <span>Machine no. :</span>
                            <Input type="text" id="add-mcno" onChange={(e) => this.checkAddMCno(e.currentTarget.value)}></Input>
                            {this.state.mcnoRepeated && <FormText className="repeated-ht">Machine no. is repeated</FormText>}
                            <Button color="primary" onClick={() => this.addMCno()}>Add</Button>
                        </div>
                        <div className="item-table-head">
                            <div className="regis-table-search">
                                <p className="search-txt">{'Search MC no.'}</p>
                                <InputGroup>
                                    <Input placeholder="Input Control items no. ..." id="mc-search" onChange={(e) => this.SearchByMC(e.target.value)} autoComplete="off" />
                                </InputGroup>
                            </div>
                            <div className="regis-table-page">
                                <Pagination aria-label="Page navigation example">
                                    <PaginationItem >
                                        <PaginationLink first onClick={() => this.clickMCPagination(1)} disabled={this.state.pageMCActive === 1 || this.state.pageMCAmount === 0} />
                                    </PaginationItem>
                                    <PaginationItem >
                                        <PaginationLink previous onClick={() => this.clickMCPagination(this.state.pageMCActive - 1)} disabled={this.state.pageMCActive === 1 || this.state.pageMCAmount === 0} />
                                    </PaginationItem>
                                    {this.state.pageMCShow.map((i, index) => {
                                        return (
                                            <PaginationItem key={index} active={this.state.pageMCActive === i}>
                                                <PaginationLink onClick={() => this.clickMCPagination(i)}>
                                                    {i}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    })}
                                    <PaginationItem>
                                        <PaginationLink next onClick={() => this.clickMCPagination(this.state.pageMCActive + 1)} disabled={this.state.pageMCActive === this.state.pageMCAmount || this.state.pageMCAmount === 0} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink last onClick={() => this.clickMCPagination(this.state.pageMCAmount)} disabled={this.state.pageMCActive === this.state.pageMCAmount || this.state.pageMCAmount === 0} />
                                    </PaginationItem>
                                </Pagination>
                            </div>
                        </div>
                        <Table striped hover responsive>
                            <thead>
                                <tr>
                                    <th id="doc-mc-col0"></th>
                                    <th id="doc-mc-col1">Machine no.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.filteredMClist.sort(naturalSortMCno).map((list, ind) => (
                                    <tr key={list.id}>
                                        <td>
                                            <FontAwesomeIcon id={`viewEditPart${ind}`} icon={faEye} onClick={() => this.toggleView(list.mcno, false)} />
                                            <FontAwesomeIcon id={`editEditPart${ind}`} icon={faEdit} onClick={() => this.toggleEdit(list.id, list.mcno)} />
                                            <FontAwesomeIcon id={`deleteEditPart${ind}`} icon={faTrash} onClick={() => this.toggleDelete(list.id, "mcno", list.mcno)} />
                                            {this.unControlToolTipPack(`viewEditPart${ind}`, "View")}
                                            {this.unControlToolTipPack(`editEditPart${ind}`, "Edit")}
                                            {this.unControlToolTipPack(`deleteEditPart${ind}`, "Delete")}
                                        </td>
                                        <td>{list.mcno}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                }

                {this.state.docmcView &&
                    <div className="doc-set-docview">
                        <div className="doc-set-head">
                            <FontAwesomeIcon id="backtoMCno" icon={faAngleDoubleLeft} onClick={() => this.backToMCno()} />
                            {this.unControlToolTipPack("backtoMCno", "Back")}
                            <span>Current Machine no : </span>
                            <span>{this.state.currentViewNo}</span>
                        </div>
                        <div className="item-table-head">
                            <div className="regis-table-search">
                                <p className="search-txt">{'Search File name'}</p>
                                <InputGroupButtonDropdown
                                    className="doc-setting-type"
                                    addonType="append" isOpen={this.state.findTypeOpen} toggle={this.toggleFindType}>
                                    <DropdownToggle caret>
                                        {this.state.findType}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => this.findTypeSelect("All")} >{"All"}</DropdownItem>
                                        <DropdownItem onClick={() => this.findTypeSelect("PCS")} >{"PCS"}</DropdownItem>
                                        <DropdownItem onClick={() => this.findTypeSelect("FMEA")} >{"FMEA"}</DropdownItem>
                                        <DropdownItem onClick={() => this.findTypeSelect("KAKOTORA")} >{"KAKOTORA"}</DropdownItem>
                                    </DropdownMenu>
                                </InputGroupButtonDropdown>
                                <InputGroup>
                                    <Input placeholder="Input File name ..." id="file-search" onChange={(e) => this.SearchByFile(e.target.value)} autoComplete="off" />
                                </InputGroup>
                            </div>
                            <div className="regis-table-page">
                                <Pagination aria-label="Page navigation example">
                                    <PaginationItem >
                                        <PaginationLink first onClick={() => this.clickDocPagination(1)} disabled={this.state.pageDocActive === 1 || this.state.pageDocAmount === 0} />
                                    </PaginationItem>
                                    <PaginationItem >
                                        <PaginationLink previous onClick={() => this.clickDocPagination(this.state.pageDocActive - 1)} disabled={this.state.pageDocActive === 1 || this.state.pageDocAmount === 0} />
                                    </PaginationItem>
                                    {this.state.pageDocShow.map((i, index) => {
                                        return (
                                            <PaginationItem key={index} active={this.state.pageDocActive === i}>
                                                <PaginationLink onClick={() => this.clickDocPagination(i)}>
                                                    {i}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    })}
                                    <PaginationItem>
                                        <PaginationLink next onClick={() => this.clickDocPagination(this.state.pageDocActive + 1)} disabled={this.state.pageDocActive === this.state.pageDocAmount || this.state.pageDocAmount === 0} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink last onClick={() => this.clickDocPagination(this.state.pageDocAmount)} disabled={this.state.pageDocActive === this.state.pageDocAmount || this.state.pageDocAmount === 0} />
                                    </PaginationItem>
                                </Pagination>
                            </div>
                        </div>
                        <Table striped hover responsive>
                            <thead>
                                <tr>
                                    <th id="doc-col1">no.</th>
                                    <th id="doc-col2">Document Type</th>
                                    <th id="doc-col3">Document Path</th>
                                    <th id="doc-col4">Document File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.filteredDocMCList.sort(naturalSortDocType).map((list, ind) => (
                                    <tr key={list.id}>
                                        <td className="td-col1">
                                            {ind + 1}
                                            <FontAwesomeIcon id="deletedoc" icon={faTrash} onClick={() => this.deleteDoc(list.id)} />
                                            {this.unControlToolTipPack("deletedoc", "Delete")}
                                        </td>
                                        <td className="td-col2">{list.doctype}</td>
                                        <td className="td-col3">
                                            <Input id={`filepath-${list.id}`} defaultValue={list.docpath} autoComplete="off" type="text" disabled={!this.state.editPathEnable[list.id]} />
                                            {this.state.editPathEnable[list.id] &&
                                                <>
                                                    <Button color="success" onClick={() => this.saveEditPath(list.id)}>save</Button>
                                                    <Button color="danger" onClick={() => this.cancelEditPath(list.id)}>cancel</Button>
                                                </>
                                            }
                                            <FontAwesomeIcon id="editpath" icon={faEdit} onClick={() => this.editFilePath(list.id)} />
                                            {this.unControlToolTipPack("editpath", "Edit Path")}
                                        </td>
                                        <td>
                                            {list.docfile}
                                            <FontAwesomeIcon id="editfile" icon={faEdit} onClick={() => this.editFileName(list.id)} />
                                            {this.unControlToolTipPack("editfile", "Edit File")}
                                            {this.state.editFileEnable[list.id] &&
                                                <FormGroup>
                                                    <Input type="file" id="docfileedit" onChange={(e) => this.addEditFile(e.target.files, list.id)} />
                                                </FormGroup>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                <tr key="add-doc-table">
                                    <td className="add-col1">
                                        <FontAwesomeIcon id="add-doc" icon={faPlusCircle} onClick={() => this.insertDoc()} />
                                    </td>
                                    <td>
                                        <InputGroupButtonDropdown
                                            className="doc-setting-type"
                                            addonType="append" isOpen={this.state.settingTypeOpen} toggle={this.toggleSettingType}>
                                            <DropdownToggle caret>
                                                {this.state.selectType}
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => this.SettingTypeSelect("PCS")} >{"PCS"}</DropdownItem>
                                                <DropdownItem onClick={() => this.SettingTypeSelect("FMEA")} >{"FMEA"}</DropdownItem>
                                                <DropdownItem onClick={() => this.SettingTypeSelect("KAKOTORA")} >{"KAKOTORA"}</DropdownItem>
                                            </DropdownMenu>
                                        </InputGroupButtonDropdown>
                                    </td>
                                    <td className="add-col3">
                                        <Input id="docpathinput" type="text" autoComplete="off" />
                                    </td>
                                    <td>
                                        <Input type="file" id="docfileinput" onChange={(e) => this.addFile(e)} />
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                }

                <Modal isOpen={this.state.isModalEditOpen} toggle={this.toggleEdit} className="regis-content">
                    <ModalHeader toggle={this.toggleEdit}>Edit</ModalHeader>
                    <ModalBody className="regis-body">
                        <FormGroup>
                            <Label for="listdetail">Machine no.</Label>
                            <Input type="text" id={"mcnomodal"} defaultValue={this.state.mcnoEdit} onChange={(e) => this.checkRepeatmcnoEdit(e.target.value)} required autoComplete="off" />
                            {this.state.mcnoEditRepeated && <FormText className="repeated-ht">{'This Machine no. is repeated'}</FormText>}
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.updateList()}>Save</Button>{' '}
                        <Button color="secondary" onClick={this.toggleEdit}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.isModalDeleteOpen} toggle={this.toggleDelete} className="regis-delete-content">
                    <ModalHeader toggle={this.toggleDelete}>Delete confirmation</ModalHeader>
                    <ModalBody className="regis-delete-body">
                        <FormGroup>
                            <Label className="regis-delete-label">{`Are you sure to delete ${this.state.deleteText} ?`}</Label>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.deleteList(this.state.Deleteitemid)}>Yes</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDelete}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null, mapDispatchToProps)(DocumentSetting)