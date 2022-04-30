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
    InputGroup,
    UncontrolledTooltip,
    ButtonGroup,
} from 'reactstrap'
import './scss/RecordApprove.scss';
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEdit,
    faTrash,
    faEye,
    faCopy,
    faPlusCircle,
    faAngleDoubleLeft,
    faListUl,
    faAngleLeft,
    faAngleRight,
} from '@fortawesome/free-solid-svg-icons'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
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

class RegisList extends React.Component {
    state = {
        lists: [],
        isModalOpen: false,
        isModalDeleteOpen: false,
        listid: '',
        noInput: '',
        nameInput: '',
        modelInput: '',
        Deleteitemid: '',
        DeleteType: '',
        deleteText: '',
        pageActive: 1,
        pageAmount: 0,
        pageShow: [],
        filteredLists: [],
        currentViewNo: "",
        pickedDate: new Date(),
        shift: 'A',
    }

    constructor() {
        super();
        //curSection = localStorage.getItem('username')
        curSection = "1007348"
        this.getList();
    }

    componentDidMount() {
        //console.log(localStorage.getItem('username'))
        //curSection = localStorage.getItem('username')
        this.setState({
            currentViewNo: ""
        })
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getList = async (id) => {
        const ym = moment(this.state.pickedDate).format('YYYY-MM')
        await api.get(`/datarec/approver/${curSection}`)
            .then(res => {
                console.log(res.data)
                if (res.data.length > 0) {
                    var pos = res.data[0]['position']
                    var key = ""
                    var shift = "no"
                    if (pos === "LLa") {
                        key = "lla"
                        shift = "A"
                    } else if (pos === "LLb") {
                        key = "llb"
                        shift = "B"
                    } else if (pos === "AM" || pos === "MGR") {
                        key = "am"
                    } else if (pos === "AGM" || pos === "GM") {
                        key = "agm"
                    } else {
                        alert("position is invalid")
                        return
                    }
                    api.get(`/datarec/approve/list/`)
                        .then(lists => {
                            var arrSect = []
                            lists.data.forEach(list => {
                                if (list[key].includes(curSection)) {
                                    arrSect.push(list['section'])
                                }
                            })
                            console.log(arrSect)
                            var arrList = []
                            api.get(`/datarec/dataapprove/apprv_${ym}_${shift}`)
                                .then(appLists => {
                                    console.log(appLists.data)
                                    appLists.data.forEach(applist => {
                                        if (arrSect.includes(applist['section'])) {
                                            arrList.push(applist)
                                        }
                                    })
                                    console.log(arrList)
                                })
                        })
                    /*this.setState({
                        lists: arrResult,
                        filteredLists: arrResult,
                        isLoading: false,
                    }, () => {
                        this.createPagination()
                    });*/
                }
            })
            .catch(error => alert(error))
    }

    handleSubmitbtn = () => {
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
                    addPartnoTrig: false
                }, () => {
                    this.getList()
                })
            })
            .catch(error => alert(error))
    }

    ClearAddDetails = () => {
        document.getElementById('partno').value = '';
        document.getElementById('partname').value = '';
        document.getElementById('model').value = '';
    }

    deleteList = async (id) => {
        const type = this.state.DeleteType
        var apiurl = ""
        if (type === "partno") {
            apiurl = `/partno/${id}/delete/`
        } else if (type === "item") {
            apiurl = `/controlitems/${id}/delete/`
        } else if (type === "process") {
            apiurl = `/controlitems/deleteproc/${curSection}_${this.state.currentViewNo}_${id}`
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
                } else {
                    this.processSelected(this.state.processText)
                    this.setState({
                        isModalDeleteOpen: false,
                    })
                }
            })
            .catch(error => alert(error))
    }

    toggleView = (partno, flag, procname) => {
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

    updateList = async () => {
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

    SearchBySection = (partno) => {
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
    }

    SearchByitem = (itemno) => {
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
                meastool: "",
                machineno: "",
                readability: "",
            },
            recmethodText: "...",
            calmethodText: "...",
            intervalText: "...",
            recmethodSelected: false,
            calmethodSelected: false,
            intervalSelected: false,
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
                interval: false,
                interval_1: false,
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
                    if (item !== "Check sheet") {
                        this.checkCondition("upperlimit", document.getElementById('upperlimit').value)
                        this.checkCondition("lowerlimit", document.getElementById('lowerlimit').value)
                        this.checkCondition("unit", document.getElementById('unit').value)
                        this.checkCondition("masterval", document.getElementById('masterval').value)
                        this.checkCondition("meastimes", document.getElementById('meastimes').value)
                        this.checkCondition("meastool", document.getElementById('meastool').value)
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
                })
                break
            case "interval":
                this.setState({
                    intervalText: item,
                    intervalSelected: true
                }, () => {
                    this.checkCondition("interval_2", item)
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
        const interval2 = this.state.intervalText
        const meastool = document.getElementById('meastool').value
        const mcno = document.getElementById('machineno').value
        const read = document.getElementById('readability').value
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
            meastool: meastool,
            mcno: mcno,
            readability: read
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
    }

    toggleEditItem = (item) => {
        //console.log(item)
        var checkFlag = false
        if (item.recmethod === "Check sheet") {
            checkFlag = true
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
                    meastool: item.meastool,
                    machineno: item.mcno,
                    readability: item.readability,
                },
                recmethodText: item.recmethod,
                calmethodText: item.calmethod,
                intervalText: item.interval2,
                recmethodSelected: true,
                calmethodSelected: true,
                intervalSelected: true,
                showChecksheet: checkFlag
            }, () => {
                this.changeRowTextArea(item.parameter)
                this.checkCondition("allfalse")
            })
        })
    }

    UpdateItemno = async () => {
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
        const interval2 = this.state.intervalText
        const meastool = document.getElementById('meastool').value
        const mcno = document.getElementById('machineno').value
        const read = document.getElementById('readability').value
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
            meastool: meastool,
            mcno: mcno,
            readability: read
        })
            .then(res => {
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
            })
            .catch(error => {
                alert(error)
                console.log("update control item in control items error")
            })
    }

    toggleCopyItem = (item) => {
        //console.log(item)
        this.setState({
            isModalAddOpen: !this.state.isModalAddOpen,
            submitType: "copy"
        }, () => {
            this.setState({
                itemid: item.id,
                editItem: {
                    itemno: '',
                    parameter: item.parameter,
                    upperlimit: item.limit.split(";")[0],
                    lowerlimit: item.limit.split(";")[1],
                    unit: item.unit,
                    masterval: item.masterval,
                    meastimes: item.meastimes,
                    interval: item.interval1,
                    meastool: item.meastimes,
                    machineno: item.mcno,
                    readability: item.readability,
                },
                recmethodText: item.recmethod,
                calmethodText: item.calmethod,
                intervalText: item.interval2,
                recmethodSelected: true,
                calmethodSelected: true,
                intervalSelected: true,
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
    }

    EditProcessName = async () => {
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
    }

    showDetailItem = (item) => {
        console.log(item)
    }

    checkCondition = (item, val) => {
        var f1 = false
        var f2 = false
        var f3 = false
        var f3_1 = false
        var f4 = false
        var f5 = false
        var f5_1 = false
        var f5_2 = false
        var f5_3 = false
        var f6 = false
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
            case "meastool":
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
                if (Number.parseInt(val).toString() !== val || val.length === 0 || val.charAt(0) === "-") {
                    f5 = true
                }
                break
            case "interval":
                if (Number.parseInt(val).toString() !== val || val.length === 0 || Number.parseInt(val) > 30 || val.charAt(0) === "-") {
                    f5_1 = true
                }
                if (Number.parseInt(val) < 2 && this.state.recmethodText === "x-R chart") {
                    f5_3 = true
                }
                break
            case "interval_2":
                if (this.state.intervalText === "...") {
                    f5_2 = true
                }
                break
            case "calmethod":
                if (this.state.calmethodText === "...") {
                    f6 = true
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
                break
            case "interval":
                oldcondCheck[item] = f5_1
                oldcondCheck[`${item}_1`] = f5_2
                oldcondCheck[`${item}_2`] = f5_3
                break
            case "calmethod":
                oldcondCheck[item] = f6
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
            //console.log(this.state.condCheck)
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
                    xrItem: item
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
            api.put(`/datarec/${item.id}/update`, {
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
                        showXRList: false
                    })
                })
                .catch(err => {
                    console.log(err)
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
            <div className="CreateForm">
                <h1 className="title">Approve Record Data</h1>
                <div className="app-data-date-group">
                    <Button id="prevRecDate" onClick={() => this.gotoPrevDay()} >
                        <FontAwesomeIcon icon={faAngleLeft} />
                        {this.unControlToolTipPack("prevRecDate", "prev Day")}
                    </Button>
                    <div className="rec-data-datepicker">
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            closeOnScroll={true}
                            selected={this.state.pickedDate}
                            onChange={(date) => this.setDateValue(date)}
                            todayButton="Today"
                        />
                    </div>
                    <Button id="nextRecDate" onClick={() => this.gotoNextDay()} disabled={this.state.disableNextDay}>
                        <FontAwesomeIcon icon={faAngleRight} />
                        {this.unControlToolTipPack("nextRecDate", "next Day")}
                    </Button>
                    <div className="rec-data-shift-btn">
                        <span>Shift : </span>
                        <ButtonGroup>
                            <Button onClick={() => this.selectShift('A')} active={this.state.shift === 'A'}>A</Button>
                            <Button onClick={() => this.selectShift('B')} active={this.state.shift === 'B'}>B</Button>
                        </ButtonGroup>
                    </div>
                </div>
                {this.state.currentViewNo === "" &&
                    <Col sm="12" md={{ size: 10, offset: 1 }}>
                        <div className="regis-head">
                            <div className="regis-table-search ctrl-item-head-part">
                                <p className="search-txt">{'Search Section code'}</p>
                                <InputGroup>
                                    <Input placeholder="Input Section code ..." id="section-search" onChange={(e) => this.SearchBySection(e.target.value)} autoComplete="off" />
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
                                        <th id="col2">Section code</th>
                                        <th id="col3">Line name</th>
                                        <th id="col4">Status</th>
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
                                                        <FontAwesomeIcon id={`viewSection${ind}`} icon={faEye} onClick={() => this.toggleView(item.partno, false)} />
                                                        {this.unControlToolTipPack(`viewSection${ind}`, "View")}
                                                    </td>
                                                    <td>{item.section}</td>
                                                    <td>{item.linename}</td>
                                                    <td>{item.status}</td>
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
                                                    {this.state.processSelected &&
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
                                                <th id="item-col11">Measuring tool</th>
                                                <th id="item-col12">Machine no.</th>
                                                <th id="item-col13">Readability</th>
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
                                                                <FontAwesomeIcon id={`copyEditItem${ind}`} icon={faCopy} onClick={() => this.toggleCopyItem(item)} />
                                                                <FontAwesomeIcon id={`editEditItem${ind}`} icon={faEdit} onClick={() => this.toggleEditItem(item)} />
                                                                <FontAwesomeIcon id={`deleteEditItem${ind}`} icon={faTrash} onClick={() => this.toggleDelete(item.id, "item", item.itemid)} />
                                                                {this.unControlToolTipPack(`copyEditItem${ind}`, "Copy")}
                                                                {this.unControlToolTipPack(`editEditItem${ind}`, "Edit")}
                                                                {this.unControlToolTipPack(`deleteEditItem${ind}`, "Delete")}
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
                                                            { item.limit !== null ?
                                                                <td>{item.limit.split(";")[0]}</td>
                                                                :
                                                                <td>-</td>
                                                            }
                                                            { item.limit !== null ?
                                                                <td>{item.limit.split(";")[1]}</td>
                                                                :
                                                                <td>-</td>
                                                            }
                                                            <td>{item.unit}</td>
                                                            <td>{masval}</td>
                                                            <td>{item.calmethod}</td>
                                                            <td>{item.meastimes}</td>
                                                            <td>{item.interval1}/{item.interval2}</td>
                                                            <td>{item.meastool}</td>
                                                            <td>{item.mcno}</td>
                                                            <td>{item.readability}</td>
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
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null, mapDispatchToProps)(RegisList);