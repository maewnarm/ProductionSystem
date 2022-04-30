import React from 'react';
import axios from 'axios';
import {
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Table,
    Button,
    FormGroup,
    Label,
    Input,
    Pagination,
    PaginationLink,
    PaginationItem,
    FormText,
    InputGroup,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledTooltip,
} from 'reactstrap'
import './scss/EditControlitem.scss';
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'
import {
    faEdit,
    faTrash,
    faEye,
    faCopy,
    faPlusCircle,
    faMinusCircle,
    faAngleDoubleLeft,
    faListUl
} from '@fortawesome/free-solid-svg-icons'
import { PacmanLoader } from "react-spinners";

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
var Empview = false
var Monitorview = false
var Recordview = false
var Editview = false
var cntResults = 0
const showPage = 5
const perPage = 10

var naturalSort = function (a, b) {
    return ('' + a.partno).localeCompare(('' + b.partno), 'en', { numeric: true });
}

var naturalSortProcess = function (a, b) {
    return ('' + a.process).localeCompare(('' + b.process), 'en', { numeric: true });
}

var naturalSortItemno = function (a, b) {
    return ('' + a.itemid).localeCompare(('' + b.itemid), 'en', { numeric: true });
}

var naturalSortym = function (a, b) {
    return ('' + a.ym).localeCompare(('' + b.ym), 'en', { numeric: true });
}

const meastoolList = [
    'Caliper Vernier',
    'Micrometer',
    'High Gauge',
    'Pressure Gauge',
    'Linear Gauge',
    'Load Cell',
    'Weight Balancer',
    'Measuring Microscope',
    'CMM',
    'Contour Recorder',
    'Roundness Tester',
    'Roughness Tester',
    'Holtest',
    'R-Gauge',
    'Hardness Tester',
    'Gear Tester',
    'Thickness Tester'
]

const CheckmeastoolList = [
    'Visual',
    'Visual with Limit sample'
]

class RegisList extends React.Component {
    state = {
        isLoading: false,
        lists: [],
        isModalOpen: false,
        isModalCopyPartnoOpen: false,
        isModalDeleteOpen: false,
        listid: '',
        noInput: '',
        partnoItem: {},
        nameInput: '',
        modelInput: '',
        Deleteitemid: '',
        DeleteType: '',
        deleteText: '',
        pageActive: 1,
        pageAmount: 0,
        pageShow: [],
        worknoRepeated: false,
        sectionCond: {
            copy: false,
        },
        worknoCond: {
            add: true,
            edit: false,
            copy: false,
        },
        partnameCond: {
            add: true,
            edit: false
        },
        partmodelCond: {
            add: true,
            edit: false
        },
        itemnoRepeated: false,
        filteredLists: [],
        currentViewNo: "",
        processlist: [],
        processSelected: false,
        processOpen: false,
        processText: "Please select process",
        processCond: {
            repeat: false,
            add: true,
            edit: false
        },
        itemlist: [],
        filtereditemlist: [],
        pageItemActive: 1,
        pageItemAmount: 0,
        pageItemShow: [],
        isModalAddOpen: false,
        recmethodSelected: false,
        recmethodOpen: false,
        recmethodText: "...",
        calmethodSelected: false,
        calmethodOpen: false,
        calmethodText: "...",
        intervalSelected: false,
        intervalOpen: false,
        intervalText: "...",
        intervalPieces: false,
        intervalWhenChange: false,
        meastoolText: "...",
        meastoolOpen: false,
        meastoolSelected: false,
        itemid: '',
        submitType: "",
        editItem: {
            itemno: "",
            parameter: "",
            upperlimit: "",
            lowerlimit: "",
            unit: "",
            masterval: "",
            meastimes: "",
            interval: "",
            interval_n: "1",
            pieces: "",
            whenchange: "",
            whenchange_n: "1",
            meastool: "",
            machineno: "",
            readability: "",
            remark: "",
        },
        isModalAddProcOpen: false,
        isModalEditProcOpen: false,
        condCheck: {
            itemno: false,
            parameter: false,
            /*upperlimit: false,
            lowerlimit: false,
            upperlimit_1: false,
            lowerlimit_1: false,*/
            limit: false,
            limit_1: false,
            unit: false,
            masterval: false,
            calmethod: false,
            meastimes: false,
            meastimes_4: false,
            interval: false,
            interval_1: false,
            interval_2: false,
            interval_3: false,
            interval_4: false,
            interval_5: false,
            meastool: false,
            machineno: false,
            readability: false,
            remark: false,
        },
        sumCheck: false,
        addPartnoTrig: false,
        showChecksheet: false,
        rowTextArea: 2,
        rowTextAreaRemark: 2,
        showXRList: false,
        xrData: {},
        xrDataFiltered: [],
        XRListYear: [],
        xrYear: "",
        xrShift: "",
        forceXR: []
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
    }

    componentDidMount() {
        //console.log(localStorage.getItem('username'))
        //curSection = localStorage.getItem('username')
        this.setState({
            currentViewNo: ""
        })
        if (curSection.substring(0, 3) === "100" && curSection.length === 7) {
            Empview = true
        } else if (curSection === "monitor") {
            Monitorview = true
        } else {
            Empview = false
            Monitorview = false
        }
        if (curSection.includes("-E")) {
            Editview = true
            Recordview = false
            curSection = curSection.substring(0, curSection.length - 2)
            console.log(curSection)
        } else {
            Editview = false
            Recordview = true
        }
        this.getList();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getList = async (id) => {
        this.setState({
            isLoading: true
        }, async () => {
            await api.get(`/partno/${curSection}`)
                .then(result => {
                    var arrResult = result.data
                    arrResult.sort(naturalSort)
                    this.setState({
                        lists: arrResult,
                        filteredLists: arrResult,
                        isLoading: false,
                    }, () => {
                        this.createPagination()
                    });
                    //console.log(result.data);
                })
                .catch(error => alert(error))
        })
    }

    handleSubmitbtn = () => {
        this.setState({
            isLoading: true
        }, () => {
            //event.preventDefault();
            const workno = document.getElementById('partno').value
            const workname = document.getElementById('partname').value
            const model = document.getElementById('model').value
            this.checkRepeatworkno(workno)
            this.checkConditionPartname(workname)
            this.checkConditionPartmodel(model)
            if (this.state.worknoRepeated) {
                alert("Part no. is already exists")
                return
            }
            if (workno === "" || workname === "" || model === "") {
                alert("Please input all fields")
                return
            }
            if (this.state.worknoCond.add || this.state.partnameCond.add || this.state.partmodelCond.add) {
                alert("Data input have some error")
                return
            }
            api.post('/partno/create/', {
                section: curSection,
                partno: workno,
                partname: workname,
                model: model,
            })
                .then(res => {
                    this.setState({
                        addPartnoTrig: false,
                    }, () => {
                        this.getList()
                    })
                })
                .catch(error => alert(error))
        })
    }

    ClearAddDetails = () => {
        document.getElementById('partno').value = '';
        document.getElementById('partname').value = '';
        document.getElementById('model').value = '';
    }

    deleteList = async (id) => {
        this.setState({
            isLoading: true
        }, async () => {
            const type = this.state.DeleteType
            var apiurl = ""
            if (type === "partno") {
                apiurl = `/partno/${id}/delete/`
            } else if (type === "item") {
                apiurl = `/controlitems/${id}/delete/`
            } else if (type === "process") {
                apiurl = `/controlitems/deleteproc/${curSection}_${this.state.currentViewNo}_${id}`
            } else if (type === "xrdata") {
                apiurl = `/datarec/${id}/delete/`
            } else {
                alert("delete type error")
                return
            }
            await api.delete(apiurl)
                .then(res => {
                    if (type === "partno") {
                        this.getList();
                        this.setState({
                            isModalDeleteOpen: false,
                            processText: "Please select process",
                            itemlist: [],
                            filtereditemlist: [],
                            processSelected: false,
                        })
                    } else if (type === "process") {
                        this.setState({
                            isModalDeleteOpen: false,
                        }, () => {
                            this.toggleView(this.state.currentViewNo, false)
                        })
                    } else if (type === "xrdata") {
                        this.setState({
                            isModalDeleteOpen: false
                        }, () => {
                            this.getXRList(this.state.xrItem, false)
                            this.changeXRListYear(this.state.xrYear)
                        })
                    } else {
                        this.processSelected(this.state.processText)
                        this.setState({
                            isModalDeleteOpen: false,
                        })
                    }
                })
                .catch(error => alert(error))
        })
    }

    toggleCopyPartno = (item) => {
        console.log(item)
        this.setState({
            noInput: item.partno,
            partnoItem: item,
            isModalCopyPartnoOpen: !this.state.isModalCopyPartnoOpen
        })
    }

    toggleView = (partno, flag, procname) => {
        this.setState({
            isLoading: true
        }, () => {
            //flag is select process or not
            this.setState({
                currentViewNo: partno,
                addPartnoTrig: false,
            }, async () => {
                await api.get(`/controlitems/process/${curSection}_${partno}`)
                    .then(result => {
                        var arrResult = result.data
                        arrResult.sort(naturalSortProcess)
                        if (flag) {
                            this.setState({
                                processlist: arrResult,
                                itemlist: [],
                                filtereditemlist: [],
                            }, () => {
                                this.processSelected(procname)
                            })
                        } else {
                            this.setState({
                                processlist: arrResult,
                                processText: "Please select process",
                                itemlist: [],
                                filtereditemlist: [],
                                processSelected: false,
                                isLoading: false,
                            }, () => {
                                //this.createPagination()
                                //this.createItemPagination()
                                //console.log(arrResult)
                            })
                        }
                        //console.log(result.data);
                    })
                    .catch(error => alert(error))
            })
        })
    }

    toggle = (id, partno, partname, model) => {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            listid: id,
            noInput: partno,
            nameInput: partname,
            modelInput: model,
        });
        //console.log("open")
    }

    toggleDelete = (itemid, type, msg) => {
        var delText = ""
        switch (type) {
            case "partno":
                delText = `Part no: ${msg}`
                break
            case "item":
                delText = `Item no: ${msg}`
                break
            case "process":
                delText = `Process: ${itemid}`
                break
            default:
                delText = ""
        }
        this.setState({
            Deleteitemid: itemid,
            DeleteType: type,
            deleteText: delText,
        }, () => {
            this.setState({
                isModalDeleteOpen: !this.state.isModalDeleteOpen,
            })
        })
    }

    copyPartno = async () => {
        var curpartno = this.state.noInput
        const tosection = document.getElementById("copysectionmodal").value
        const topartno = document.getElementById("copypartnomodal").value
        const topartname = document.getElementById("copypartnamemodal").value
        const tomodel = document.getElementById("copypartmodelmodal").value
        if (this.state.worknoCopyRepeated) {
            alert("Part no .is already exists")
            return
        }
        if (this.state.worknoCond.copy) {
            alert("Data input have some error")
            return
        }
        if (this.state.noInput !== topartno) {
            await api.get(`/copyPartno/${curSection}_${curpartno}_${tosection}_${topartno}_${topartname}_${tomodel}`)
                .then(res => {
                    console.log(res)
                    if (res.data[0] === undefined) {
                        alert("copy part no errror")
                    }
                    this.setState({
                        isModalCopyPartnoOpen: false
                    }, () => {
                        this.getList()
                    })
                })
                .catch(err => {
                    alert(err)
                    console.log(err)
                })
        }
    }

    updateList = async () => {
        this.setState({
            isLoading: true
        }, async () => {
            var newworkno = document.getElementById("partnomodal").value;
            var newworkname = document.getElementById("partnamemodal").value;
            var newmodel = document.getElementById("modelmodal").value;
            //console.log(newworkno)
            if (this.state.worknoUpdateRepeated) {
                alert("Part no. is already exists")
                return null
            }
            if (this.state.worknoCond.edit || this.state.partnameCond.edit || this.state.partmodelCond.edit) {
                alert("Data input have some error")
                return
            }
            if (this.state.noInput !== newworkno) {
                await api.patch(`/partno/${this.state.listid}/update/`, {
                    partno: newworkno,
                    partname: newworkname,
                    model: newmodel,
                })
                    .then(res => {
                        //console.log("new part no")
                        api.put(`/controlitems/update/${curSection}_${this.state.noInput}_${newworkno}`)
                            .then(res1 => {
                                api.put(`/datarec/updateno/${curSection}_${this.state.noInput}_${newworkno}`)
                                    .then(res2 => {
                                        this.setState({
                                            isModalOpen: false,
                                        }, () => {
                                            this.getList();
                                        })
                                    })
                                    .catch(err2 => {
                                        alert(err2)
                                        console.log("update part no in data record error")
                                    })
                            })
                            .catch(err1 => {
                                alert(err1)
                                console.log("update part no in control items error")
                            })

                    })
                    .catch(error => {
                        alert(error)
                        console.log("update part no in partno error")
                    })
            } else {
                this.setState({
                    isModalOpen: false,
                }, () => {
                    this.getList();
                })
            }
        })
    }

    createPagination = () => {
        //console.log(this.state.filteredLists.length)
        const pgamount = Math.ceil(this.state.filteredLists.length / perPage)
        var arrPage = []
        for (var i = 1; i <= pgamount; i++) {
            if (i <= showPage) {
                arrPage = [...arrPage, i]
            }
        }
        this.setState({
            pageAmount: pgamount,
            pageActive: 1,
            pageShow: arrPage
        })
    }

    clickPagination = (pg) => {
        //console.log(pg)
        const pgAmount = this.state.pageAmount
        if (pg >= 1 && pg <= pgAmount) {
            this.setState({
                pageActive: pg
            })
        }
        var arrpageShow = this.state.pageShow
        //console.log(arrpageShow[0])
        if (pg === 1) {
            arrpageShow = []
            for (var i = 1; i <= showPage; i++) {
                if (i <= pgAmount) {
                    arrpageShow = [...arrpageShow, i]
                }
            }
        } else if (pg === pgAmount) {
            arrpageShow = []
            for (var j = 1; j <= showPage; j++) {
                if (pgAmount - showPage + j > 0) {
                    arrpageShow = [...arrpageShow, pgAmount - showPage + j]
                }
            }
        }
        if (pg === arrpageShow[arrpageShow.length - 1] && pg < pgAmount && pg > arrpageShow[0]) {
            arrpageShow.forEach((item, ind) => {
                arrpageShow[ind] += 1
            })
        } else if (pg === arrpageShow[0] && pg > 1) {
            arrpageShow.forEach((item, ind) => {
                arrpageShow[ind] -= 1
            })
        }
        this.setState({
            pageShow: arrpageShow
        })
    }

    checkRepeatworkno = (val) => {
        //console.log(val)
        var isRepeated = false
        var checkCond = false
        this.state.lists.forEach((item) => {
            if (item.partno === val) {
                //console.log("repeated")
                isRepeated = true
            }
        })
        if (!isRepeated) {
            if (val.length === 0) {
                checkCond = true
            }
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            worknoRepeated: isRepeated,
            worknoCond: { ...this.state.worknoCond, add: checkCond }
        })
    }

    checkConditionPartname = (val) => {
        var checkCond = false
        if (val.length === 0) {
            checkCond = true
        } else {
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            partnameCond: { ...this.state.partnameCond, add: checkCond }
        })
    }

    checkConditionPartmodel = (val) => {
        var checkCond = false
        if (val.length === 0) {
            checkCond = true
        } else {
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            partmodelCond: { ...this.state.partmodelCond, add: checkCond }
        })
    }

    checkSectionCopy = (val) => {
        var checkCond = false
        if (val.length === 0) {
            checkCond = true
        }
        for (var x = 0; x < val.length; x++) {
            if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                checkCond = true
            }
        }
        this.setState({
            sectionCond: { ...this.state.sectionCond, copy: checkCond }
        })
    }

    checkRepeatworknoCopy = (val) => {
        var isRepeated = false
        var checkCond = false
        this.state.lists.forEach((item) => {
            if (item.partno === val && this.state.noInput !== val) {
                //console.log("repeated")
                isRepeated = true
            }
        })
        if (!isRepeated) {
            if (val.length === 0) {
                checkCond = true
            }
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            worknoCopyRepeated: isRepeated,
            worknoCond: { ...this.state.worknoCond, copy: checkCond }
        })
    }

    checkRepeatworknoEdit = (val) => {
        //console.log(val)
        var isRepeated = false
        var checkCond = false
        this.state.lists.forEach((item) => {
            if (item.partno === val && this.state.noInput !== val) {
                //console.log("repeated")
                isRepeated = true
            }
        })
        if (!isRepeated) {
            if (val.length === 0) {
                checkCond = true
            }
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            worknoUpdateRepeated: isRepeated,
            worknoCond: { ...this.state.worknoCond, edit: checkCond }
        })
    }

    checkConditionPartnameEdit = (val) => {
        var checkCond = false
        if (val.length === 0) {
            checkCond = true
        } else {
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            partnameCond: { ...this.state.partnameCond, edit: checkCond }
        })
    }

    checkConditionPartmodelEdit = (val) => {
        var checkCond = false
        if (val.length === 0) {
            checkCond = true
        } else {
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            partmodelCond: { ...this.state.partmodelCond, edit: checkCond }
        })
    }

    SearchByPartno = (partno) => {
        //const partno = document.getElementById('part-search').value
        var filtered = []
        //console.log(this.state.lists)
        this.state.lists.forEach((item) => {
            if (item.partno.includes(partno)) {
                filtered = [...filtered, item]
            }
        })
        filtered.sort(naturalSort)
        //console.log(filtered)
        this.setState({
            filteredLists: filtered,
        }, () => {
            this.createPagination()
        })
    }

    createItemPagination = () => {
        //console.log(this.state.filtereditemlist.length)
        const pgamount = Math.ceil(this.state.filtereditemlist.length / perPage)
        //console.log(pgamount)
        var arrPage = []
        for (var i = 1; i <= pgamount; i++) {
            if (i <= showPage) {
                arrPage = [...arrPage, i]
            }
        }
        this.setState({
            pageItemAmount: pgamount,
            pageItemActive: 1,
            pageItemShow: arrPage
        })
    }

    clickItemPagination = (pg) => {
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

    toggleprocess = () => {
        this.setState({
            processOpen: !this.state.processOpen
        })
    }

    processSelected = (proc) => {
        this.setState({
            isLoading: true
        }, () => {
            //console.log(proc)
            this.setState({
                processSelected: true,
                processText: proc
            }, async () => {
                await api.get(`/controlitems/items/${curSection}_${this.state.currentViewNo}_${proc}`)
                    .then(result => {
                        var arrResult = result.data
                        arrResult.sort(naturalSortItemno)
                        this.setState({
                            itemlist: arrResult,
                            filtereditemlist: arrResult,
                            isLoading: false,
                        }, () => {
                            //this.createPagination()
                            this.createItemPagination()
                            //console.log(this.state.processText)
                        });
                        //console.log(result.data);
                    })
                    .catch(error => alert(error))
            })
        })
    }

    SearchByitem = (itemno) => {
        //const partno = document.getElementById('part-search').value
        var filtered = []
        //console.log(this.state.lists)
        this.state.itemlist.forEach((item) => {
            if (item.itemid.includes(itemno)) {
                filtered = [...filtered, item]
            }
        })
        filtered.sort(naturalSortItemno)
        //console.log(filtered)
        this.setState({
            filtereditemlist: filtered,
        }, () => {
            this.createItemPagination()
        })
    }

    toggleAddView = () => {
        this.setState({
            isModalAddOpen: !this.state.isModalAddOpen,
            submitType: "add",
            itemid: "",
            editItem: {
                itemno: "",
                parameter: "",
                upperlimit: "",
                lowerlimit: "",
                unit: "",
                masterval: "",
                meastimes: "",
                interval: "",
                interval_n: "1",
                pieces: "",
                whenchange: "",
                whenchange_n: "1",
                meastool: "",
                machineno: "",
                readability: "",
                remark: "",
            },
            recmethodText: "...",
            calmethodText: "...",
            intervalText: "...",
            recmethodSelected: false,
            calmethodSelected: false,
            intervalSelected: false,
            intervalWhenChange: false,
            meastoolText: "...",
            meastoolOtherSelected: false,
            meastoolSelected: false,
            condCheck: {
                itemno: false,
                parameter: false,
                /*upperlimit: false,
                lowerlimit: false,*/
                limit: false,
                limit_1: false,
                unit: false,
                masterval: false,
                calmethod: false,
                meastimes: false,
                meastimes_4: false,
                interval: false,
                interval_1: false,
                interval_2: false,
                interval_3: false,
                interval_4: false,
                meastool: false,
                machineno: false,
                readability: false
            },
            sumCheck: false,
            showChecksheet: false,
        }, () => {
            this.checkCondition("all")
        })
    }

    checkConditionProcess = (val) => {
        var isRepeated = false
        var checkCond = false
        this.state.processlist.forEach((item) => {
            if (item.process === val) {
                isRepeated = true
            }
        })
        if (!isRepeated) {
            if (val.length === 0) {
                checkCond = true
            }
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            processCond: { ...this.state.processCond, repeat: isRepeated, add: checkCond }
        })
    }

    checkConditionProcessEdit = (val) => {
        var isRepeated = false
        var checkCond = false
        this.state.processlist.forEach((item) => {
            if (item.process === val) {
                isRepeated = true
            }
        })
        if (!isRepeated) {
            if (val.length === 0) {
                checkCond = true
            }
            for (var x = 0; x < val.length; x++) {
                if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                    checkCond = true
                }
            }
        }
        this.setState({
            processCond: { ...this.state.processCond, repeat: isRepeated, edit: checkCond }
        })
    }

    checkRepeatitemAddModal = (val) => {
        //console.log(val)
        const type = this.state.submitType
        var isRepeated = false
        this.state.itemlist.forEach((item) => {
            switch (type) {
                case "add":
                case "copy":
                    if (item.itemid === val) {
                        //console.log("repeated")
                        isRepeated = true
                    }
                    break
                case "edit":
                    if (item.itemid === val && this.state.editItem.itemno !== val) {
                        //console.log("repeated")
                        isRepeated = true
                    }
                    break
                default:
                    alert("check repeat type not match")
                    return
            }
        })
        this.setState({
            itemnoRepeated: isRepeated
        }, () => {
            this.checkCondition("itemno", val)
        })
    }

    toggleItemDropDown = (name) => {
        switch (name) {
            case "recmethod":
                this.setState({
                    recmethodOpen: !this.state.recmethodOpen
                })
                break
            case "calmethod":
                this.setState({
                    calmethodOpen: !this.state.calmethodOpen
                })
                break
            case "interval":
                this.setState({
                    intervalOpen: !this.state.intervalOpen
                })
                break
            case "meastool":
                this.setState({
                    meastoolOpen: !this.state.meastoolOpen
                })
                break
            case "XRListYear":
                this.setState({
                    XRListYearOpen: !this.state.XRListYearOpen
                })
                break
            case "XRListShift":
                this.setState({
                    XRListShiftOpen: !this.state.XRListShiftOpen
                })
                break
            default:
                alert("toggle name not match")
                return
        }
    }

    inModalSelect = (type, item) => {
        switch (type) {
            case "recmethod":
                var checkFlag = false
                var methodTxt = "..."
                if (item === "Check sheet") {
                    checkFlag = true
                    methodTxt = ""
                    document.getElementById('meastimes').value = "1"
                } else if (item === "x-Rs chart") {
                    document.getElementById('interval').value = "1"
                    document.getElementById('interval').disabled = true
                } else {
                    document.getElementById('meastimes').value = ""
                    document.getElementById('interval').value = ""
                    document.getElementById('interval').disabled = false
                }
                this.setState({
                    recmethodText: item,
                    recmethodSelected: true,
                    rowTextArea: 2,
                    showChecksheet: checkFlag,
                    calmethodText: methodTxt
                }, () => {
                    this.checkCondition("itemno", document.getElementById('itemno').value)
                    this.checkCondition("parameter", document.getElementById('parameter').value)
                    this.checkCondition("interval", document.getElementById('interval').value)
                    this.checkCondition("machineno", document.getElementById('machineno').value)
                    if (!this.state.meastoolOtherSelected) {
                        this.checkCondition("meastool", this.state.editItem.meastool)
                    } else {
                        this.checkCondition("meastool", document.getElementById('meastool').value)
                    }
                    if (item !== "Check sheet") {
                        this.checkCondition("upperlimit", document.getElementById('upperlimit').value)
                        this.checkCondition("lowerlimit", document.getElementById('lowerlimit').value)
                        this.checkCondition("unit", document.getElementById('unit').value)
                        this.checkCondition("masterval", document.getElementById('masterval').value)
                        this.checkCondition("meastimes", document.getElementById('meastimes').value)
                        this.checkCondition("readability", document.getElementById('readability').value)
                    }
                })
                break
            case "calmethod":
                this.setState({
                    calmethodText: item,
                    calmethodSelected: true
                }, () => {
                    this.checkCondition("calmethod", item)
                    this.checkCondition("meastimes", 0)
                })
                break
            case "interval":
                var piecesFlag = false
                var whenchangeFlag = false
                console.log(item)
                if (item === "Pieces") {
                    piecesFlag = true
                } else if (item === "When change") {
                    whenchangeFlag = true
                }
                this.setState({
                    intervalText: item,
                    intervalSelected: true,
                    intervalPieces: piecesFlag,
                    intervalWhenChange: whenchangeFlag,
                }, () => {
                    if (piecesFlag) {
                        this.checkCondition("interval_pieces", document.getElementById('interval_pieces').value)
                    }
                    else if (whenchangeFlag) {
                        this.checkCondition("interval_whenchange", document.getElementById('interval_whenchange').value)
                    }
                    this.checkCondition("interval_2", item)
                })
                break
            case "meastool":
                var otherFlag = false
                if (item === "Other") {
                    otherFlag = true
                }
                this.setState({
                    meastoolSelected: true,
                    meastoolText: item,
                    meastoolOtherSelected: otherFlag,
                }, () => {
                    this.checkCondition("meastool", this.state.editItem.meastool)
                })
                break
            default:
                alert("modal select type not match")
                return
        }
    }

    submitItem = () => {
        const type = this.state.submitType
        if (!this.state.sumCheck) {
            if (type === "add") {
                this.AddItemno()
            } else if (type === "edit") {
                this.UpdateItemno()
            } else if (type === "copy") {
                this.AddItemno()
            } else {
                alert("Add/Edit/Copy type not match")
                return
            }
        } else {
            alert("Condition in some value not match, Please recheck again")
        }
    }

    AddItemno = async () => {
        this.setState({
            isLoading: true
        }, async () => {
            const sect = curSection
            const pno = this.state.currentViewNo
            const proc = this.state.processText
            const itemno = document.getElementById('itemno').value
            const parameter = document.getElementById('parameter').value
            const recmethod = this.state.recmethodText
            const upper = document.getElementById('upperlimit').value
            const lower = document.getElementById('lowerlimit').value
            const unit = document.getElementById('unit').value
            var masterval = document.getElementById('masterval').value
            const calmethod = this.state.calmethodText
            const meastimes = document.getElementById('meastimes').value
            const interval1 = document.getElementById('interval').value
            var interval2 = this.state.intervalText
            const interval_n = document.getElementById('interval_n').value
            var interval_wc = 1
            if (interval2 === "When change") {
                interval2 = `When change ${document.getElementById('interval_whenchange').value}`
                interval_wc = Number(document.getElementById('interval_wc').value)
            }
            else if (interval2 === "Piece") {
                interval2 = `${document.getElementById('interval_pieces').value} Pieces`
            }
            var meastool = ""
            if (!this.state.meastoolOtherSelected) {
                meastool = this.state.meastoolText
            } else {
                meastool = document.getElementById('meastool').value
            }
            const mcno = document.getElementById('machineno').value
            const read = document.getElementById('readability').value
            const remark = document.getElementById('remark').value
            /*console.log(sect + "/" + pno + "/" + proc + "/" + itemno + "/" + parameter + "/" + recmethod + "/" + upper + "/" + lower + "/" +
                unit + "/" + masterval + "/" + calmethod + "/" + meastimes + "/" + interval1 + "/" + interval2 + "/" + meastool + "/" +
                mcno + "/" + read)*/
            if (this.state.itemnoRepeated) {
                alert("Item no. is already exists")
                return
            }
            if (masterval === "") {
                masterval = 0
            }
            await api.post('/controlitems/create/', {
                section: sect,
                partno: pno,
                process: proc,
                itemid: itemno,
                parameter: parameter,
                recmethod: recmethod,
                limit: `${upper};${lower}`,
                unit: unit,
                masterval: masterval,
                calmethod: calmethod,
                meastimes: meastimes,
                interval1: interval1,
                interval2: interval2,
                interval_n: interval_n,
                interval_wc: interval_wc,
                meastool: meastool,
                mcno: mcno,
                readability: read,
                remark: remark
            })
                .then(res => {
                    //console.log(res)
                    this.processSelected(proc)
                    this.setState({
                        isModalAddOpen: false
                    })
                })
                .catch(error => {
                    alert(error)
                    console.log(error.response.data)
                    console.log("create control items error")
                })
        })
    }

    toggleEditItem = (item) => {
        //console.log(item)
        var checkFlag = false
        var intervalTxt = item.interval2
        var intervalPiece = false
        var pieceInterval = ""
        var intervalWhenchange = false
        var whenchangeInterval = ""
        var whenchange_n = ""
        var measToolTxt = "..."
        var measOther = false
        if (item.recmethod === "Check sheet") {
            checkFlag = true
        }
        if (item.interval2.includes("Pieces") && !item.interval2.includes("When change")) {
            intervalPiece = true
            intervalTxt = "Pieces"
            pieceInterval = item.interval2.substring(0, item.interval2.indexOf("Pieces") - 1)
        } else if (item.interval2.includes("When change")) {
            intervalWhenchange = true
            intervalTxt = "When change"
            whenchangeInterval = item.interval2.substring(12, item.interval2.length)
            whenchange_n = item.interval_wc
        }
        if (meastoolList.includes(item.meastool)) {
            measToolTxt = item.meastool
        } else {
            measToolTxt = "Other"
            measOther = true
        }
        this.setState({
            isModalAddOpen: !this.state.isModalAddOpen,
            submitType: "edit"
        }, () => {
            this.setState({
                itemid: item.id,
                editItem: {
                    itemno: item.itemid,
                    parameter: item.parameter,
                    upperlimit: item.limit.split(";")[0],
                    lowerlimit: item.limit.split(";")[1],
                    unit: item.unit,
                    masterval: item.masterval,
                    meastimes: item.meastimes,
                    interval: item.interval1,
                    interval_n: item.interval_n,
                    pieces: pieceInterval,
                    whenchange: whenchangeInterval,
                    whenchange_n: whenchange_n,
                    meastool: item.meastool,
                    machineno: item.mcno,
                    readability: item.readability,
                    remark: item.remark,
                },
                recmethodText: item.recmethod,
                calmethodText: item.calmethod,
                intervalText: intervalTxt,
                meastoolText: measToolTxt,
                meastoolOtherSelected: measOther,
                recmethodSelected: true,
                calmethodSelected: true,
                intervalSelected: true,
                meastoolSelected: true,
                showChecksheet: checkFlag,
                intervalPieces: intervalPiece,
                intervalWhenChange: intervalWhenchange,
            }, () => {
                this.changeRowTextArea(item.parameter)
                this.changeRowTextAreaRemark(item.remark)
                this.checkCondition("allfalse")
                if (measOther) {
                    this.checkCondition("meastool", item.meastool)
                }
            })
        })
    }

    UpdateItemno = async () => {
        this.setState({
            isLoading: true
        }, async () => {
            const sect = curSection
            const pno = this.state.currentViewNo
            const proc = this.state.processText
            const olditemno = this.state.editItem.itemno
            const itemno = document.getElementById('itemno').value
            const parameter = document.getElementById('parameter').value
            const recmethod = this.state.recmethodText
            const upper = document.getElementById('upperlimit').value
            const lower = document.getElementById('lowerlimit').value
            const unit = document.getElementById('unit').value
            var masterval = document.getElementById('masterval').value
            const calmethod = this.state.calmethodText
            const meastimes = document.getElementById('meastimes').value
            const interval1 = document.getElementById('interval').value
            var interval2 = this.state.intervalText
            var interval_wc = 1
            if (interval2 === "When change") {
                interval2 = `When change ${document.getElementById('interval_whenchange').value}`
                interval_wc = Number(document.getElementById('interval_wc').value)
            } else if (interval2 === "Pieces") {
                interval2 = `${document.getElementById('interval_pieces').value} Pieces`
            }
            console.log(interval2)
            const intervaln = document.getElementById('interval_n').value
            var meastool = ""
            if (!this.state.meastoolOtherSelected) {
                meastool = this.state.meastoolText
            } else {
                meastool = document.getElementById('meastool').value
            }
            const mcno = document.getElementById('machineno').value
            const read = document.getElementById('readability').value
            const remark = document.getElementById('remark').value
            /*console.log(sect + "/" + pno + "/" + proc + "/" + itemno + "/" + parameter + "/" + recmethod + "/" + upper + "/" + lower + "/" +
                unit + "/" + masterval + "/" + calmethod + "/" + meastimes + "/" + interval1 + "/" + interval2 + "/" + meastool + "/" +
                mcno + "/" + read)*/
            if (this.state.itemnoRepeated) {
                alert("Item no. is already exists")
                return
            }
            if (masterval === "") {
                masterval = null
            }

            await api.patch(`/controlitems/${this.state.itemid}/update/`, {
                section: sect,
                partno: pno,
                process: proc,
                itemid: itemno,
                parameter: parameter,
                recmethod: recmethod,
                limit: `${upper};${lower}`,
                unit: unit,
                masterval: masterval,
                calmethod: calmethod,
                meastimes: meastimes,
                interval1: interval1,
                interval2: interval2,
                interval_n: intervaln,
                interval_wc: interval_wc,
                meastool: meastool,
                mcno: mcno,
                readability: read,
                remark: remark
            })
                .then(res => {
                    if (olditemno !== itemno) {
                        api.put(`/datarec/updateitem/${curSection}_${pno}_${proc}_${olditemno}_${itemno}`)
                            .then(res1 => {
                                this.processSelected(proc)
                                this.setState({
                                    isModalAddOpen: false,
                                })
                            })
                            .catch(err1 => {
                                alert(err1)
                                console.log("update control item in data record error")
                            })
                    } else {
                        this.processSelected(proc)
                        this.setState({
                            isModalAddOpen: false,
                        })
                    }
                })
                .catch(error => {
                    alert(error)
                    console.log("update control item in control items error")
                })
        })
    }

    toggleCopyItem = (item) => {
        //console.log(item)
        var checkFlag = false
        var intervalTxt = item.interval2
        var intervalPiece = false
        var pieceInterval = ""
        var intervalWhenchange = false
        var whenchangeInterval = ""
        var whenchange_n = ""
        var measToolTxt = "..."
        var measOther = false
        if (item.recmethod === "Check sheet") {
            checkFlag = true
        }
        if (item.interval2.includes("Pieces") && !item.interval2.includes("When change")) {
            intervalPiece = true
            intervalTxt = "Pieces"
            pieceInterval = item.interval2.substring(0, item.interval2.indexOf("Pieces") - 1)
        } else if (item.interval2.includes("When change")) {
            intervalWhenchange = true
            intervalTxt = "When change"
            whenchangeInterval = item.interval2.substring(12, item.interval2.length)
            whenchange_n = item.interval_wc
        }
        if (meastoolList.includes(item.meastool)) {
            measToolTxt = item.meastool
        } else {
            measToolTxt = "Other"
            measOther = true
        }
        this.setState({
            isModalAddOpen: !this.state.isModalAddOpen,
            submitType: "copy"
        }, () => {
            this.setState({
                itemid: item.id,
                editItem: {
                    itemno: item.itemid,
                    parameter: item.parameter,
                    upperlimit: item.limit.split(";")[0],
                    lowerlimit: item.limit.split(";")[1],
                    unit: item.unit,
                    masterval: item.masterval,
                    meastimes: item.meastimes,
                    interval: item.interval1,
                    interval_n: item.interval_n,
                    pieces: pieceInterval,
                    whenchange: whenchangeInterval,
                    whenchange_n: whenchange_n,
                    meastool: item.meastool,
                    machineno: item.mcno,
                    readability: item.readability,
                    remark: item.remark,
                },
                recmethodText: item.recmethod,
                calmethodText: item.calmethod,
                intervalText: intervalTxt,
                meastoolText: measToolTxt,
                meastoolOtherSelected: measOther,
                recmethodSelected: true,
                calmethodSelected: true,
                intervalSelected: true,
                meastoolSelected: true,
                showChecksheet: checkFlag,
                intervalPieces: intervalPiece,
                intervalWhenChange: intervalWhenchange,
            }, () => {
                this.changeRowTextArea(item.parameter)
                this.changeRowTextAreaRemark(item.remark)
                this.checkCondition("allfalse")
                if (measOther) {
                    this.checkCondition("meastool", item.meastool)
                }
            })
        })
    }

    toggleAddProc = () => {
        this.setState({
            isModalAddProcOpen: !this.state.isModalAddProcOpen
        })
    }

    toggleEditProc = () => {
        this.setState({
            isModalEditProcOpen: !this.state.isModalEditProcOpen
        })
    }

    AddProcessName = async () => {
        this.setState({
            isLoading: true
        }, async () => {
            const procname = document.getElementById('addprocess').value
            if (this.state.processCond.repeat || this.state.processCond.add) {
                alert("Process name have some error")
                return
            }
            await api.post('/controlitems/create/', {
                section: curSection,
                partno: this.state.currentViewNo,
                process: procname,
                itemid: 0
            })
                .then(res => {
                    //console.log(res)
                    this.toggleView(this.state.currentViewNo, true, procname)
                    this.setState({
                        isModalAddProcOpen: false
                    })
                })
                .catch(error => alert(error))
        })
    }

    EditProcessName = async () => {
        this.setState({
            isLoading: true
        }, async () => {
            const curprocname = this.state.processText
            const newprocname = document.getElementById('editprocess').value
            const pno = this.state.currentViewNo
            if (curprocname === newprocname || this.state.processCond.repeat || this.state.processCond.edit) {
                alert("Process name have some error")
                return
            }
            await api.put(`/controlitems/updateproc/${curSection}_${pno}_${curprocname}_${newprocname}`)
                .then(res => {
                    api.put(`/datarec/updateproc/${curSection}_${pno}_${curprocname}_${newprocname}`)
                        .then(res1 => {
                            api.get(`/controlitems/process/${curSection}_${pno}`)
                                .then(result => {
                                    var arrResult = result.data
                                    arrResult.sort(naturalSortProcess)
                                    this.setState({
                                        processlist: arrResult,
                                        processText: "Please select process",
                                    }, () => {
                                        this.processSelected(newprocname)
                                        this.setState({
                                            isModalEditProcOpen: false
                                        })
                                    });
                                })
                                .catch(error => {
                                    alert(error)
                                    console.log("get control items after update error")
                                })
                        })
                        .catch(err1 => {
                            alert(err1)
                            console.log("update process in data record error")
                        })
                })
                .catch(err => {
                    alert(err)
                    console.log("update process in controlitem error")
                })
        })
    }

    showDetailItem = (item) => {
        console.log(item)
    }

    checkCondition = (item, val) => {
        console.log(item)
        console.log(val)
        var f1 = false
        var f2 = false
        var f3 = false
        var f3_1 = false
        var f4 = false
        var f5 = false
        var f5_1 = false
        var f5_2 = false
        var f5_3 = false
        var f5_4 = false
        var f5_5 = false
        var f5_6 = false
        var f5_7 = false
        var f6 = false
        var f7 = false
        //condition check
        switch (item) {
            case "itemno": //number,-
                for (var x = 0; x < val.length; x++) {
                    if ((isNaN(parseInt(val.charAt(x))) && val.charAt(x) !== "-") || val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                        f1 = true
                    }
                }
                if (val.length === 0 || val.length > 5 || Number.parseInt(val) === 0 || val.charAt(0) === "-") {
                    f1 = true
                }
                break
            case "parameter":
            case "unit":
            case "machineno":
                for (x = 0; x < val.length; x++) {
                    if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                        f2 = true
                    }
                }
                if (val.length === 0 || val.charAt(0) === "-") {
                    f2 = true
                }
                break
            case "meastool":
                if (this.state.meastoolOtherSelected) {
                    for (x = 0; x < val.length; x++) {
                        if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                            f2 = true
                        }
                    }
                    if (val.length === 0 || val.charAt(0) === "-") {
                        f2 = true
                    }
                }
                break
            case "upperlimit": //decimal,check limit
            case "lowerlimit": //check upper or lower limit not empty just one is ok
                const upperTxt = document.getElementById('upperlimit').value
                const lowerTxt = document.getElementById('lowerlimit').value
                const upper = Number.parseFloat(upperTxt)
                const lower = Number.parseFloat(lowerTxt)
                if (isNaN(val) || (upperTxt.length > 0 && lowerTxt > 0 && upper <= lower)) {
                    f3 = true
                }
                if (upperTxt.length === 0 && lowerTxt.length === 0) {
                    f3_1 = true
                }
                break
            case "masterval": //decimal
            case "readability":
                if (isNaN(val) || val.length === 0 || val.charAt(0) === "-") {
                    f4 = true
                }
                break
            case "meastimes": //integer
                const meastimes = document.getElementById('meastimes').value
                if (Number.parseInt(meastimes).toString() !== meastimes || meastimes.length === 0 || meastimes.charAt(0) === "-") {
                    f5 = true
                }
                if (Number.parseInt(meastimes) < 2 && this.state.calmethodText === "Max & Min") {
                    f5_4 = true
                }
                break
            case "interval":
                const intervTxt = document.getElementById('interval').value
                const nValueTxt = document.getElementById('interval_n').value
                const interv = Number.parseInt(intervTxt)
                const nValue = Number.parseInt(nValueTxt)
                if (interv.toString() !== intervTxt || nValue.toString() !== nValueTxt || isNaN(interv) || isNaN(nValue) || Number.parseInt(val) > 30 || intervTxt.charAt(0) === "-" || nValueTxt.charAt(0) === "-") {
                    f5_1 = true
                }
                if (this.state.intervalWhenChange) {
                    const nWhenchangeTxt = document.getElementById('interval_wc').value
                    const nWhenchange = Number.parseInt(nWhenchangeTxt)
                    if (nWhenchangeTxt === "") {
                        f5_1 = true
                    }
                    if (interv * nValue * nWhenchange > 30) {
                        f5_6 = true
                    }
                } else {
                    if (interv * nValue > 30) {
                        f5_6 = true
                    }
                }
                if (Number.parseInt(val) < 2 && this.state.recmethodText === "x-R chart") {
                    f5_3 = true
                }
                break
            case "interval_2":
                if (this.state.intervalText === "...") {
                    f5_2 = true
                }
                if (val !== "Pieces") {
                    f5_5 = false
                }
                if (val === "When change" && document.getElementById('interval_whenchange').value === "") {
                    f5_7 = true
                }
                break
            case "interval_pieces":
                if (val === "" || Number(val) <= 0) {
                    f5_5 = true
                }
                break
            case "interval_whenchange":
                if (val === "")
                    f5_7 = true
                break
            case "calmethod":
                if (this.state.calmethodText === "...") {
                    f6 = true
                }
                break
            case "remark":
                for (x = 0; x < val.length; x++) {
                    if (val.charAt(x) === "," || val.charAt(x) === "_" || val.charAt(x) === ";" || val.charAt(x) === "/") {
                        f7 = true
                    }
                }
                break
            case "all":
            case "allfalse":
                break
            default:
                alert("check condition item not match")
        }
        //set result
        var oldcondCheck = this.state.condCheck
        switch (item) {
            case "itemno":
                oldcondCheck[item] = f1
                break
            case "parameter":
            case "unit":
            case "meastool":
            case "machineno":
                oldcondCheck[item] = f2
                break
            case "upperlimit":
            case "lowerlimit":
                oldcondCheck["limit"] = f3
                oldcondCheck["limit_1"] = f3_1
                break
            case "masterval":
            case "readability":
                oldcondCheck[item] = f4
                break
            case "meastimes":
                oldcondCheck[item] = f5
                oldcondCheck[`${item}_4`] = f5_4
                break
            case "interval":
                oldcondCheck[item] = f5_1
                oldcondCheck[`${item}_2`] = f5_3
                oldcondCheck[`${item}_4`] = f5_6
                break
            case "interval_2":
                oldcondCheck[`interval_1`] = f5_2
                oldcondCheck[`interval_3`] = f5_5
                oldcondCheck[`interval_5`] = f5_7
                break
            case "interval_pieces":
                oldcondCheck[`interval_3`] = f5_5
                break
            case "interval_whenchange":
                oldcondCheck[`interval_5`] = f5_7
                break
            case "calmethod":
                oldcondCheck[item] = f6
                break
            case "remark":
                oldcondCheck[item] = f7
                break
            case "all":
                Object.keys(oldcondCheck).forEach(key => {
                    oldcondCheck[key] = true
                })
                break
            case "allfalse":
                Object.keys(oldcondCheck).forEach(key => {
                    oldcondCheck[key] = false
                })
                break
            default:
                console.log("check condition item not match")
        }
        //set result for check sheet
        if (this.state.showChecksheet) {
            oldcondCheck["unit"] = false
            oldcondCheck["meastool"] = false
            /*oldcondCheck["upperlimit"] = false
            oldcondCheck["lowerlimit"] = false
            oldcondCheck["upperlimit_1"] = false
            oldcondCheck["lowerlimit_1"] = false*/
            oldcondCheck["limit"] = false
            oldcondCheck["limit_1"] = false
            oldcondCheck["masterval"] = false
            oldcondCheck["calmethod"] = false
            oldcondCheck["readability"] = false
            oldcondCheck["meastimes"] = false
            oldcondCheck["meastimes_4"] = false
            oldcondCheck["unit"] = false
        }
        var sumCheck = false
        Object.keys(oldcondCheck).forEach(key => {
            sumCheck = sumCheck || oldcondCheck[key]
        })
        //console.log(sumCheck)
        this.setState({
            condCheck: oldcondCheck,
            sumCheck: sumCheck
        }, () => {
            console.log(this.state.condCheck)
        })
    }

    changeRowTextArea = (val) => {
        //console.log(val)
        if (this.state.showChecksheet) {
            var row = val.split('\n').length
            if (row < 2) {
                row = 2
            }
            this.setState({
                rowTextArea: row
            })
        }
    }

    changeRowTextAreaRemark = (val) => {
        var row = val.split('\n').length
        if (row < 2) {
            row = 2
        }
        this.setState({
            rowTextAreaRemark: row
        })
    }

    backToPartno = () => {
        this.setState({
            currentViewNo: "",
        })
    }

    trigOpenAddPartno = () => {
        this.setState({
            addPartnoTrig: !this.state.addPartnoTrig
        })
    }

    unControlToolTipPack = (targetid, text) => {
        return (
            <UncontrolledTooltip placement="top" target={targetid} hideArrow={true} >
                {text}
            </UncontrolledTooltip>
        )
    }

    toggleXRList = () => {
        this.setState({
            showXRList: !this.state.showXRList
        })
    }

    changeXRListYear = (year) => {
        const shift = this.state.xrShift
        var filterData = []
        if ((shift === "A" || shift === "B") && year !== "") {
            this.state.xrData[shift].forEach(list => {
                if (list.ym.indexOf(year) > -1) {
                    filterData = [...filterData, list]
                }
            })
            //console.log(filterData)
        }
        this.setState({
            xrYear: year,
            xrDataFiltered: filterData
        })
    }

    changeXRListShift = (shift) => {
        this.setState({
            xrShift: shift
        }, () => {
            this.changeXRListYear(this.state.xrYear)
        })
    }

    getXRList = (item, flag) => {
        this.setState({
            isLoading: true
        }, () => {
            //console.log(item)
            //get xr data
            api.get(`/datarec/xrdata/${curSection}_${item.partno}_${item.process}_${item.itemid}`)
                .then(result => {
                    const arrData = result.data
                    //console.log(arrData)
                    var dataA = []
                    var dataB = []
                    var listYear = []
                    arrData.forEach(list => {
                        if (list.shift === "A") {
                            dataA = [...dataA, list]
                        } else {
                            dataB = [...dataB, list]
                        }
                        const y = list.ym.substr(0, 4)
                        if (!listYear.includes(y)) {
                            listYear.push(y)
                        }
                    })
                    dataA.sort(naturalSortym)
                    dataB.sort(naturalSortym)
                    //console.log(listYear)
                    //console.log(dataA)
                    //console.log(dataB)
                    this.setState({
                        xrData: { "A": dataA, "B": dataB },
                        xrDataFiltered: [],
                        XRListYear: listYear,
                        xrYear: moment(new Date()).format('YYYY'),
                        xrShift: 'A',
                        xrItemIdShow: item.itemid,
                        xrItem: item,
                        isLoading: false,
                    }, () => {
                        if (flag) {
                            this.toggleXRList()
                        }
                        this.changeXRListYear(this.state.xrYear)
                    })
                })
                .catch(err => {
                    alert("get x-R chart data error")
                    console.log(err)
                })
        })
    }

    checkForceXR = (e, id, ind) => {
        const flag = e.target.checked
        var arrForce = []
        var currFilterXR = this.state.xrDataFiltered
        currFilterXR[ind]['force'] = flag
        //console.log(currFilterXR)
        currFilterXR.forEach((item, ind) => {
            if (item.force) {
                arrForce.push(ind)
            }
        })
        this.setState({
            xrDataFiltered: currFilterXR,
        })
    }

    saveXRList = () => {
        this.setState({
            isLoading: true
        }, () => {
            //update from xrdatafilter
            this.state.xrDataFiltered.forEach((item, ind) => {
                var newfcl = ";;"
                var newfxbar = ";;"
                var forceFlag = false
                if (item.force) {
                    const fx0 = document.getElementById(`force-fxbar-0-${ind}`).value
                    const fx1 = document.getElementById(`force-fxbar-1-${ind}`).value
                    const fx2 = document.getElementById(`force-fxbar-2-${ind}`).value
                    const fc0 = document.getElementById(`force-fcl-0-${ind}`).value
                    const fc1 = document.getElementById(`force-fcl-1-${ind}`).value
                    const fc2 = document.getElementById(`force-fcl-2-${ind}`).value
                    if (isNaN(fx0) || isNaN(fx1) || isNaN(fx2) ||
                        isNaN(fc0) || isNaN(fc1) || isNaN(fc2)) {
                        alert("force value is error")
                        return
                    } else {
                        newfcl = `${fc0};${fc1};${fc2}`
                        newfxbar = `${fx0};${fx1};${fx2}`
                        forceFlag = true
                        //console.log(newfcl)
                        //console.log(newfxbar)
                    }
                }
                console.log(forceFlag)
                console.log(newfcl)
                console.log(newfxbar)
                api.put(`/datarec/${item.id}/update/`, {
                    force: forceFlag,
                    fcl: newfcl,
                    fxbar: newfxbar,
                })
                    .then(res => {
                        this.setState({
                            xrData: {},
                            xrDataFiltered: [],
                            xrYear: "",
                            xrShift: "",
                            showXRList: false,
                            isLoading: false
                        })
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
        })
    }

    cancleXRList = () => {
        this.setState({
            xrYear: "",
            xrShift: "",
        }, () => {
            this.toggleXRList()
        })
    }

    toggleAddxr = () => {
        this.setState({
            addxrShow: !this.state.addxrShow
        })
    }

    savexrData = () => {
        const year = document.getElementById('xrDataYear').value
        var month = document.getElementById('xrDataMonth').value
        if ((isNaN(year) || isNaN(month)) && year === Number.parseInt(year) && month === Number.parseInt(month)) {
            alert("Year or Month value is invalid")
            return
        } else {
            if (month.length === 1) {
                month = `0${month}`
            }
        }
        const pno = this.state.currentViewNo
        const proc = this.state.processText
        const itemid = this.state.xrItemIdShow
        const shift = this.state.xrShift
        api.post(`/datarec/create/`, {
            section: curSection,
            partno: pno,
            process: proc,
            itemid: itemid,
            ym: `${year}-${month}`,
            d1: "",
            d2: "",
            d3: "",
            d4: "",
            msg1: "",
            msg2: "",
            msg3: "",
            msg4: "",
            shift: shift,
            progress: "",
            ngdayflag: "",
            cl: ";;",
            fcl: ";;",
            xbar: ";;",
            fxbar: ";;",
        })
            .then(res => {
                //console.log("create")
                this.getXRList(this.state.xrItem, false)
            })
            .catch(err => alert(err))
    }

    render() {
        return (
            <>
                <h1 className="title">Control Items Manager</h1>
                {(!Editview && !Monitorview) &&
                    <h1 className="title-1">
                        Current logged in user is not authorize to access this page
                    </h1>
                }
                {(Editview || Monitorview) &&
                    <div className="CreateForm">
                        {this.state.addPartnoTrig &&
                            <form className="form-group col-md-6 mx-auto was-validated"
                            >
                                <Label className="add-part-label">Add Part no.</Label>
                                <div className="rec-form-group">
                                    <label >Part no.</label>
                                    <input type="text" name="workno" className="form-control" id="partno" onChange={(e) => this.checkRepeatworkno(e.target.value)} required autoComplete="off"></input>
                                    {this.state.worknoRepeated && <FormText className="repeated-ht">{'This Part no is already exists'}</FormText>}
                                    {this.state.worknoCond.add && <FormText className="repeated-ht">{'Part no must not contain , _ / ; symbol and not empty'}</FormText>}
                                </div>
                                <div className="rec-form-group">
                                    <label >Part name</label>
                                    <input type="text" name="workname" className="form-control" id="partname" onChange={(e) => this.checkConditionPartname(e.target.value)} required autoComplete="off"></input>
                                    {this.state.partnameCond.add && <FormText className="repeated-ht">{'Part name must not contain , _ / ; symbol and not empty'}</FormText>}
                                </div>
                                <div className="rec-form-group">
                                    <label >Model</label>
                                    <input type="text" name="model" className="form-control" id="model" onChange={(e) => this.checkConditionPartmodel(e.target.value)} required autoComplete="off"></input>
                                    {this.state.partmodelCond.add && <FormText className="repeated-ht">{'Model must not contain , _ / ; symbol and not empty'}</FormText>}
                                </div>
                                <button type="button" className="btn btn-primary mr-1 mb-3" onClick={() => this.handleSubmitbtn()}>Add</button>
                                <button type="button" className="btn btn-danger mb-3" onClick={() => this.ClearAddDetails()}>Clear</button>
                            </form>
                        }
                        {this.state.currentViewNo === "" &&
                            <Col sm="12" md={{ size: 10, offset: 1 }}>
                                <div className="regis-head">
                                    <div className="regis-table-search ctrl-item-head-part">
                                        <FontAwesomeIcon id="addEditPart" icon={this.state.addPartnoTrig ? faMinusCircle : faPlusCircle} onClick={() => this.trigOpenAddPartno()} />
                                        {this.unControlToolTipPack("addEditPart", "Add Part no.")}
                                        <p className="search-txt">{'Search Part no.'}</p>
                                        <InputGroup>
                                            <Input placeholder="Input Part no. ..." id="part-search" onChange={(e) => this.SearchByPartno(e.target.value)} autoComplete="off" />
                                        </InputGroup>
                                    </div>
                                    <div className="regis-table-page">
                                        <Pagination aria-label="Page navigation example">
                                            <PaginationItem >
                                                <PaginationLink first onClick={() => this.clickPagination(1)} disabled={this.state.pageActive === 1 || this.state.pageAmount === 0} />
                                            </PaginationItem>
                                            <PaginationItem >
                                                <PaginationLink previous onClick={() => this.clickPagination(this.state.pageActive - 1)} disabled={this.state.pageActive === 1 || this.state.pageAmount === 0} />
                                            </PaginationItem>
                                            {this.state.pageShow.map((i, index) => {
                                                return (
                                                    <PaginationItem key={index} active={this.state.pageActive === i}>
                                                        <PaginationLink onClick={() => this.clickPagination(i)}>
                                                            {i}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )
                                            })}
                                            <PaginationItem>
                                                <PaginationLink next onClick={() => this.clickPagination(this.state.pageActive + 1)} disabled={this.state.pageActive === this.state.pageAmount || this.state.pageAmount === 0} />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink last onClick={() => this.clickPagination(this.state.pageAmount)} disabled={this.state.pageActive === this.state.pageAmount || this.state.pageAmount === 0} />
                                            </PaginationItem>
                                        </Pagination>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <Table striped hover responsive>
                                        <thead>
                                            <tr>
                                                <th id="col1"></th>
                                                <th id="col2">Part no.</th>
                                                <th id="col3">Part name</th>
                                                <th id="col4">Model</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.filteredLists.map((item, ind) => {
                                                if (ind === 0) {
                                                    cntResults = 0
                                                }
                                                cntResults++
                                                if (cntResults <= perPage * this.state.pageActive && cntResults > perPage * (this.state.pageActive - 1)) {
                                                    return (
                                                        <tr key={ind}>
                                                            <td>
                                                                <FontAwesomeIcon id={`viewEditPart${ind}`} icon={faEye} onClick={() => this.toggleView(item.partno, false)} />
                                                                {this.unControlToolTipPack(`viewEditPart${ind}`, "View")}
                                                                {!Monitorview &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`editEditPart${ind}`} icon={faEdit} onClick={() => this.toggle(item.id, item.partno, item.partname, item.model)} />
                                                                        <FontAwesomeIcon id={`copyEditPart${ind}`} icon={faCopy} onClick={() => this.toggleCopyPartno(item)} />
                                                                        <FontAwesomeIcon id={`deleteEditPart${ind}`} icon={faTrash} onClick={() => this.toggleDelete(item.id, "partno", item.partno)} />
                                                                        {this.unControlToolTipPack(`editEditPart${ind}`, "Edit")}
                                                                        {this.unControlToolTipPack(`copyEditPart${ind}`, "Copy")}
                                                                        {this.unControlToolTipPack(`deleteEditPart${ind}`, "Delete")}
                                                                    </>
                                                                }
                                                            </td>
                                                            <td>{item.partno}</td>
                                                            <td>{item.partname}</td>
                                                            <td>{item.model}</td>
                                                        </tr>
                                                    )
                                                } else {
                                                    return null
                                                }
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                        }
                        {this.state.currentViewNo !== "" &&
                            <div className="ctrl-item-main">
                                <div className="ctrl-head">
                                    <FontAwesomeIcon id="backEditPart" icon={faAngleDoubleLeft} onClick={() => this.backToPartno()} />
                                    {this.unControlToolTipPack("backEditPart", "Back")}
                                    <p className="ctrl-head-text">{`Control Items of : `}</p>
                                    <p className="ctrl-head-text-no">{this.state.currentViewNo}</p>
                                </div>
                                <div className="proc-dropdown">
                                    {!Monitorview &&
                                        <>
                                            <FontAwesomeIcon id="addEditProc" icon={faPlusCircle} onClick={() => this.toggleAddProc()} />
                                            {this.unControlToolTipPack("addEditProc", "Add Process")}
                                        </>
                                    }
                                    {(this.state.processSelected && !Monitorview) &&
                                        <div>
                                            <FontAwesomeIcon id="editEditProc" icon={faEdit} onClick={() => this.toggleEditProc()} />
                                            <FontAwesomeIcon id="deleteEditProc" icon={faTrash} onClick={() => this.toggleDelete(this.state.processText, "process")} />
                                            {this.unControlToolTipPack("editEditProc", "Edit Process")}
                                            {this.unControlToolTipPack("deleteEditProc", "Delete Process")}
                                        </div>
                                    }
                                    <InputGroupButtonDropdown
                                        className={this.state.processSelected ? 'dropdown-selected' : 'dropdown-noselect'}
                                        addonType="append" isOpen={this.state.processOpen} toggle={this.toggleprocess}>
                                        <DropdownToggle caret>
                                            {this.state.processText}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {this.state.processlist.map((item, ind) => (
                                                <DropdownItem onClick={() => this.processSelected(item.process)} key={ind}>{item.process}</DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                </div>
                                {this.state.processSelected &&
                                    <div>
                                        <div className="item-table-head">
                                            <div className="regis-table-search">
                                                <p className="search-txt">{'Search Item no.'}</p>
                                                <InputGroup>
                                                    <Input placeholder="Input Control items no. ..." id="item-search" onChange={(e) => this.SearchByitem(e.target.value)} autoComplete="off" />
                                                </InputGroup>
                                            </div>
                                            <div className="regis-table-page">
                                                <Pagination aria-label="Page navigation example">
                                                    <PaginationItem >
                                                        <PaginationLink first onClick={() => this.clickItemPagination(1)} disabled={this.state.pageItemActive === 1 || this.state.pageItemAmount === 0} />
                                                    </PaginationItem>
                                                    <PaginationItem >
                                                        <PaginationLink previous onClick={() => this.clickItemPagination(this.state.pageItemActive - 1)} disabled={this.state.pageItemActive === 1 || this.state.pageItemAmount === 0} />
                                                    </PaginationItem>
                                                    {this.state.pageItemShow.map((i, index) => {
                                                        return (
                                                            <PaginationItem key={index} active={this.state.pageItemActive === i}>
                                                                <PaginationLink onClick={() => this.clickItemPagination(i)}>
                                                                    {i}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        )
                                                    })}
                                                    <PaginationItem>
                                                        <PaginationLink next onClick={() => this.clickItemPagination(this.state.pageItemActive + 1)} disabled={this.state.pageItemActive === this.state.pageItemAmount || this.state.pageItemAmount === 0} />
                                                    </PaginationItem>
                                                    <PaginationItem>
                                                        <PaginationLink last onClick={() => this.clickItemPagination(this.state.pageItemAmount)} disabled={this.state.pageItemActive === this.state.pageItemAmount || this.state.pageItemAmount === 0} />
                                                    </PaginationItem>
                                                </Pagination>
                                            </div>
                                        </div>
                                        <div className="item-table-responsive">
                                            <Table striped hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th id="item-col0">
                                                            {(this.state.processSelected && !Monitorview) &&
                                                                <>
                                                                    <FontAwesomeIcon id="addEditItem" icon={faPlusCircle} onClick={() => this.toggleAddView()} />
                                                                    <UncontrolledTooltip placement="left" target="addEditItem" hideArrow={true} >
                                                                        {"Add Item"}
                                                                    </UncontrolledTooltip>
                                                                </>
                                                            }
                                                        </th>
                                                        <th id="item-col1">No.</th>
                                                        <th id="item-col2">Parameter</th>
                                                        <th id="item-col3">Method</th>
                                                        <th id="item-col4">Upper limit</th>
                                                        <th id="item-col5">Lower limit</th>
                                                        <th id="item-col6">Unit</th>
                                                        <th id="item-col7">Master value</th>
                                                        <th id="item-col8">Calculation method</th>
                                                        <th id="item-col9">Measuring times</th>
                                                        <th id="item-col10">Interval</th>
                                                        <th id="item-col10_2">N =</th>
                                                        <th id="item-col11">Measuring tool</th>
                                                        <th id="item-col12">Machine no.</th>
                                                        <th id="item-col13">Readability</th>
                                                        <th id="item-col14">Remark</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.filtereditemlist.map((item, ind) => {
                                                        if (ind === 0) {
                                                            cntResults = 0
                                                        }
                                                        cntResults++
                                                        var read = 0
                                                        //console.log(item.readability)
                                                        if (item.readability !== "") {
                                                            read = item.readability.length - item.readability.indexOf(".") - 1
                                                        }
                                                        var masval = Number.parseFloat(item.masterval).toFixed(read)
                                                        if (isNaN(masval)) {
                                                            masval = 0
                                                        }
                                                        //console.log(read)
                                                        if (cntResults <= perPage * this.state.pageItemActive && cntResults > perPage * (this.state.pageItemActive - 1)) {
                                                            return (
                                                                <tr key={ind}>
                                                                    <td>
                                                                        {!Monitorview &&
                                                                            <>
                                                                                <FontAwesomeIcon id={`copyEditItem${ind}`} icon={faCopy} onClick={() => this.toggleCopyItem(item)} />
                                                                                <FontAwesomeIcon id={`editEditItem${ind}`} icon={faEdit} onClick={() => this.toggleEditItem(item)} />
                                                                                <FontAwesomeIcon id={`deleteEditItem${ind}`} icon={faTrash} onClick={() => this.toggleDelete(item.id, "item", item.itemid)} />
                                                                                {this.unControlToolTipPack(`copyEditItem${ind}`, "Copy")}
                                                                                {this.unControlToolTipPack(`editEditItem${ind}`, "Edit")}
                                                                                {this.unControlToolTipPack(`deleteEditItem${ind}`, "Delete")}
                                                                            </>
                                                                        }
                                                                    </td>
                                                                    <td>{item.itemid}</td>
                                                                    {item.recmethod === "Check sheet" ?
                                                                        <td onClick={() => this.showDetailItem(item)}>
                                                                            <Input type="textarea"
                                                                                className="textarea-table"
                                                                                value={item.parameter}
                                                                                rows={item.parameter.split('\n').length}
                                                                                disabled />
                                                                        </td>
                                                                        :
                                                                        <td onClick={() => this.showDetailItem(item)}>{item.parameter}</td>
                                                                    }
                                                                    <td>
                                                                        {item.recmethod}
                                                                        {(item.recmethod === "x-R chart" || item.recmethod === "x-Rs chart") &&
                                                                            <>
                                                                                <FontAwesomeIcon id={`viewEditlist${ind}`} icon={faListUl} onClick={() => this.getXRList(item, true)} />
                                                                                {this.unControlToolTipPack(`viewEditlist${ind}`, "x-R limits")}
                                                                            </>
                                                                        }
                                                                    </td>
                                                                    {item.limit !== null ?
                                                                        <td>{item.limit.split(";")[0]}</td>
                                                                        :
                                                                        <td>-</td>
                                                                    }
                                                                    {item.limit !== null ?
                                                                        <td>{item.limit.split(";")[1]}</td>
                                                                        :
                                                                        <td>-</td>
                                                                    }
                                                                    <td>{item.unit}</td>
                                                                    <td>{masval}</td>
                                                                    <td>{item.calmethod}</td>
                                                                    <td>{item.meastimes}</td>
                                                                    <td>
                                                                        {(item.interval2.includes("When change") && !item.interval2.includes("Pieces")) ?
                                                                            `${item.interval1}/${item.interval2} (freq. = ${item.interval_wc})`
                                                                            :
                                                                            `${item.interval1}/${item.interval2}`
                                                                        }
                                                                    </td>
                                                                    <td>{item.interval_n}</td>
                                                                    <td>{item.meastool}</td>
                                                                    <td>{item.mcno}</td>
                                                                    <td>{item.readability}</td>
                                                                    <td>{item.remark}</td>
                                                                </tr>
                                                            )
                                                        } else {
                                                            return null
                                                        }
                                                    })}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                        {/*Edit Part no modal */}
                        <Modal isOpen={this.state.isModalCopyPartnoOpen} toggle={this.toggleCopyPartno} className="copy-regis-content">
                            <ModalHeader toggle={this.toggleCopyPartno}>Copy</ModalHeader>
                            <ModalBody className="copy-regis-body">
                                <FormGroup>
                                    <div className="topic-input">
                                        <Label for="listdetail">Destination Section</Label>
                                        <FormText className="limit-text">{'[10 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"copysectionmodal"}
                                        defaultValue={curSection}
                                        onChange={(e) => this.checkSectionCopy(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.sectionCond.copy && <FormText className="repeated-ht">{'Section must not contain , _ / ; symbol and not empty'}</FormText>}
                                    <div className="topic-input">
                                        <Label for="listdetail">Destination Part no.</Label>
                                        <FormText className="limit-text">{'[20 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"copypartnomodal"}
                                        defaultValue={this.state.noInput}
                                        onChange={(e) => this.checkRepeatworknoCopy(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.worknoCopyRepeated && <FormText className="repeated-ht">{'This Part no. is already exists'}</FormText>}
                                    {this.state.worknoCond.copy && <FormText className="repeated-ht">{'Part no must not contain , _ / ; symbol and not empty'}</FormText>}
                                    <div className="topic-input">
                                        <Label for="listdetail">Destination Part name</Label>
                                        <FormText className="limit-text">{'[100 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"copypartnamemodal"}
                                        defaultValue={this.state.partnoItem.partname}
                                        required
                                        autoComplete="off" />
                                    <div className="topic-input">
                                        <Label for="listdetail">Destination Model</Label>
                                        <FormText className="limit-text">{'[10 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"copypartmodelmodal"}
                                        defaultValue={this.state.partnoItem.model}
                                        required
                                        autoComplete="off" />
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.copyPartno()}>Save</Button>{' '}
                                <Button color="secondary" onClick={this.toggleCopyPartno}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.isModalOpen} toggle={this.toggle} className="copy-regis-content">
                            <ModalHeader toggle={this.toggle}>Edit</ModalHeader>
                            <ModalBody className="copy-regis-body">
                                <FormGroup>
                                    <div className="topic-input">
                                        <Label for="listdetail">Part no.</Label>
                                        <FormText className="limit-text">{'[20 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"partnomodal"}
                                        defaultValue={this.state.noInput}
                                        onChange={(e) => this.checkRepeatworknoEdit(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.worknoUpdateRepeated && <FormText className="repeated-ht">{'This Part no. is already exists'}</FormText>}
                                    {this.state.worknoCond.edit && <FormText className="repeated-ht">{'Part no must not contain , _ / ; symbol and not empty'}</FormText>}
                                    <div className="topic-input">
                                        <Label for="listdetail">Part name</Label>
                                        <FormText className="limit-text">{'[100 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"partnamemodal"}
                                        defaultValue={this.state.nameInput}
                                        onChange={(e) => this.checkConditionPartnameEdit(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.partnameCond.edit && <FormText className="repeated-ht">{'Part name must not contain , _ / ; symbol and not empty'}</FormText>}
                                    <div className="topic-input">
                                        <Label for="listdetail">Model</Label>
                                        <FormText className="limit-text">{'[10 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"modelmodal"}
                                        defaultValue={this.state.modelInput}
                                        onChange={(e) => this.checkConditionPartmodelEdit(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.partmodelCond.edit && <FormText className="repeated-ht">{'Model must not contain , _ / ; symbol and not empty'}</FormText>}
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.updateList()}>Save</Button>{' '}
                                <Button color="secondary" onClick={this.toggle}>Cancel</Button>
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

                        <Modal isOpen={this.state.isModalAddProcOpen} toggle={this.toggleAddProc} className="edit-proc-content">
                            <ModalHeader toggle={this.toggleAddProc}>Add Process</ModalHeader>
                            <ModalBody className="edit-proc-body">
                                <FormGroup>
                                    <div className="topic-input">
                                        <Label for="listdetail">Process name</Label>
                                        <FormText className="limit-text">{'[100 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"addprocess"}
                                        onChange={(e) => this.checkConditionProcess(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.processCond.repeat && <FormText className="repeated-ht">{'This Process name is already exists'}</FormText>}
                                    {this.state.processCond.add && <FormText className="repeated-ht">{'Process name must not contain , _ / ; symbol and not empty'}</FormText>}
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.AddProcessName()}>Add</Button>{' '}
                                <Button color="secondary" onClick={this.toggleAddProc}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.isModalEditProcOpen} toggle={this.toggleEditProc} className="edit-proc-content">
                            <ModalHeader toggle={this.toggleEditProc}>Edit Process name</ModalHeader>
                            <ModalBody className="edit-proc-body">
                                <FormGroup>
                                    <div className="topic-input">
                                        <Label for="listdetail">Process name</Label>
                                        <FormText className="limit-text">{'[100 characters max]'}</FormText>
                                    </div>
                                    <Input type="text"
                                        id={"editprocess"}
                                        defaultValue={this.state.processText}
                                        onChange={(e) => this.checkConditionProcessEdit(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.processCond.repeat && <FormText className="repeated-ht">{'This Process name is already exists'}</FormText>}
                                    {this.state.processCond.edit && <FormText className="repeated-ht">{'Process name must not contain , _ / ; symbol and not empty'}</FormText>}
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.EditProcessName()}>Save</Button>{' '}
                                <Button color="secondary" onClick={this.toggleEditProc}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.isModalAddOpen} toggle={this.toggleAddView} className="ctrl-item-regis-content">
                            <ModalHeader toggle={this.toggleAddView}>Edit</ModalHeader>
                            <ModalBody className="ctrl-item-regis-body">
                                <FormGroup>
                                    <div className="topic-input">
                                        <Label >Item no.</Label>
                                        <FormText className="limit-text">{'[5 characters max]'}</FormText>
                                    </div>
                                    <Input type="text" id={"itemno"}
                                        className={!this.state.condCheck.itemno && !this.state.itemnoRepeated ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.itemno}
                                        onChange={(e) => this.checkRepeatitemAddModal(e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.itemnoRepeated && <FormText className="repeated-ht">{'This Item no. is already exists'}</FormText>}
                                    {this.state.condCheck.itemno && <FormText className="cond-ng-txt">{`Item no. must be Number (first character) and '-' only, not be zero or empty and not more than 5 characters`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Parameter</Label>
                                        <FormText className="limit-text">{'[2,000 characters max]'}</FormText>
                                    </div>
                                    <Input type={this.state.showChecksheet ? "textarea" : "text"} id={"parameter"}
                                        className={!this.state.condCheck.parameter ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.parameter}
                                        onChange={(e) => {
                                            this.checkCondition("parameter", e.target.value)
                                            if (this.state.showChecksheet) {
                                                this.changeRowTextArea(e.currentTarget.value)
                                            }
                                        }}
                                        required
                                        rows={this.state.rowTextArea}
                                        autoComplete="off" />
                                    {this.state.condCheck.parameter && <FormText className="cond-ng-txt">{`Parameter must not contain , _ / ; symbol and not empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Method</Label>
                                    </div>
                                    <InputGroupButtonDropdown
                                        className={this.state.recmethodSelected ? 'ctrl-item-dropdown-selected' : 'ctrl-item-dropdown-noselect'}
                                        addonType="append" isOpen={this.state.recmethodOpen} toggle={() => this.toggleItemDropDown("recmethod")}>
                                        <DropdownToggle caret>
                                            {this.state.recmethodText}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={() => this.inModalSelect("recmethod", "Check sheet")} >{"Check sheet"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("recmethod", "Record sheet")} >{"Record sheet"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("recmethod", "x-R chart")} >{"x-R chart"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("recmethod", "x-Rs chart")} >{"x-Rs chart"}</DropdownItem>
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    <div className="topic-input">
                                        <Label >Upper limit</Label>
                                        <FormText className="limit-text">{'[20 characters max]'}</FormText>
                                    </div>
                                    <Input type="text" id={"upperlimit"}
                                        className={(!this.state.condCheck.limit && !this.state.condCheck.limit_1) || this.state.showChecksheet ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.upperlimit}
                                        onChange={(e) => this.checkCondition("upperlimit", e.target.value)}
                                        autoComplete="off"
                                        disabled={this.state.showChecksheet} />
                                    {this.state.condCheck.limit && <FormText className="cond-ng-txt">{`Upper limit must be Number and value more than Lower limit`}</FormText>}
                                    {this.state.condCheck.limit_1 && <FormText className="cond-ng-txt">{`Must input Upper limit or Lower limit just least one`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Lower limit</Label>
                                        <FormText className="limit-text">{'[20 characters max]'}</FormText>
                                    </div>
                                    <Input type="text" id={"lowerlimit"}
                                        className={(!this.state.condCheck.limit && !this.state.condCheck.limit_1) || this.state.showChecksheet ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.lowerlimit}
                                        onChange={(e) => this.checkCondition("lowerlimit", e.target.value)}
                                        autoComplete="off"
                                        disabled={this.state.showChecksheet} />
                                    {this.state.condCheck.limit && <FormText className="cond-ng-txt">{`Lower limit must be Number and value less than Upper limit and not empty`}</FormText>}
                                    {this.state.condCheck.limit_1 && <FormText className="cond-ng-txt">{`Must input Upper limit or Lower limit just least one`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Unit</Label>
                                        <FormText className="limit-text">{'[10 characters max]'}</FormText>
                                    </div>
                                    <Input type="text" id={"unit"}
                                        className={!this.state.condCheck.unit || this.state.showChecksheet ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.unit}
                                        onChange={(e) => this.checkCondition("unit", e.target.value)}
                                        required
                                        autoComplete="off"
                                        disabled={this.state.showChecksheet} />
                                    {this.state.condCheck.unit && <FormText className="cond-ng-txt">{`Unit must not contain , _ / ; symbol and not empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Master value</Label>
                                        <FormText className="limit-text">{'[9,999,999 max]'}</FormText>
                                    </div>
                                    <Input type="text" id={"masterval"}
                                        className={!this.state.condCheck.masterval || this.state.showChecksheet ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.masterval}
                                        onChange={(e) => this.checkCondition("masterval", e.target.value)}
                                        required
                                        autoComplete="off"
                                        disabled={this.state.showChecksheet} />
                                    {this.state.condCheck.masterval && <FormText className="cond-ng-txt">{`Master value must be Number only and not empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Calculation method</Label>
                                    </div>
                                    <InputGroupButtonDropdown
                                        className={this.state.calmethodSelected || this.state.showChecksheet ? 'ctrl-item-dropdown-selected' : 'ctrl-item-dropdown-noselect'}
                                        addonType="append" isOpen={this.state.calmethodOpen} toggle={() => this.toggleItemDropDown("calmethod")}
                                        disabled={this.state.showChecksheet} >
                                        <DropdownToggle caret className={this.state.showChecksheet ? "disabled-dropdown" : ""}>
                                            {this.state.calmethodText}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={() => this.inModalSelect("calmethod", "None")} >{"None"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("calmethod", "Average")} >{"Average"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("calmethod", "Max only")} >{"Max only"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("calmethod", "Min only")} >{"Min only"}</DropdownItem>
                                            <DropdownItem onClick={() => this.inModalSelect("calmethod", "Max-Min")} >{"Max-Min"}</DropdownItem>
                                            {(this.state.recmethodText !== "x-R chart" && this.state.recmethodText !== "x-Rs chart") &&
                                                <DropdownItem onClick={() => this.inModalSelect("calmethod", "Max & Min")} >{"Max & Min"}</DropdownItem>
                                            }
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    <div className="topic-input">
                                        <Label >Measuring times</Label>
                                        <FormText className="limit-text">{'[Integer value]'}</FormText>
                                    </div>
                                    <Input type="text" id={"meastimes"}
                                        className={((!this.state.condCheck.meastimes && !this.state.condCheck.meastimes_4) || this.state.showChecksheet) ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.meastimes}
                                        onChange={(e) => this.checkCondition("meastimes", e.target.value)}
                                        required
                                        autoComplete="off"
                                        disabled={this.state.showChecksheet} />
                                    {this.state.condCheck.meastimes && <FormText className="cond-ng-txt">{`Measuring times must be Integer number and not empty`}</FormText>}
                                    {this.state.condCheck.meastimes_4 && <FormText className="cond-ng-txt">{`Max & Min Calculation Method, Measuring times must more than or equal 2`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Interval</Label>
                                    </div>
                                    <div className="interval-ctrl-item">
                                        <Input type="text" id={"interval"}
                                            className={(!this.state.condCheck.interval && !this.state.condCheck.interval_2 && !this.state.condCheck.interval_4) ? "input-ok" : "input-ng"}
                                            defaultValue={this.state.editItem.interval}
                                            onChange={(e) => this.checkCondition("interval", e.target.value)}
                                            required
                                            autoComplete="off" />
                                        <p>/</p>
                                        {this.state.intervalPieces &&
                                            <Input type="text" id={"interval_pieces"}
                                                className={(this.state.intervalPieces && !this.state.condCheck.interval_3) ? "input-ok" : "input-ng"}
                                                defaultValue={this.state.editItem.pieces}
                                                onChange={(e) => this.checkCondition("interval_pieces", e.target.value)}
                                                required
                                                autoComplete="off" />
                                        }
                                        <InputGroupButtonDropdown
                                            className={this.state.intervalSelected ? 'ctrl-item-dropdown-selected' : 'ctrl-item-dropdown-noselect'}
                                            addonType="append" isOpen={this.state.intervalOpen} toggle={() => this.toggleItemDropDown("interval")}>
                                            <DropdownToggle caret>
                                                {this.state.intervalText}
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "When change")} >{"When change"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Pieces")} >{"Pieces"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Before start")} >{"Before start"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "At start")} >{"At start"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Lot")} >{"Lot"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Shift")} >{"Shift"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Day")} >{"Day"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Week")} >{"Week"}</DropdownItem>
                                                <DropdownItem onClick={() => this.inModalSelect("interval", "Month")} >{"Month"}</DropdownItem>
                                            </DropdownMenu>
                                        </InputGroupButtonDropdown>
                                        {this.state.intervalWhenChange &&
                                            <Input type="text" id={"interval_whenchange"}
                                                className={(this.state.intervalWhenChange && !this.state.condCheck.interval_5) ? "input-ok" : "input-ng"}
                                                defaultValue={this.state.editItem.whenchange}
                                                onChange={(e) => this.checkCondition("interval_whenchange", e.target.value)}
                                                required
                                                autoComplete="off" />
                                        }
                                        <h6>{`[n = `}</h6>
                                        <Input type="text" id={"interval_n"}
                                            className={(!this.state.condCheck.interval && !this.state.condCheck.interval_2 && !this.state.condCheck.interval_4) ? "input-ok" : "input-ng"}
                                            defaultValue={this.state.editItem.interval_n}
                                            onChange={(e) => this.checkCondition("interval", e.target.value)}
                                            required
                                            autoComplete="off" />
                                        <h6>{`]`}</h6>
                                    </div>
                                    {this.state.intervalWhenChange &&
                                        <div className="interval-ctrl-item">
                                            <h6>{`[Frequency of changing : `}</h6>
                                            <Input type="text" id={"interval_wc"}
                                                className={(!this.state.condCheck.interval && !this.state.condCheck.interval_2 && !this.state.condCheck.interval_4) ? "input-ok" : "input-ng"}
                                                defaultValue={this.state.editItem.whenchange_n}
                                                onChange={(e) => this.checkCondition("interval", e.target.value)}
                                                required
                                                autoComplete="off" />
                                            <h6>{`]`}</h6>
                                        </div>
                                    }
                                    {this.state.condCheck.interval && <FormText className="cond-ng-txt">{`Interval value must be Integer number, not empty and less than 30`}</FormText>}
                                    {this.state.condCheck.interval_2 && <FormText className="cond-ng-txt">{`Interval of x-R chart must more than or equal 2`}</FormText>}
                                    {(this.state.condCheck.interval_3 && this.state.intervalPieces) && <FormText className="cond-ng-txt">{`Amount of interval pieces must not empty and more than 0`}</FormText>}
                                    {this.state.condCheck.interval_4 && <FormText className="cond-ng-txt">{`Interval * n-value must be less than 30`}</FormText>}
                                    {(this.state.condCheck.interval_5 && this.state.intervalWhenChange) && <FormText className="cond-ng-txt">{`When change detail must not be empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Measuring tool</Label>
                                        <FormText className="limit-text">{'[30 characters max]'}</FormText>
                                    </div>
                                    <InputGroupButtonDropdown
                                        className={this.state.meastoolSelected ? 'ctrl-item-dropdown-selected' : 'ctrl-item-dropdown-noselect'}
                                        addonType="append" isOpen={this.state.meastoolOpen} toggle={() => this.toggleItemDropDown("meastool")}>
                                        <DropdownToggle caret>
                                            {this.state.meastoolText}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {this.state.showChecksheet ?
                                                CheckmeastoolList.map((tool, ind) => {
                                                    return <DropdownItem onClick={() => this.inModalSelect("meastool", tool)} key={ind}>{tool}</DropdownItem>
                                                })
                                                :
                                                meastoolList.map((tool, ind) => {
                                                    return <DropdownItem onClick={() => this.inModalSelect("meastool", tool)} key={ind}>{tool}</DropdownItem>
                                                })
                                            }
                                            <DropdownItem onClick={() => this.inModalSelect("meastool", "Other")} >{"Other"}</DropdownItem>
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    {this.state.meastoolOtherSelected &&
                                        <Input type="text" id={"meastool"}
                                            className={!this.state.condCheck.meastool || this.state.showChecksheet ? "input-ok" : "input-ng"}
                                            defaultValue={this.state.editItem.meastool}
                                            onChange={(e) => this.checkCondition("meastool", e.target.value)}
                                            required
                                            autoComplete="off" />
                                    }
                                    {(this.state.meastoolOtherSelected && this.state.condCheck.meastool) && <FormText className="cond-ng-txt">{`Measuring tool must not contain , _ / ; symbol and not empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Machine no.</Label>
                                        <FormText className="limit-text">{'[15 characters max]'}</FormText>
                                    </div>
                                    <Input type="text" id={"machineno"}
                                        className={!this.state.condCheck.machineno ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.machineno}
                                        onChange={(e) => this.checkCondition("machineno", e.target.value)}
                                        required
                                        autoComplete="off" />
                                    {this.state.condCheck.machineno && <FormText className="cond-ng-txt">{`Measuring tool must not contain , _ / ; symbol and not empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Readability</Label>
                                        <FormText className="limit-text">{'[6 characters max (input just number, exclude unit)]'}</FormText>
                                    </div>
                                    <Input type="text" id={"readability"}
                                        className={!this.state.condCheck.readability || this.state.showChecksheet ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.readability}
                                        onChange={(e) => this.checkCondition("readability", e.target.value)}
                                        required
                                        autoComplete="off"
                                        disabled={this.state.showChecksheet} />
                                    {this.state.condCheck.readability && <FormText className="cond-ng-txt">{`Readability must be Number only and not empty`}</FormText>}
                                    <div className="topic-input">
                                        <Label >Remark</Label>
                                        <FormText className="limit-text">{'[2,000 characters max]'}</FormText>
                                    </div>
                                    <Input type={"textarea"} id={"remark"}
                                        className={!this.state.condCheck.remark ? "input-ok" : "input-ng"}
                                        defaultValue={this.state.editItem.remark}
                                        onChange={(e) => {
                                            this.checkCondition("remark", e.target.value)
                                            this.changeRowTextAreaRemark(e.currentTarget.value)
                                        }}
                                        required
                                        rows={this.state.rowTextAreaRemark}
                                        autoComplete="off" />
                                    {this.state.condCheck.remark && <FormText className="cond-ng-txt">{`Remark must not contain , _ / ; symbol`}</FormText>}
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.submitItem()}>Save</Button>{' '}
                                <Button color="secondary" onClick={this.toggleAddView}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.showXRList} toggle={this.toggleXRList} className="ctrl-item-edit-xr">
                            <ModalHeader toggle={this.toggleXRList}>x-R Data</ModalHeader>
                            <ModalBody >
                                <FormGroup>
                                    <div className="head">
                                        <div className="year">
                                            <Label for="listdetail">Year</Label>
                                            <InputGroupButtonDropdown
                                                className='ctrl-item-dropdown-selected'
                                                addonType="append" isOpen={this.state.XRListYearOpen} toggle={() => this.toggleItemDropDown("XRListYear")}>
                                                <DropdownToggle caret>
                                                    {this.state.xrYear}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {this.state.XRListYear.map((list, ind) => (
                                                        <DropdownItem onClick={() => this.changeXRListYear(list)} key={ind}>{list}</DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                        </div>
                                        <div className="shift">
                                            <Label for="listdetail">Shift</Label>
                                            <InputGroupButtonDropdown
                                                className='ctrl-item-dropdown-selected'
                                                addonType="append" isOpen={this.state.XRListShiftOpen} toggle={() => this.toggleItemDropDown("XRListShift")}>
                                                <DropdownToggle caret>
                                                    {this.state.xrShift}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem onClick={() => this.changeXRListShift("A")} >{"A"}</DropdownItem>
                                                    <DropdownItem onClick={() => this.changeXRListShift("B")} >{"B"}</DropdownItem>
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                        </div>
                                        {!Monitorview &&
                                            <div className="add-xr-data">
                                                <FontAwesomeIcon id="addEditItem" icon={faPlusCircle} onClick={() => this.toggleAddxr()} />
                                                <UncontrolledTooltip placement="left" target="addEditItem" hideArrow={true} >
                                                    {"Add Control Limit Data"}
                                                </UncontrolledTooltip>
                                            </div>
                                        }
                                    </div>
                                    {this.state.addxrShow &&
                                        <>
                                            <div className="xr-data-input">
                                                <span>Year</span>
                                                <Input id="xrDataYear" type="text" autoComplete="off" placeholder="ex. 2021" />
                                                <span>Month</span>
                                                <Input id="xrDataMonth" type="text" autoComplete="off" placeholder="ex. 02" />
                                                <Button color="success" onClick={() => this.savexrData()}>save</Button>
                                            </div>
                                        </>
                                    }
                                    <div className="table">
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th id="xr-col0"></th>
                                                    <th id="xr-col0">Year</th>
                                                    <th id="xr-col1">Month</th>
                                                    <th id="xr-col2">Force?</th>
                                                    <th id="xr-col3">X-bar</th>
                                                    <th id="xr-col4">UCL</th>
                                                    <th id="xr-col5">LCL</th>
                                                    <th id="xr-col6">R-bar</th>
                                                    <th id="xr-col7">R UCL</th>
                                                    <th id="xr-col8">Cpk</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.xrDataFiltered.map((item, ind) => {
                                                    //console.log(item.force)
                                                    return (
                                                        <tr key={ind}>
                                                            <td>
                                                                {item.cl === ";;" &&
                                                                    <>
                                                                        <FontAwesomeIcon id="deleteEditXRdata" icon={faMinusCircle} onClick={() => this.toggleDelete(item.id, "xrdata")} />
                                                                        <UncontrolledTooltip placement="left" target="deleteEditXRdata" hideArrow={true} >
                                                                            {"Delete Control limit data"}
                                                                        </UncontrolledTooltip>
                                                                    </>
                                                                }
                                                            </td>
                                                            <td>{item.ym.substr(0, 4)}</td>
                                                            <td>{item.ym.substr(5, 2)}</td>
                                                            <td>
                                                                {!Monitorview &&
                                                                    <Input className="force-checkbox" id={`check${ind}`} type="checkbox" addon onChange={(e) => this.checkForceXR(e, item.id, ind)} checked={item.force} />
                                                                }
                                                            </td>
                                                            {item.force ?
                                                                <>
                                                                    <td>
                                                                        {<Input key={`${item.ym}-${item.shift}-${ind}`} id={`force-fxbar-0-${ind}`} defaultValue={item.fxbar.split(";")[0]} className="force-text" type="text" autoComplete="off" />}
                                                                    </td>
                                                                    <td>
                                                                        {<Input key={`${item.ym}-${item.shift}-${ind}`} id={`force-fcl-0-${ind}`} defaultValue={item.fcl.split(";")[0]} className="force-text" type="text" autoComplete="off" />}
                                                                    </td>
                                                                    <td>
                                                                        {<Input key={`${item.ym}-${item.shift}-${ind}`} id={`force-fcl-1-${ind}`} defaultValue={item.fcl.split(";")[1]} className="force-text" type="text" autoComplete="off" />}
                                                                    </td>
                                                                    <td>
                                                                        {<Input key={`${item.ym}-${item.shift}-${ind}`} id={`force-fxbar-1-${ind}`} defaultValue={item.fxbar.split(";")[1]} className="force-text" type="text" autoComplete="off" />}
                                                                    </td>
                                                                    <td>
                                                                        {<Input key={`${item.ym}-${item.shift}-${ind}`} id={`force-fcl-2-${ind}`} defaultValue={item.fcl.split(";")[2]} className="force-text" type="text" autoComplete="off" />}
                                                                    </td>
                                                                    <td>
                                                                        {<Input key={`${item.ym}-${item.shift}-${ind}`} id={`force-fxbar-2-${ind}`} defaultValue={item.fxbar.split(";")[2]} className="force-text" type="text" autoComplete="off" />}
                                                                    </td>
                                                                </>
                                                                :
                                                                <>
                                                                    <td>{item.xbar.split(";")[0]}</td>
                                                                    <td>{item.cl.split(";")[0]}</td>
                                                                    <td>{item.cl.split(";")[1]}</td>
                                                                    <td>{item.xbar.split(";")[1]}</td>
                                                                    <td>{item.cl.split(";")[2]}</td>
                                                                    <td>{item.xbar.split(";")[2]}</td>
                                                                </>
                                                            }
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.saveXRList()}>Save</Button>{' '}
                                <Button color="secondary" onClick={() => this.cancleXRList()}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                    </div>
                }
                <div className="progress-spinner">
                    <Modal className="modal-spinner" isOpen={this.state.isLoading} centered>
                        <ModalBody>
                            <h5>Loading data ...</h5>
                            <PacmanLoader className="pacman" color={"#DC0032"} />
                        </ModalBody>
                    </Modal>
                </div>
            </>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null, mapDispatchToProps)(RegisList);