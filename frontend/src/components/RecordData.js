import React, { useEffect } from 'react';
import axios from 'axios';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Table,
    Button,
    Input,
    Pagination,
    PaginationLink,
    PaginationItem,
    InputGroup,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Popover,
    PopoverBody,
    FormGroup,
    UncontrolledTooltip,
} from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import './scss/RecordData.scss';
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'
import PropTypes, { number, objectOf } from 'prop-types'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCalendarAlt,
    faExclamationCircle,
    faBatteryQuarter,
    faBatteryHalf,
    faBatteryThreeQuarters,
    faBatteryEmpty,
    faBatteryFull,
    faQuestionCircle,
    faAngleDoubleRight,
    faAngleLeft,
    faAngleDoubleLeft,
    faAngleRight,
    faChartLine,
    faCarBattery,
    faVrCardboard,
    faCheckCircle,
    faBullseye,
} from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import {
    ScatterChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    Legend,
    Scatter,
    ComposedChart,
    Line,
    LabelList,
    Bar
} from 'recharts'
import { Range, Handle } from 'rc-slider'
import { PacmanLoader } from "react-spinners";
import mqtt from 'mqtt'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
var curEmp = ""
var Empview = false
var Monitorview = false
var Recordview = false
var Editview = false
var cntResults = 0
const showPage = 5
const perPage = 10
var resData1
var resData2
var resData3
var errorC
var errorA
var errorR

var naturalSortSection = function (a, b) {
    return ('' + a.section).localeCompare(('' + b.section), 'en', { numeric: true });
}

var naturalSortPartno = function (a, b) {
    return ('' + a.partno).localeCompare(('' + b.partno), 'en', { numeric: true });
}

var naturalSortProcess = function (a, b) {
    return ('' + a.process).localeCompare(('' + b.process), 'en', { numeric: true });
}

var naturalSortItemno = function (a, b) {
    return ('' + a.itemid).localeCompare(('' + b.itemid), 'en', { numeric: true });
}

var naturalSortEmpName = function (a, b) {
    return ('' + a.empname).localeCompare(('' + b.empname), 'en', { numeric: true });
}

var naturalSortApprove = function (a, b) {
    if (a.section != b.section)
        return ('' + a.section).localeCompare(('' + b.section), 'en', { numeric: true })
    else if (a.partno != b.partno)
        return ('' + a.partno).localeCompare(('' + b.partno), 'en', { numeric: true })
    else if (a.process != b.process)
        return ('' + a.process).localeCompare(('' + b.process), 'en', { numeric: true })
    else if (a.ym != b.ym)
        return ('' + a.ym).localeCompare(('' + b.ym), 'en', { numeric: true })
    else if (a.shift != b.shift)
        return ('' + a.shift).localeCompare(('' + b.shift), 'en', { numeric: true })
    return ('' + a.status).localeCompare(('' + b.status), 'en', { numeric: true })
}

class CustomEditor extends React.Component {
    static propTypes = {
        onUpdate: PropTypes.func.isRequired
    }

    static defaultProps = {
        value: 0
    }

    componentDidMount() {
        console.log(this.props)
        if (this.props.interval.includes("When change")) {
            document.getElementById(`spanwc_${this.props.rowi}-${this.props.coli - 10}`).select()
        } else {
            document.getElementById(`span${this.props.rowi}-${this.props.coli - 10}`).select()
        }
    }

    getValue(flag, typeInput, e) {
        //console.log("get value")
        var val = 0
        const mode = this.props.calmethod
        const masterval = Number(this.props.masterval)
        if (flag) { //check sheet
            //console.log(document.getElementById(`input`).checked)
            const res = e.target.checked
            if (res) {
                val = "O"
            } else {
                val = ""
            }
        } else { //record sheet text
            const inputTxt = e.target.value
            if (typeInput === "TextArea") {
                const inputLen = inputTxt.split("\n").length
                if (inputTxt === "") {
                    this.setState({
                        selectedRow: []
                    })
                    return this.props.value
                }
                if (inputLen !== this.props.meastimes) {
                    alert("input data not match with Measuring Times")
                    return this.props.value
                }
                var nanFlag = false
                //console.log(mode)
                if (mode === "Average") {
                    for (var k = 1; k <= inputLen; k++) {
                        if (isNaN(inputTxt.split("\n")[k - 1])) {
                            nanFlag = true
                        }
                        val += Number.parseFloat(inputTxt.split("\n")[k - 1]) + masterval
                    }
                    val = val / inputLen
                } else if (mode === "Max only") {
                    var maxval = ""
                    for (k = 1; k <= inputLen; k++) {
                        if (isNaN(inputTxt.split("\n")[k - 1])) {
                            nanFlag = true
                        }
                        const curVal = Number.parseFloat(inputTxt.split("\n")[k - 1]) + masterval
                        if (curVal > maxval) {
                            maxval = curVal
                        } else if (maxval === "") {
                            maxval = curVal
                        }
                    }
                    val = maxval
                } else if (mode === "Min only") {
                    var minval = ""
                    for (k = 1; k <= inputLen; k++) {
                        if (isNaN(inputTxt.split("\n")[k - 1])) {
                            nanFlag = true
                        }
                        const curVal = Number.parseFloat(inputTxt.split("\n")[k - 1]) + masterval
                        if (curVal < minval) {
                            minval = curVal
                        } else if (minval === "") {
                            minval = curVal
                        }
                    }
                    val = minval
                } else if (mode === "None") {
                    val = Number.parseFloat(inputTxt) + masterval
                } else if (mode === "Max-Min") {
                    var maxval = ""
                    var minval = ""
                    for (k = 1; k <= inputLen; k++) {
                        if (isNaN(inputTxt.split("\n")[k - 1])) {
                            nanFlag = true
                        }
                        const curVal = Number.parseFloat(inputTxt.split("\n")[k - 1]) + masterval
                        if (curVal < minval) {
                            minval = curVal
                        } else if (minval === "") {
                            minval = curVal
                        }
                        if (curVal > maxval) {
                            maxval = curVal
                        } else if (minval === "") {
                            maxval = curVal
                        }
                    }
                    val = maxval - minval
                } else if (mode === "Max & Min") {
                    var maxval = ""
                    var minval = ""
                    for (k = 1; k <= inputLen; k++) {
                        if (isNaN(inputTxt.split("\n")[k - 1])) {
                            nanFlag = true
                        }
                        const curVal = Number.parseFloat(inputTxt.split("\n")[k - 1]) + masterval
                        if (curVal < minval) {
                            minval = curVal
                        } else if (minval === "") {
                            minval = curVal
                        }
                        if (curVal > maxval) {
                            maxval = curVal
                        } else if (minval === "") {
                            maxval = curVal
                        }
                    }
                    maxval = maxval.toFixed(this.props.readability)
                    minval = minval.toFixed(this.props.readability)
                    val = `${maxval}\n${minval}`
                }
                if (mode !== "Max & Min") {
                    val = val.toFixed(this.props.readability)
                }
                if ((isNaN(val) || nanFlag) && mode !== "Max & Min") {
                    alert("input data have some error")
                    val = this.props.value
                }
            } else if (typeInput === "Text") {
                val = Number.parseFloat(inputTxt) + masterval
                val = val.toFixed(this.props.readability)
                if (isNaN(val)) {
                    alert("input data have some error")
                    val = this.props.value
                }
            } else {
                alert("Get value method type mismatch")
                val = ""
            }
        }
        return val
    }

    checkKeyText = (e, onUpdate, value) => {
        if (e.key === "Escape") {
            onUpdate(value)
        } else if (e.key === "Enter") {
            onUpdate(this.getValue(false, "Text", e))
        } else if (e.key === "Delete") {
            onUpdate(" ")
        }
    }

    checkKeyTextArea = (e, onUpdate, value) => {
        if (e.key === "Enter") {
            const len = e.currentTarget.value.split("\n").length
            //console.log(len)
            if (len === this.props.meastimes && e.currentTarget.value.split("\n")[len - 1] !== "") {
                onUpdate(this.getValue(false, "TextArea", e))
            }
        } else if (e.key === "Escape") {
            onUpdate(value)
        } else if (e.key === "Delete") { //clear
            onUpdate(" ")
        }
    }

    textAreaChange = (e) => {
        //console.log("on change")
        //console.log(e.currentTarget.value)
        //console.log(e.currentTarget.value.split('\n').length)
        const len = e.currentTarget.value.split('\n').length
        if (e.currentTarget.value === '\n') {
            //console.log("empty")
            e.target.value = ""
        }
        if (len >= 2) {
            //console.log(len)
            //console.log(e.currentTarget.value.split('\n'))
            if (e.currentTarget.value.split('\n')[len - 2] === "") {
                var targetVal = ""
                for (var x = 0; x <= len - 3; x++) {
                    targetVal += e.currentTarget.value.split('\n')[x] + '\n'
                }
                e.target.value = targetVal
            }
        }
    }

    checkboxChange = (e, onUpdate) => {
        onUpdate(this.getValue(true, "CheckBox", e))
    }

    checkKeyCheckBox = (e, onUpdate, beforeFlag) => {
        if (e.key === "o") {
            e.target.checked = true
        } else if (e.key === "Enter") {
            onUpdate(this.getValue(true, "CheckBox", e))
        } else if (e.key === "x") {
            e.target.checked = false
        } else if (e.key === "Escape") {
            onUpdate(beforeFlag)
        }
    }

    onBlurEvent = (e) => {
        //console.log("on blur")
    }

    render() {
        const { value, onUpdate, ...rest } = this.props
        var arrInput = []
        if (this.props.recordmethod === "Check sheet") {
            var valFlag = false
            if (value === "O") {
                valFlag = true
            }
            arrInput = [
                <Input
                    {...rest}
                    key={`input`}
                    id={this.props.interval.includes("When change") ?
                        `spanwc_${this.props.rowi}-${this.props.coli - 10}`
                        :
                        `span${this.props.rowi}-${this.props.coli - 10}`
                    }
                    ref={node => this.input = node}
                    addon
                    type="checkbox"
                    defaultChecked={valFlag}
                    onChange={e => this.checkboxChange(e, onUpdate)}
                    className="rec-data-input-check"
                    onKeyDown={e => this.checkKeyCheckBox(e, onUpdate, value)}
                />
            ]
        } else {
            if (this.props.meastimes > 1) {
                //console.log("render")
                arrInput = [
                    <Input
                        {...rest}
                        key={`input`}
                        id={this.props.interval.includes("When change") ?
                            `spanwc_${this.props.rowi}-${this.props.coli - 10}`
                            :
                            `span${this.props.rowi}-${this.props.coli - 10}`
                        }
                        ref={node => this.input = node}
                        type="textarea"
                        onKeyDown={e => this.checkKeyTextArea(e, onUpdate, value)}
                        autoComplete="off"
                        className="rec-data-input-textarea"
                        rows={this.props.meastimes}
                        onChange={e => this.textAreaChange(e)}
                    />
                ]
            } else {
                arrInput = [
                    <Input
                        {...rest}
                        key={`input`}
                        id={this.props.interval.includes("When change") ?
                            `spanwc_${this.props.rowi}-${this.props.coli - 10}`
                            :
                            `span${this.props.rowi}-${this.props.coli - 10}`
                        }
                        ref={node => this.input = node}
                        tpye="text"
                        onKeyDown={e => this.checkKeyText(e, onUpdate, value)}
                        autoComplete="off"
                        className="rec-data-input-text"
                    />
                ]
            }
        }
        return arrInput
    }
}


class RegisList extends React.Component {
    state = {
        isLoading: false,
        sectionDistinct: [],
        filteredSectionDistinct: [],
        sectionDistinctView: false,
        lists: [],
        pageActive: 1,
        pageAmount: 0,
        pageShow: [],
        filteredLists: [],
        currentViewNo: "",
        timeLastUpdate: "",
        timeDataUpdate: [],
        recordTableData: [],
        recordTableDataFiltered: [],
        recordTableWhenchangeData: [],
        recordTableWhenchangeDataFiltered: [],
        tableDataChange: false,
        processSelected: false,
        processSelectedIndex: 0,
        processLists: [],
        processText: "Select process ...",
        tableView: false,
        itemLists: [],
        maxInterval: 0,
        whenchangemaxInterval: 0,
        selectedRow: [],
        whenchangeselectedRow: [],
        inputMsg: {},
        pickedDate: new Date(),
        todayD: moment().format('D'),
        disableNextDay: true,
        getTableData: [],
        getarrData: {},
        getarrData2: {},
        getarrMsg: {},
        getarrProgress: {},
        currentRow: "",
        currentCol: "",
        currentRowwhenchange: "",
        currentColwhenchange: "",
        nonEditCell: [],
        whenchangenonEditCell: [],
        savingStatus: false,
        popOverTarget: 'span2-1',
        renderPop: false,
        textPopOver: "",
        countRecordAll: 0,
        countRecorded: 0,
        countRecordedMonthAllProc: 0,
        countRecordAllMonthAllProc: 0,
        ngDataProcess: {},
        progDayAllProc: {},
        calendarShow: false,
        styledProgressCalendar: '',
        shift: 'A',
        typeFilter: "All",
        typeFilterOpen: false,
        graphDataShow: false,
        graphData: [],
        graphItem: "",
        graphParam: "",
        xSliderValue: [1, 31],
        xTicks: [],
        ySliderValue: [],
        yTicks: [],
        maxY: 0,
        minY: 0,
        graphRData: [],
        yRSliderValue: [],
        yRTicks: [],
        maxR: 0,
        workAmount: { A: [], B: [] },
        calendarAmountShow: false,
        tableAmountData: [],
        graphAmount: [],
        centerData: [],
        showCircle: true,
        pureGraphData: [],
        circleGraphData: [],
        centerDataFlag: {},
        //approve
        approveView: false,
        approvePartView: false,
        approveDataView: false,
        approveDataYM: "",
        approveDataShift: "",
        approveProcess: "",
        approveLists: [],
        filteredApproveLists: [],
        approverPos: 0,
        approveGraphList: [],
        approveItemId: "",
        approveDataProcess: {},
        approveDateProcess: {},
        approveEmpProcess: {},
        approveNameProcess: {},
        approveData: [],
        approveDate: [],
        approveEmp: [],
        approveName: [],
        statusSearchTxt: "All status",
        statusSearchCode: "",
        statusSearchOpen: false,
        processChecker: "",
        TLupList: [],
        AMupList: [],
        AGMupList: [],
        EmpLists: {},
        TLupId: "",
        TLupName: "...",
        TLupPos: "",
        AMupId: "",
        AMupName: "...",
        AMupPos: "",
        AGMupId: "",
        AGMupName: "...",
        AGMupPos: "",
        normalStatus: 0,
        queueUpdate: [],
        editInchargeFlag: false,
        checkedCount: 0,
        normalCheckStatusMsg: "",
        normalApproveStatusMsg: "",
        commentCheck: "",
        commentApprove: "",
        approveQueue: {},
        approveQueueId: "",
        rejectCheckMonthlyFlag: false,
        rejectApproveMonthlyFlag: false,
    }

    constructor(props) {
        super(props);
        curSection = localStorage.getItem('username')
        //curSection = "1007349"
    }

    componentDidMount() {
        /*var inixTicks = []
        for (var i = 1; i <= 31; i++) {
            inixTicks.push(i)
        }*/
        this.setState({
            currentViewNo: "",
            //xTicks: inixTicks
        })
        if (curSection.includes("-E")) {
            Editview = true
            Recordview = false
        } else {
            Editview = false
            Recordview = true
        }
        if (curSection.substring(0, 3) === "100" && curSection.length === 7) {
            curEmp = curSection
            Empview = true
            console.log(curEmp)
            this.getSection();
        } else if (curSection === "monitor") {
            Monitorview = true
            this.getSectionDistinct();
        } else {
            curEmp = ""
            Empview = false
            Monitorview = false
            this.getList();
        }
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getSection = () => { //for approve
        this.setState({
            isLoading: true
        }, () => {
            const ym = moment(this.state.pickedDate).format('YYYY-MM')
            api.get(`/datarec/approver/${curEmp}`)
                .then(res => {
                    console.log(res.data)
                    this.setState({
                        approveView: true
                    }, () => {
                        if (res.data.length > 0) {
                            var pos = res.data[0]['position']
                            var posLevel = 0
                            var key = ""
                            var shift = "no"
                            if (pos === "LLa") {
                                key = "lla"
                                shift = "A"
                                posLevel = 1
                            } else if (pos === "LLb") {
                                key = "llb"
                                shift = "B"
                                posLevel = 1
                            } else if (pos === "TL") {
                                key = "tl"
                                posLevel = 2
                            } else if (pos === "AM" || pos === "MGR") {
                                key = "am"
                                posLevel = 3
                            } else if (pos === "AGM" || pos === "GM") {
                                key = "agm"
                                posLevel = 4
                            } else {
                                alert("position is invalid")
                                return
                            }
                            console.log("poslevel : " + posLevel)
                            api.get(`/datarec/approve/list/`)
                                .then(lists => {
                                    var arrSect = []
                                    var arrName = []
                                    lists.data.forEach(list => {
                                        if (list[key].includes(curEmp)) {
                                            arrSect.push(list['section'])
                                            arrName.push(list['linename'])
                                        }
                                    })
                                    console.log(arrSect)
                                    console.log(ym)
                                    console.log(shift)
                                    api.get(`/datarec/appqueue/itemlist/empidcontains_${curEmp}`)
                                        .then(res => {
                                            console.log(res.data)
                                            const dataLen = res.data.length
                                            var dataLenID = 1
                                            var dataLenFin = true
                                            var arrList = []
                                            res.data.forEach(qres => {
                                                api.get(`/datarec/dataapprove/${qres.recordid}_${shift}`)
                                                    .then(appLists => {
                                                        console.log(appLists.data)
                                                        appLists.data.forEach(applist => {
                                                            if (arrSect.includes(applist['section'])) {
                                                                arrList.push({
                                                                    section: applist['section'],
                                                                    name: arrName[arrSect.indexOf(applist['section'])],
                                                                    partno: applist['partno'],
                                                                    process: applist['process'],
                                                                    ym: applist['ym'],
                                                                    shift: applist['shift'],
                                                                    d1: applist['d1'],
                                                                    d2: applist['d2'],
                                                                    status: qres.status
                                                                })
                                                            }
                                                        })
                                                        arrList.sort(naturalSortApprove)
                                                        console.log(arrList)
                                                        console.log(dataLen)
                                                        console.log(dataLenID)
                                                        if (dataLenID === dataLen) {
                                                            dataLenFin = false
                                                        } else {
                                                            dataLenID++
                                                        }
                                                        this.setState({
                                                            approveLists: arrList,
                                                            filteredApproveLists: arrList,
                                                            approverPos: posLevel,
                                                            isLoading: dataLenFin
                                                        })
                                                    })
                                                    .catch(err => {
                                                        alert("get item apprv in getSection error")
                                                        console.log(err)
                                                    })
                                            })
                                        })
                                        .catch(err => {
                                            alert("get approve queue data error")
                                            console.log(err.response.data)
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
                })
                .catch(error => alert(error))
        })
    }

    getSectionDistinct = async () => {
        await api.get(`/controlitems/sectionDist/`)
            .then(result => {
                var arrResult = result.data
                arrResult.sort(naturalSortSection)
                console.log(arrResult)
                this.setState({
                    sectionDistinct: arrResult,
                    filteredSectionDistinct: arrResult
                });
            })
            .catch(error => alert(error))
    }

    toggleMonitorSectionView = (section) => {
        curSection = section
        Empview = true
        this.setState({
            sectionDistinctView: true
        }, () => {
            this.getList()
        })
    }

    getList = async () => { //get part no
        this.setState({
            isLoading: true
        }, async () => {
            await api.get(`/partno/${curSection}`)
                .then(result => {
                    var arrResult = result.data
                    arrResult.sort(naturalSortPartno)
                    this.getApproverList()
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

    getApproverList = () => {
        this.setState({
            isLoading: true
        }, () => {
            api.get(`/datarec/approver/list/`)
                .then(res => {
                    console.log(res.data)
                    var arrTLup = []
                    var arrAMup = []
                    var arrAGMup = []
                    var EmpLists = {}
                    res.data.forEach(list => {
                        const pos = list['position']
                        //get TL list
                        if (pos === "TL" || pos === "AM" || pos === "MGR" || pos === "AGM" || pos === "GM") {
                            arrTLup.push(list)
                        }
                        if (pos === "AM" || pos === "MGR" || pos === "AGM" || pos === "GM") {
                            arrAMup.push(list)
                        }
                        if (pos === "AGM" || pos === "GM") {
                            arrAGMup.push(list)
                        }
                        EmpLists = { ...EmpLists, [list['empid']]: list }
                    })
                    arrTLup.sort(naturalSortEmpName)
                    arrAMup.sort(naturalSortEmpName)
                    arrAGMup.sort(naturalSortEmpName)
                    this.setState({
                        TLupList: arrTLup,
                        AMupList: arrAMup,
                        AGMupList: arrAGMup,
                        EmpLists: EmpLists,
                        isLoading: false
                    }, () => {
                        this.createPagination()
                    });
                    //console.log(result.data);
                })
        })
    }

    createPagination = () => {
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
        if (pg >= 1 && pg <= this.state.pageAmount) {
            this.setState({
                pageActive: pg
            })
        }
        //console.log(this.state.pageAmount)
        var arrpageShow = this.state.pageShow
        //console.log(arrpageShow[0])
        if (pg === 1) {
            arrpageShow = []
            for (var i = 1; i <= showPage; i++) {
                if (i <= this.state.pageAmount) {
                    arrpageShow = [...arrpageShow, i]
                }
            }
        } else if (pg === this.state.pageAmount) {
            arrpageShow = []
            for (var j = 1; j <= showPage; j++) {
                if (this.state.pageAmount - showPage + j > 0) {
                    arrpageShow = [...arrpageShow, this.state.pageAmount - showPage + j]
                }
            }
        }
        if (pg === arrpageShow[arrpageShow.length - 1] && pg < this.state.pageAmount && pg > arrpageShow[0]) {
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

    SearchByPartno = (partno) => {
        //const partno = document.getElementById('part-search').value
        var filtered = []
        //console.log(this.state.lists)
        this.state.lists.forEach((item) => {
            if (item.partno.includes(partno)) {
                filtered = [...filtered, item]
            }
        })
        //console.log(filtered)
        this.setState({
            filteredLists: filtered,
        }, () => {
            this.createPagination()
        })
    }

    toggleView = (partno) => { //select part no in table
        this.setState({
            currentViewNo: partno,
            itemLists: [],
            maxInterval: 0,
            whenchangemaxInterval: 0,
            processSelected: false,
        }, () => {
            this.getProcessLists(partno)
        })
    }

    backToPartno = () => {
        if (this.state.tableDataChange) {
            const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
            if (!conf) {
                return
            }
        }
        this.setState({
            currentViewNo: "",
            processText: "Select process ...",
            processLists: [],
            recordTableData: [],
            recordTableDataFiltered: [],
            recordTableWhenchangeData: [],
            recordTableWhenchangeDataFiltered: [],
            tableView: false,
            tableDataChange: false,
            countRecordedDayAllProc: 0,
            countRecordAllDayAllProc: 0,
            countPercentRecordDayAllProc: 0,
            countRecordedMonthAllProc: 0,
            countRecordAllMonthAllProc: 0,
            counPercentRecordMonthAllProc: 0,
        })
    }

    getProcessLists = async (partno) => {
        this.setState({
            isLoading: true
        }, async () => {
            const ym = moment(this.state.pickedDate).format('YYYY-MM')
            const date = moment(this.state.pickedDate).format('D')
            var shift = this.state.shift
            if (Empview && !Monitorview) {
                shift = this.state.approveDataShift
            }
            console.log(shift)
            const dom = moment(this.state.pickedDate).daysInMonth()
            var progDayRecordSum = 0
            var progDayAllSum = 0
            var progMonthRecordSum = 0
            var progMonthAllSum = 0
            var arrProgDayAll = {}
            var arrNgDataProcess = {}
            var arrApproveData = {}
            var arrApproveDate = {}
            var arrApproveEmp = {}
            var arrApproveName = {}
            await api.get(`/controlitems/process/${curSection}_${partno}`)
                .then(result => {
                    var arrResult = result.data
                    arrResult.sort(naturalSortProcess)
                    var dataLen = arrResult.length
                    var dataLenID = 1
                    var dataLenFin = true
                    arrResult.forEach((item, ind) => {
                        var progMonthRecord = 0
                        var progMonthAll = 0
                        var progDayRecord = {}
                        var progDayAll = {}
                        console.log(`${curSection}_${this.state.currentViewNo}_${item.process}_${ym}_${shift}`)
                        api.get(`/datarec/data/${curSection}_${this.state.currentViewNo}_${item.process}_${ym}_${shift}`)
                            .then(res => {
                                res.data.forEach(data => { //loop each item
                                    //console.log(data)
                                    if (data['itemid'] !== "apprv") {
                                        var dataProgress = data.progress
                                        if (dataProgress === "") {
                                            dataProgress = "{}"
                                        }
                                        const prog = JSON.parse(dataProgress)
                                        arrResult[ind] = { ...arrResult[ind], [data.itemid]: prog }
                                        Object.keys(prog).forEach(keys => {
                                            if (prog[keys] !== undefined) {
                                                var curr = progDayRecord[keys]
                                                var currAll = progDayAll[keys]
                                                if (curr === undefined || currAll === undefined) {
                                                    curr = 0
                                                    currAll = 0
                                                }
                                                progDayRecord = { ...progDayRecord, [keys]: curr + prog[keys][0] }
                                                progDayAll = { ...progDayAll, [keys]: currAll + prog[keys][1] }
                                            }
                                        })
                                        if (prog['m'] !== undefined) {
                                            progMonthRecord += prog['m'][0]
                                            progMonthAll += prog['m'][1]
                                        }
                                        var arrNgDataFlag = []
                                        var arrNgData = data.ngdayflag
                                        if (arrNgData !== "") {
                                            arrNgDataFlag = arrNgData.split(";")
                                        }
                                        //console.log(arrNgDataFlag)
                                        //console.log(arrNgDataProcess)
                                        //console.log(arrNgDataProcess[ind])
                                        if (arrNgDataProcess[ind] !== undefined) {
                                            arrNgDataFlag = [...new Set([...arrNgDataProcess[ind], ...arrNgDataFlag])]
                                        }
                                        arrNgDataProcess = { ...arrNgDataProcess, [ind]: arrNgDataFlag }
                                        //console.log(arrNgDataProcess)
                                    } else {
                                        var approveData = data['d1']
                                        approveData = approveData.split(';')
                                        approveData.forEach((item, ind) => {
                                            approveData[ind] = Number(item)
                                        })
                                        var approveDate = data['d2']
                                        approveDate = approveDate.split(';')
                                        var approveEmp = data['d3']
                                        approveEmp = approveEmp.split(';')
                                        var approveName = data['d4']
                                        approveName = approveName.split(';')
                                        arrApproveData = { ...arrApproveData, [ind]: approveData }
                                        arrApproveDate = { ...arrApproveDate, [ind]: approveDate }
                                        arrApproveEmp = { ...arrApproveEmp, [ind]: approveEmp }
                                        arrApproveName = { ...arrApproveName, [ind]: approveName }
                                    }
                                })
                                arrResult[ind] = { ...arrResult[ind], all: [progDayRecord, progDayAll], allMonth: [progMonthRecord, progMonthAll] }
                                if (progDayRecord[date] !== undefined) {
                                    progDayRecordSum += progDayRecord[date]
                                    progDayAllSum += progDayAll[date]
                                }
                                //console.log(progDayRecord)
                                //console.log(progDayAll)
                                Object.keys(progDayRecord).forEach(keys1 => {
                                    var cRecorded = 0
                                    var cRecordAll = 0
                                    if (keys1 !== 'm') {
                                        if (arrProgDayAll[keys1] !== undefined) {
                                            if (arrProgDayAll[keys1][0] !== undefined) {
                                                cRecorded = arrProgDayAll[keys1][0]
                                                cRecordAll = arrProgDayAll[keys1][1]
                                            }
                                        }
                                        cRecorded += progDayRecord[keys1]
                                        cRecordAll += progDayAll[keys1]
                                        arrProgDayAll = { ...arrProgDayAll, [keys1]: [cRecorded, cRecordAll] }
                                    }
                                })
                                progMonthRecordSum += progMonthRecord
                                progMonthAllSum += progMonthAll
                                //console.log(arrResult)
                                //console.log(progMonthRecord)
                                //console.log(progMonthAll)
                                //console.log(arrProgDayAll)
                                var percentDay = Number.parseFloat(progDayRecordSum / progDayAllSum * 100).toFixed(2)
                                var percentMonth = Number.parseFloat(progMonthRecordSum / progMonthAllSum * 100).toFixed(2)
                                if (isNaN(percentDay)) {
                                    percentDay = 0
                                }
                                if (isNaN(percentMonth)) {
                                    percentMonth = 0
                                }
                                if (dataLenID === dataLen) {
                                    dataLenFin = false
                                }
                                this.setState({
                                    processLists: arrResult,
                                    countRecordedDayAllProc: progDayRecordSum,
                                    countRecordAllDayAllProc: progDayAllSum,
                                    countPercentRecordDayAllProc: percentDay,
                                    countRecordedMonthAllProc: progMonthRecordSum,
                                    countRecordAllMonthAllProc: progMonthAllSum,
                                    counPercentRecordMonthAllProc: percentMonth,
                                    progDayAllProc: arrProgDayAll,
                                    ngDataProcess: arrNgDataProcess,
                                    dayOfMonth: dom,
                                    approveDataProcess: arrApproveData,
                                    approveDateProcess: arrApproveDate,
                                    approveEmpProcess: arrApproveEmp,
                                    approveNameProcess: arrApproveName,
                                    isLoading: dataLenFin,
                                }, () => {
                                    //console.log(this.state.processLists)
                                    dataLenID++
                                });
                                //console.log(result.data);
                            })
                            .catch(err => {
                                alert("get data record error")
                                console.log(err)
                            })
                    })
                })
                .catch(error => {
                    alert("get process list error")
                    console.log(error)
                })
            this.getWorkAmount(ym, shift)
        })
    }

    getWorkAmount = async (ym, shift) => {
        this.setState({
            isLoading: true
        }, async () => {
            //console.log("get work amount")
            await api.get(`/datarec/data/${curSection}_${this.state.currentViewNo}_amount_${ym}_no`)
                .then(res1 => {
                    //console.log(res1.data)
                    if (res1.data.length > 0) {
                        const date = moment(this.state.pickedDate).format('D')
                        var arrAmount = { A: [], B: [] }
                        res1.data.forEach(item => {
                            arrAmount = { ...arrAmount, [item.shift]: item.progress.split(";") }
                        })
                        //console.log(arrAmount)
                        if (document.getElementById('workamount') !== null) {
                            if (arrAmount[shift] !== undefined) {
                                if (arrAmount[shift][date - 1] !== undefined) {
                                    document.getElementById('workamount').value = arrAmount[shift][date - 1]
                                } else {
                                    document.getElementById('workamount').value = ""
                                }
                            }
                        }
                        this.setState({
                            workAmount: arrAmount,
                            isLoading: false
                        })
                    }
                })
        })
    }

    toggleTableView = (proc, ind) => { //select process at table
        if (this.state.tableDataChange) {
            const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
            if (!conf) {
                return
            }
        }
        const ym = moment(this.state.pickedDate).format('YYYY-MM')
        const shift = this.state.shift
        this.setState({
            tableView: true,
            tableDataChange: false
        }, () => {
            this.getWorkAmount(ym, shift)
            this.processSelect(proc, ind)
        })
    }

    toggleDataView = (proc, ind) => { //select process for approve
        this.setState({
            approveDataView: true,
        }, () => {
            //this.getWorkAmount(ym, shift)
            //this.processSelect(proc, ind)
            this.approveProcessSelect(proc, ind)
        })
    }

    backToProcess = () => {
        if (this.state.tableDataChange) {
            const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
            if (!conf) {
                return
            }
        }
        this.setState({
            processText: "Select process ...",
            processSelected: false,
            recordTableData: [],
            recordTableDataFiltered: [],
            recordTableWhenchangeData: [],
            recordTableWhenchangeDataFiltered: [],
            tableView: false,
            tableDataChange: false,
            approveData: [],
            approveDate: []
        }, () => {
            this.getProcessLists(this.state.currentViewNo)
        })
    }

    backToProcessView = () => {
        this.setState({
            approveDataView: false,
            processSelected: false
        })
    }

    toggleDropDown = (item) => {
        var key = ""
        if (item === "process") {
            key = "processOpen"
        } else if (item === "typefilter") {
            key = "typeFilterOpen"
        } else if (item === "checker list") {
            key = "checkerListOpen"
        } else if (item === "approver list") {
            key = "approverListOpen"
        } else if (item === "status search") {
            key = "statusSearchOpen"
        }
        if (key !== "") {
            this.setState({
                [key]: !this.state[key]
            })
        }
    }

    setDateValue = (date, recheck) => {
        if (!recheck) {
            if (this.state.tableDataChange) {
                const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
                if (!conf) {
                    return
                }
            }
        }
        //console.log(date)
        var sameYM = false
        const today = new Date()
        var disableNext = false
        if (moment(today).format('YYYY-MM-DD') >= moment(date).format('YYYY-MM-DD')) {
            if (moment(today).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')) {
                disableNext = true
            }
            if (moment(date).format('YYYY-MM') === moment(this.state.pickedDate).format('YYYY-MM')) {
                sameYM = true
            }
            this.setState({
                pickedDate: date,
                tableDataChange: false,
                disableNextDay: disableNext,
                todayD: Number(moment(date).format('D'))
            }, () => {
                const ym = moment(date).format('YYYY-MM')
                const day = moment(date).format('D')
                if (Monitorview) {
                    //this.selectSectionApprove(curSection, this.state.currentViewNo, this.state.shift, ym)
                    //this.toggleDataView(this.state.processText, this.state.processSelectedIndex)
                    this.toggleView(this.state.currentViewNo)
                    this.approveProcessSelect(this.state.processText, this.state.processSelectedIndex)
                } else {
                    this.getProcessLists(this.state.currentViewNo)
                    this.getControlItemData(this.state.processText, this.state.processSelectedIndex, ym, day, sameYM, this.state.shift)
                }
            })
        } else {//select over today
            alert("please select date not more than today")
        }
    }

    gotoPrevDay = () => {
        const curDate = this.state.pickedDate
        const targetDate = new Date(moment(curDate).subtract(1, 'days'))
        //console.log(curDate)
        //console.log(targetDate)
        this.setDateValue(targetDate)
    }

    gotoNextDay = () => {
        const curDate = this.state.pickedDate
        const targetDate = new Date(moment(curDate).add(1, 'days'))
        //console.log(curDate)
        //console.log(targetDate)
        this.setDateValue(targetDate)
    }

    processSelect = (proc, ind) => {
        //console.log(proc)
        //console.log(ind)
        const ym = moment(this.state.pickedDate).format('YYYY-MM')
        const date = moment(this.state.pickedDate).format('D')
        const shift = this.state.shift
        var sameProc = false
        if (this.state.processText === proc) {
            sameProc = true
        }
        this.setState({
            processText: proc,
            processSelected: true,
            processSelectedIndex: ind,
            inputMsg: {},
            tableDataChange: false,
        }, async () => {
            if (this.state.pickedDate !== "") {
                this.getControlItemData(proc, ind, ym, date, sameProc, shift)
            }
        })
    }

    approveProcessSelect = (proc, ind) => {
        this.setState({
            isLoading: true
        }, () => {
            var ym = this.state.approveDataYM
            if (Monitorview) {
                ym = moment(this.state.pickedDate).format('YYYY-MM')
            }
            const day = moment(ym, 'YYYY-MM').daysInMonth()
            var shift = this.state.approveDataShift
            if (Monitorview) {
                shift = this.state.shift
            }
            var graphList = []
            this.setState({
                processText: proc,
                processSelected: true,
                processSelectedIndex: ind,
                inputMsg: {},
                tableDataChange: false,
                approveGraphList: []
            }, async () => {
                /*if (this.state.pickedDate !== "") {
                    this.getControlItemData(proc, ind, ym, date, sameProc, shift)
                }*/
                var approveData = []
                var approveDate = []
                var approveEmp = []
                var approveName = []
                var approveQueue = []
                var controlItemList = {}
                var apprvId = ""
                var timeUpdate = []
                var lastUpdate = ""
                this.checkNextPrevProcess()
                await api.get(`/controlitems/items/${curSection}_${this.state.currentViewNo}_${proc}`)
                    .then(result => {
                        var arrResult = result.data
                        arrResult.sort(naturalSortItemno)
                        this.setState({
                            itemLists: arrResult,
                            shiftChange: false,
                        }, () => {
                            //this.createPagination()
                            //console.log(arrResult)
                            var tableData = []
                            var maxinter = 0
                            var whenchangemaxinter = 0
                            arrResult.forEach((res, ind) => {
                                var read = 0
                                if (res.readability !== null) {
                                    read = res.readability.length - res.readability.indexOf(".") - 1
                                }
                                var addTableData = {
                                    index: ind,
                                    len: arrResult.length,
                                    id: res.id,
                                    itemid: res.itemid,
                                    parameter: res.parameter,
                                    upperlimit: res.limit.split(";")[0],
                                    lowerlimit: res.limit.split(";")[1],
                                    interval: `${res.interval1}/${res.interval2}`,
                                    intervalcount: res.interval1,
                                    interval_n: res.interval_n,
                                    interval_wc: res.interval_wc,
                                    masterval: Number(res.masterval).toFixed(read),
                                    calmethod: res.calmethod,
                                    tool: res.meastool,
                                    method: res.recmethod,
                                    meastimes: res.meastimes,
                                    read: read,
                                    unit: res.unit,
                                }
                                controlItemList = { ...controlItemList, [res.itemid]: addTableData }
                                console.log(controlItemList)
                                /*for (var x = 1; x <= res.interval1; x++) {
                                    addTableData = { ...addTableData, [`data${x}`]: "" }
                                }
                                tableData = [...tableData, addTableData]
                                if (res.interval1 > maxinter) {
                                    maxinter = res.interval1
                                }*/
                            })
                            var arrData = {}
                            var arrData2 = {}
                            var arrMsg = {}
                            var arrProgress = {}
                            var arrNgDataItem = {}
                            //get data record
                            console.log(`${curSection}_${this.state.currentViewNo}_${proc}_${ym}_${shift}`)
                            api.get(`/datarec/data/${curSection}_${this.state.currentViewNo}_${proc}_${ym}_${shift}`)
                                .then(result => {
                                    result.data.forEach(dat => {
                                        console.log(dat.update)
                                        if (dat['itemid'] !== "apprv") {
                                            timeUpdate = dat.update.split(";")
                                            arrData = {
                                                ...arrData,
                                                [dat.itemid]: {
                                                    "id": dat.id,
                                                    1: dat.d1,
                                                    2: dat.d2,
                                                    3: dat.d3,
                                                    4: dat.d4
                                                }
                                            }
                                            arrData2 = {
                                                ...arrData2,
                                                [dat.itemid]: {
                                                    "id": dat.id,
                                                    1: dat.dm1,
                                                    2: dat.dm2,
                                                    3: dat.dm3,
                                                    4: dat.dm4
                                                }
                                            }
                                            arrMsg = {
                                                ...arrMsg,
                                                [dat.itemid]: {
                                                    "id": dat.id,
                                                    1: dat.msg1,
                                                    2: dat.msg2,
                                                    3: dat.msg3,
                                                    4: dat.msg4
                                                }
                                            }
                                            var prog = "{}"
                                            if (dat.progress !== "") {
                                                prog = dat.progress
                                            }
                                            arrProgress = {
                                                ...arrProgress,
                                                [dat.itemid]: prog
                                            }
                                            var ngFlag = []
                                            if (dat.ngdayflag !== "") {
                                                ngFlag = dat.ngdayflag.split(";")
                                            }
                                            arrNgDataItem = { ...arrNgDataItem, [dat.itemid]: ngFlag }
                                        } else {
                                            approveData = dat['d1']
                                            approveData = approveData.split(';')
                                            approveData.forEach((item, ind) => {
                                                approveData[ind] = Number(item)
                                            })
                                            approveDate = dat['d2']
                                            approveDate = approveDate.split(';')
                                            approveEmp = dat['d3']
                                            approveEmp = approveEmp.split(';')
                                            approveName = dat['d4']
                                            approveName = approveName.split(';')
                                            apprvId = dat['id']
                                        }
                                    })
                                    console.log(arrData)
                                    console.log(arrData2)
                                    console.log(arrMsg)
                                    console.log(arrProgress)
                                    console.log(apprvId)
                                    //get progress monthly
                                    var arrProgressGet = {}
                                    var proGress = {}
                                    var countAll = 0
                                    var countRecord = 0
                                    Object.keys(arrProgress).forEach(ke => {
                                        console.log(arrProgress[ke])
                                        proGress = JSON.parse(arrProgress[ke])
                                        console.log(proGress)
                                        arrProgressGet = { ...arrProgressGet, [ke]: proGress['m'] }
                                        if (proGress['m'] !== undefined) {
                                            countAll += proGress['m'][1]
                                            countRecord += proGress['m'][0]
                                        }
                                    })
                                    console.log(arrProgressGet)
                                    this.getApproveQueue(apprvId)
                                    //get data of xr chart ucl,lcl of prev month
                                    const prevym = moment(ym + '1', 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM')
                                    console.log(prevym)
                                    var xrLimitData = {}
                                    console.log(`${curSection}_${this.state.currentViewNo}_${proc}_${prevym}_${shift}`)
                                    api.get(`/datarec/xronlydata/${curSection}_${this.state.currentViewNo}_${proc}_${prevym}_${shift}`)
                                        .then(dat => {
                                            console.log(dat.data)
                                            const xrData = dat.data
                                            xrData.forEach(list => {
                                                var ucl = 0
                                                var lcl = 0
                                                var rcl = 0
                                                var xbar = 0
                                                var rbar = 0
                                                var cpk = 0
                                                if (list.force) {
                                                    ucl = list['fcl'].split(";")[0]
                                                    lcl = list['fcl'].split(";")[1]
                                                    rcl = list['fcl'].split(";")[2]
                                                    xbar = list['fxbar'].split(";")[0]
                                                    rbar = list['fxbar'].split(";")[1]
                                                    cpk = list['fxbar'].split(";")[2]
                                                } else {
                                                    ucl = list['cl'].split(";")[0]
                                                    lcl = list['cl'].split(";")[1]
                                                    rcl = list['cl'].split(";")[2]
                                                    xbar = list['xbar'].split(";")[0]
                                                    rbar = list['xbar'].split(";")[1]
                                                    cpk = list['xbar'].split(";")[2]
                                                }
                                                xrLimitData = {
                                                    ...xrLimitData,
                                                    [list.itemid]: {
                                                        ucl: ucl,
                                                        lcl: lcl,
                                                        rcl: rcl,
                                                        xbar: xbar,
                                                        rbar: rbar,
                                                        cpk: cpk
                                                    }
                                                }
                                            })
                                            console.log(xrLimitData)
                                            //console.log(tableData)
                                            //console.log(arrProgress)
                                            //set all graph data
                                            Object.keys(controlItemList).forEach(keyitem => {
                                                const ctrlItem = controlItemList[keyitem]
                                                console.log(ctrlItem)
                                                const intervalPitch = 1 / (ctrlItem['intervalcount'] * ctrlItem['interval_n'])
                                                var upperG = Number(ctrlItem['upperlimit'])
                                                var lowerG = Number(ctrlItem['lowerlimit'])
                                                var graphData = []
                                                var graphRData = []
                                                var fingraphRData = []
                                                var arrD = {}
                                                var checkData = []
                                                if (ctrlItem['method'] === "Check sheet") {
                                                    const checkcolumns = [{
                                                        dataField: 'list',
                                                        text: 'Date',
                                                        headerClasses: 'rec-header-check-date',
                                                        classes: 'rec-cell-check',
                                                        style: {
                                                            fontWeight: 'bold'
                                                        }
                                                    }]
                                                    for (var j = 1; j <= day; j++) {
                                                        checkcolumns.push({
                                                            dataField: j.toString(),
                                                            text: j.toString(),
                                                            headerClasses: 'rec-header-check',
                                                            classes: 'rec-cell-check',
                                                            formatter: (cell, row, rowIndex) => {
                                                                if (cell === "O") {
                                                                    return (
                                                                        <p className="rec-cell-check-o">{cell}</p>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <p className="rec-cell-check-x">{cell}</p>
                                                                    )
                                                                }
                                                            },
                                                        })
                                                    }
                                                    for (var j1 = 1; j1 <= (ctrlItem['intervalcount'] * ctrlItem['interval_n']); j1++) {
                                                        checkData.push({ list: j1 })
                                                    }
                                                    console.log(arrData[keyitem])
                                                    if (arrData[keyitem] !== undefined) {
                                                        Object.keys(arrData[keyitem]).forEach(keydata => {
                                                            if (arrData[keyitem][keydata] !== "") {
                                                                arrD = JSON.parse(arrData[keyitem][keydata])
                                                                Object.keys(arrD).forEach(keyD => { //keyD = day
                                                                    Object.keys(arrD[keyD]).forEach(keyI => { //keyI = interval index
                                                                        const dat = arrD[keyD][keyI]
                                                                        if (dat !== "") {
                                                                            checkData[keyI - 1] = { ...checkData[keyI - 1], [keyD]: dat }
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        })
                                                    }
                                                    console.log(checkData)
                                                    graphList.push(
                                                        <div key={graphList.length + 1}>
                                                            <b>{`${ctrlItem['itemid']}-${ctrlItem['parameter']}`}</b>
                                                            <BootstrapTable
                                                                ref={x => this.checkTable = x}
                                                                keyField="list"
                                                                data={checkData}
                                                                columns={checkcolumns}
                                                                rowStyle={this.rowStyle}
                                                                wrapperClasses="table-responsive"
                                                            />
                                                        </div>
                                                    )
                                                } else {
                                                    console.log(keyitem)
                                                    console.log(arrData[keyitem])
                                                    if (arrData[keyitem] !== undefined) {
                                                        Object.keys(arrData[keyitem]).forEach(keydata => {
                                                            if (arrData[keyitem][keydata] !== "") {
                                                                arrD = JSON.parse(arrData[keyitem][keydata])
                                                                Object.keys(arrD).forEach(keyD => { //keyD = day
                                                                    Object.keys(arrD[keyD]).forEach(keyI => { //keyI = interval index
                                                                        const dat = arrD[keyD][keyI]
                                                                        if (dat !== "") {
                                                                            if (dat > upperG) {
                                                                                upperG = dat
                                                                            }
                                                                            if (dat < lowerG) {
                                                                                lowerG = dat
                                                                            }
                                                                            graphData.push({
                                                                                x: Number(keyD) + ((Number(keyI) - 1) * intervalPitch),
                                                                                y: dat,
                                                                                msg: ""
                                                                            })
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                        })
                                                    }
                                                    var maxRG = 0
                                                    var yRTicks = []
                                                    if (ctrlItem['method'] === "x-R chart" || ctrlItem['method'] === "x-Rs chart") {
                                                        console.log(xrLimitData[keyitem])
                                                        graphData.forEach(dat => {
                                                            if (dat['y'] !== undefined) {
                                                                const k = parseInt(dat['x'])
                                                                if (graphRData[k] === undefined) {
                                                                    graphRData = { ...graphRData, [k]: [dat['y']] }
                                                                } else {
                                                                    graphRData = { ...graphRData, [k]: [...graphRData[k], dat['y']] }
                                                                }
                                                            }
                                                        })
                                                        var maxR = -Infinity
                                                        var datBefore = null
                                                        Object.keys(graphRData).forEach(key => {
                                                            var max = -Infinity
                                                            var min = +Infinity
                                                            graphRData[key].forEach(datkey => {
                                                                if (datkey > max) {
                                                                    max = datkey
                                                                }
                                                                if (datkey < min) {
                                                                    min = datkey
                                                                }
                                                            })
                                                            var r = (max - min).toFixed(ctrlItem['read'])
                                                            if (ctrlItem['method'] === "x-Rs chart") {
                                                                if (datBefore !== null) {
                                                                    r = (Math.abs(datBefore - max)).toFixed(ctrlItem['read'])
                                                                } else {
                                                                    r = ""
                                                                }
                                                                datBefore = max
                                                            }
                                                            if (r > maxR) {
                                                                maxR = r
                                                            }
                                                            if (r !== "") {
                                                                fingraphRData = [...fingraphRData, { x: key, y: r }]
                                                            }
                                                        })
                                                        var rcl = null
                                                        if (xrLimitData[keyitem] !== undefined) {
                                                            if (xrLimitData[keyitem]['rcl'] !== undefined && xrLimitData[keyitem]['rcl'] !== "") {
                                                                rcl = xrLimitData[keyitem]['rcl']
                                                                if (Number(maxR) < Number(xrLimitData[keyitem]['rcl'])) {
                                                                    maxR = Number(xrLimitData[keyitem]['rcl'])
                                                                }
                                                                fingraphRData.push(
                                                                    { x: 0, upper: Number(xrLimitData[keyitem]['rcl']) },
                                                                    { x: day + 2, upper: Number(xrLimitData[keyitem]['rcl']) },
                                                                    { x: 0, rbar: Number(xrLimitData[keyitem]['rbar']) },
                                                                    { x: day + 2, rbar: Number(xrLimitData[keyitem]['rbar']) },
                                                                )
                                                            }
                                                        }
                                                        if (maxR === -Infinity) {
                                                            maxR = 0.5
                                                        }
                                                        var pitchRY = maxR / 5
                                                        for (var k = 0; k < 5; k++) {
                                                            yRTicks.push((pitchRY * k).toFixed(ctrlItem['read']))
                                                        }
                                                        yRTicks.push(Number(maxR).toFixed(ctrlItem['read']))
                                                        maxRG = Number(maxR) + pitchRY
                                                        console.log(yRTicks)
                                                        console.log(fingraphRData)
                                                    }
                                                    var upp = null
                                                    var low = null
                                                    if (ctrlItem['upperlimit'] !== "") {
                                                        upp = Number(ctrlItem['upperlimit'])
                                                    }
                                                    if (ctrlItem['lowerlimit'] !== "") {
                                                        low = Number(ctrlItem['lowerlimit'])
                                                    }
                                                    graphData.push(
                                                        { x: 0, upper: upp },
                                                        { x: day + 2, upper: upp },
                                                        { x: 0, lower: low },
                                                        { x: day + 2, lower: low }
                                                    )
                                                    var ucl = null
                                                    var lcl = null
                                                    if (xrLimitData[keyitem] !== undefined && ctrlItem['method'] === "x-R chart" || ctrlItem['method'] === "x-Rs chart") {
                                                        ucl = xrLimitData[keyitem]['ucl']
                                                        lcl = xrLimitData[keyitem]['lcl']
                                                        graphData.push(
                                                            { x: 0, ucl: xrLimitData[keyitem]['ucl'] },
                                                            { x: day + 2, ucl: xrLimitData[keyitem]['ucl'] },
                                                            { x: 0, xbar: xrLimitData[keyitem]['xbar'] },
                                                            { x: day + 2, xbar: xrLimitData[keyitem]['xbar'] },
                                                            { x: 0, lcl: xrLimitData[keyitem]['lcl'] },
                                                            { x: day + 2, lcl: xrLimitData[keyitem]['lcl'] },
                                                        )
                                                    }
                                                    console.log(`${ctrlItem['itemid']}-${ctrlItem['parameter']}`)
                                                    console.log(graphData)
                                                    const pitchY = (upperG - lowerG) / 10
                                                    var yTick = []
                                                    for (var i = 0; i < 10; i++) {
                                                        yTick.push((lowerG + (pitchY * i)).toFixed(ctrlItem.read))
                                                    }
                                                    yTick.push((lowerG - pitchY).toFixed(ctrlItem.read))
                                                    yTick.push((upperG + pitchY).toFixed(ctrlItem.read))
                                                    yTick.push(upperG.toFixed(ctrlItem.read))
                                                    upperG += pitchY
                                                    lowerG -= pitchY
                                                    console.log(upperG)
                                                    console.log(lowerG)
                                                    console.log(pitchY)
                                                    console.log(yTick)
                                                    var tick = []
                                                    for (var t = 1; t <= day; t++) {
                                                        tick.push(t)
                                                    }
                                                    graphList.push(
                                                        <div className="rec-data-graph-all" key={graphList.length + 1}>
                                                            <b>{`${ctrlItem['itemid']}-${ctrlItem['parameter']}`}</b>
                                                            <div className="rec-data-graph-all-graph">
                                                                <ComposedChart
                                                                    width={700}
                                                                    height={400}
                                                                    margin={{
                                                                        top: 20,
                                                                        right: 20,
                                                                        bottom: 20,
                                                                        left: 20,
                                                                    }}
                                                                    data={graphData}
                                                                >
                                                                    <CartesianGrid />
                                                                    <XAxis type="number"
                                                                        dataKey="x"
                                                                        name="Date"
                                                                        domain={[0.5, day + 1.5]}
                                                                        interval={0}
                                                                        ticks={tick}
                                                                        allowDataOverflow
                                                                    />
                                                                    <YAxis type="number"
                                                                        name="Data"
                                                                        domain={[lowerG, upperG]}
                                                                        interval={0}
                                                                        ticks={yTick}
                                                                        allowDataOverflow
                                                                    />
                                                                    <ZAxis type="number" range={[50]} />
                                                                    <Tooltip content={(e) => this.CustomToolTipChart(e, ctrlItem['unit'], intervalPitch, upp, low, ucl, lcl)} cursor={{ strokeDasharray: '3 3' }} />
                                                                    <Scatter name="Data" dataKey="y" fill="#505050" line shape={(e) => this.customDot(e, upp, low, ucl, lcl)} />
                                                                    <Scatter name="Data2" dataKey="y2" fill="#505050" line shape={(e) => this.customDotMin(e, upp, low, ucl, lcl)} />
                                                                    <Line name="Upper Limit" dataKey="upper" stroke="rgba(255,0,0,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelUpper(e, ctrlItem['unit'])} isAnimationActive={false} />
                                                                    <Line name="Lower Limit" dataKey="lower" stroke="rgba(255,0,0,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelLower(e, ctrlItem['unit'])} isAnimationActive={false} />
                                                                    <Line name="UCL" dataKey="ucl" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelUCL(e, ctrlItem['unit'])} isAnimationActive={false} />
                                                                    <Line name="x Bar" dataKey="xbar" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelXbar(e, ctrlItem['unit'],xrLimitData[keyitem]['cpk'])} isAnimationActive={false} strokeDasharray="8 2" />
                                                                    <Line name="LCL" dataKey="lcl" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelLCL(e, ctrlItem['unit'])} isAnimationActive={false} />
                                                                    <Scatter name="circle" dataKey="cY" shape={<this.customCircle />} isAnimationActive={false} />
                                                                </ComposedChart>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                if (ctrlItem['method'] === "x-R chart" || ctrlItem['method'] === 'x-Rs chart') {
                                                    //add graph R data
                                                    graphList.push(
                                                        <div className="rec-data-graph-all" key={graphList.length + 1}>
                                                            <b>R chart</b>
                                                            <div className="rec-data-graph-all-graph">
                                                                <ComposedChart
                                                                    width={700}
                                                                    height={200}
                                                                    margin={{
                                                                        top: 20,
                                                                        right: 20,
                                                                        bottom: 20,
                                                                        left: 20,
                                                                    }}
                                                                    data={fingraphRData}
                                                                >
                                                                    <CartesianGrid />
                                                                    <XAxis type="number"
                                                                        dataKey="x"
                                                                        name="Date"
                                                                        domain={[0.5, day + 1.5]}
                                                                        interval={0}
                                                                        ticks={tick}
                                                                        allowDataOverflow
                                                                    />
                                                                    <YAxis type="number"
                                                                        name="Data"
                                                                        domain={[0, maxRG]}
                                                                        interval={0}
                                                                        ticks={yRTicks}
                                                                        allowDataOverflow
                                                                    />
                                                                    <ZAxis range={[50]} />
                                                                    <Tooltip content={(e) => this.CustomToolTipChart(e, ctrlItem['unit'], intervalPitch, upp, low, ucl, lcl)} cursor={{ strokeDasharray: '3 3' }} />
                                                                    <Scatter name="Data" dataKey="y" fill="#505050" line shape={(e) => this.customDotR(e, rcl)} />
                                                                    <Line name="R UCL" dataKey="upper" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelRUCL(e, ctrlItem['unit'])} isAnimationActive={false} />
                                                                    <Line name="R Bar" dataKey="rbar" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={(e) => this.customLabelRbar(e, ctrlItem['unit'])} isAnimationActive={false} strokeDasharray="8 2" />
                                                                </ComposedChart>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })
                                            console.log(timeUpdate)
                                            timeUpdate.forEach(time => {
                                                if (lastUpdate === "") {
                                                    lastUpdate = time
                                                }
                                                if (moment(time, 'HH:mm:ss DD-MM-YYYY') > moment(lastUpdate, 'HH:mm:ss DD-MM-YYYY')) {
                                                    lastUpdate = time
                                                }
                                            })
                                            console.log(lastUpdate)
                                            this.setState({
                                                getarrData: arrData,
                                                getarrData2: arrData2,
                                                getarrMsg: arrMsg,
                                                getarrProgress: arrProgress,
                                                getTableData: tableData,
                                                ngDataItem: arrNgDataItem,
                                                approveData: approveData,
                                                approveDate: approveDate,
                                                approveEmp: approveEmp,
                                                approveName: approveName,
                                                approveItemId: apprvId,
                                                countRecordAll: countAll,
                                                countRecorded: countRecord,
                                                approveGraphList: graphList,
                                                timeDataUpdate: timeUpdate,
                                                timeLastUpdate: lastUpdate,
                                                isLoading: false,
                                            }, () => {
                                                this.selectTypeFilter(this.state.typeFilter)
                                            })
                                        })
                                        .catch(err => {
                                            alert(err)
                                            console.log(err)
                                            console.log("get x-R data of previous month is error")
                                        })
                                })
                                .catch(err => {
                                    alert(err)
                                    console.log(err)
                                })
                        });
                        //console.log(result.data);
                    })
                    .catch(error => alert(error))
            })
        })
    }

    getControlItemData = async (proc, ind, ym, date, sameProc, shift) => {
        this.setState({
            isLoading: true
        }, async () => {
            var approveData = []
            var approveDate = []
            var approveEmp = []
            var approveName = []
            var approveQueue = []
            const dom = moment(this.state.pickedDate).daysInMonth()
            var chkedCount = 0
            var apprvId = ""
            var timeUpdate = []
            if (!sameProc || this.state.shiftChange) {
                console.log("not same process, month or shift > get new data")
                this.checkNextPrevProcess()
                await api.get(`/controlitems/items/${curSection}_${this.state.currentViewNo}_${proc}`)
                    .then(result => {
                        var arrResult = result.data
                        arrResult.sort(naturalSortItemno)
                        this.setState({
                            itemLists: arrResult,
                            shiftChange: false,
                        }, () => {
                            //this.createPagination()
                            console.log(arrResult)
                            var tableData = []
                            var maxinter = 0
                            var whenchangemaxinter = 0
                            var indexItem = 0
                            var indexItem_normal = 0
                            var indexItem_wc = 0
                            arrResult.forEach((res, ind) => {
                                var read = 0
                                if (res.readability !== null) {
                                    read = res.readability.length - res.readability.indexOf(".") - 1
                                }
                                var param = `${res.parameter}`
                                if (res.remark !== "") {
                                    param = `${param}\n\n[Remark]\n${res.remark}`
                                }
                                if (res.interval2.includes("When change")) {
                                    indexItem = indexItem_wc
                                    indexItem_wc += 1
                                } else {
                                    indexItem = indexItem_normal
                                    indexItem_normal += 1
                                }
                                var addTableData = {
                                    index: indexItem,
                                    len: arrResult.length,
                                    id: res.id,
                                    itemid: res.itemid,
                                    parameter: param,
                                    upperlimit: res.limit.split(";")[0],
                                    lowerlimit: res.limit.split(";")[1],
                                    interval: `${res.interval1}/${res.interval2}`,
                                    intervalcount: res.interval1,
                                    interval_n: res.interval_n,
                                    interval_wc: res.interval_wc,
                                    masterval: Number(res.masterval).toFixed(read),
                                    calmethod: res.calmethod,
                                    tool: res.meastool,
                                    method: res.recmethod,
                                    meastimes: res.meastimes,
                                    read: read,
                                    unit: res.unit,
                                }
                                var intervalNum = 0
                                console.log(res.interval2)
                                if (res.interval2.includes("When change") && !res.interval2.includes("Pieces")) {
                                    intervalNum = res.interval1 * res.interval_n * res.interval_wc
                                    if (intervalNum > whenchangemaxinter) {
                                        whenchangemaxinter = intervalNum
                                    }
                                } else {
                                    intervalNum = res.interval1 * res.interval_n
                                    if (intervalNum > maxinter) {
                                        maxinter = intervalNum
                                    }
                                }
                                for (var x = 1; x <= intervalNum; x++) {
                                    addTableData = { ...addTableData, [`data${x}`]: "" }
                                }
                                tableData = [...tableData, addTableData]
                            })
                            var arrData = {}
                            var arrData2 = {}
                            var arrMsg = {}
                            var arrProgress = {}
                            var arrNgDataItem = {}
                            //get data record
                            api.get(`/datarec/data/${curSection}_${this.state.currentViewNo}_${proc}_${ym}_${shift}`)
                                .then(result => {
                                    result.data.forEach(dat => {
                                        console.log(dat)
                                        if (dat['itemid'] !== "apprv") {
                                            arrData = {
                                                ...arrData,
                                                [dat.itemid]: {
                                                    "id": dat.id,
                                                    1: dat.d1,
                                                    2: dat.d2,
                                                    3: dat.d3,
                                                    4: dat.d4
                                                }
                                            }
                                            arrData2 = {
                                                ...arrData2,
                                                [dat.itemid]: {
                                                    "id": dat.id,
                                                    1: dat.dm1,
                                                    2: dat.dm2,
                                                    3: dat.dm3,
                                                    4: dat.dm4
                                                }
                                            }
                                            arrMsg = {
                                                ...arrMsg,
                                                [dat.itemid]: {
                                                    "id": dat.id,
                                                    1: dat.msg1,
                                                    2: dat.msg2,
                                                    3: dat.msg3,
                                                    4: dat.msg4
                                                }
                                            }
                                            arrProgress = {
                                                ...arrProgress,
                                                [dat.itemid]: dat.progress
                                            }
                                            var ngFlag = []
                                            if (dat.ngdayflag !== "") {
                                                ngFlag = dat.ngdayflag.split(";")
                                            }
                                            arrNgDataItem = { ...arrNgDataItem, [dat.itemid]: ngFlag }
                                            timeUpdate = dat.update.split(";")
                                            console.log(timeUpdate)
                                        } else {
                                            approveData = dat['d1']
                                            approveData = approveData.split(';')
                                            approveData.forEach((item, ind) => {
                                                approveData[ind] = Number(item)
                                                if (Number(item) === 1 && ind < dom) {
                                                    chkedCount++
                                                }
                                            })
                                            approveDate = dat['d2']
                                            approveDate = approveDate.split(';')
                                            approveEmp = dat['d3']
                                            approveEmp = approveEmp.split(';')
                                            approveName = dat['d4']
                                            approveName = approveName.split(';')
                                            apprvId = dat['id']
                                        }
                                    })
                                    console.log(apprvId)
                                    this.getApproveQueue(apprvId)
                                    //get data of xr chart ucl,lcl of prev month
                                    const prevym = moment(this.state.pickedDate).subtract(1, 'months').format('YYYY-MM')
                                    api.get(`/datarec/xronlydata/${curSection}_${this.state.currentViewNo}_${proc}_${prevym}_${shift}`)
                                        .then(dat => {
                                            console.log(dat.data)
                                            const xrData = dat.data
                                            xrData.forEach(list => {
                                                tableData.forEach((list1, ind1) => {
                                                    if (list1.itemid === list.itemid) {
                                                        var ucl = 0
                                                        var lcl = 0
                                                        var rcl = 0
                                                        var xbar = 0
                                                        var rbar = 0
                                                        var cpk = 0
                                                        if (list.force) {
                                                            ucl = list['fcl'].split(";")[0]
                                                            lcl = list['fcl'].split(";")[1]
                                                            rcl = list['fcl'].split(";")[2]
                                                            xbar = list['fxbar'].split(";")[0]
                                                            rbar = list['fxbar'].split(";")[1]
                                                            cpk = list['fxbar'].split(";")[2]
                                                        } else {
                                                            ucl = list['cl'].split(";")[0]
                                                            lcl = list['cl'].split(";")[1]
                                                            rcl = list['cl'].split(";")[2]
                                                            xbar = list['xbar'].split(";")[0]
                                                            rbar = list['xbar'].split(";")[1]
                                                            cpk = list['xbar'].split(";")[2]
                                                        }
                                                        tableData[ind1] = {
                                                            ...tableData[ind1],
                                                            ucl: ucl,
                                                            lcl: lcl,
                                                            rcl: rcl,
                                                            xbar: xbar,
                                                            rbar: rbar,
                                                            cpk: cpk
                                                        }
                                                    }
                                                })
                                            })
                                            //console.log(tableData)
                                            //console.log(arrProgress)
                                            console.log(arrData)
                                            console.log(arrData2)
                                            this.setState({
                                                getarrData: arrData,
                                                getarrData2: arrData2,
                                                getarrMsg: arrMsg,
                                                getarrProgress: arrProgress,
                                                getTableData: tableData,
                                                maxInterval: maxinter,
                                                whenchangemaxInterval: whenchangemaxinter,
                                                ngDataItem: arrNgDataItem
                                            })
                                            var tableData2 = []
                                            var tableDataWhenchange = []
                                            var tableMsg = {}
                                            var arrNoEditCell = {}
                                            var arrWhenchangeNoEditCell = {}
                                            var countAll = 0
                                            var countRecord = 0
                                            tableData.forEach((item, ind) => {
                                                countAll += (item.intervalcount * item.interval_n * item.interval_wc)
                                                var pushData = item
                                                //console.log(item.itemid)
                                                var indData = 0
                                                if (date >= 1 && date <= 8) {
                                                    indData = 1
                                                } else if (date >= 9 && date <= 16) {
                                                    indData = 2
                                                } else if (date >= 17 && date <= 24) {
                                                    indData = 3
                                                } else {
                                                    indData = 4
                                                }
                                                if (arrData[item.itemid] !== undefined) {
                                                    const arrDataInd = arrData[item.itemid][indData]
                                                    const arrData2Ind = arrData2[item.itemid][indData]
                                                    if (arrDataInd !== undefined && arrDataInd !== "") {
                                                        const objarrData = JSON.parse(arrDataInd)
                                                        if (objarrData[date] !== undefined) {
                                                            const objData = objarrData[date]
                                                            for (var j = 1; j <= (item.intervalcount * item.interval_n * item.interval_wc); j++) {
                                                                var d = ""
                                                                if (item.method === "Check sheet") {
                                                                    d = objData[j]
                                                                    if (d === "" || d === undefined) {
                                                                        d = ""
                                                                    } else if (d === "O") {
                                                                        countRecord++
                                                                    }
                                                                } else if (item.calmethod === "Max & Min") {
                                                                    const objarrData2 = JSON.parse(arrData2Ind)
                                                                    const objData2 = objarrData2[date]
                                                                    const d1 = Number.parseFloat(objData[j]).toFixed(item.read)
                                                                    const d2 = Number.parseFloat(objData2[j]).toFixed(item.read)
                                                                    d = `${d1}\n${d2}`
                                                                    if (isNaN(d1) || isNaN(d2)) {
                                                                        d = ""
                                                                    } else {
                                                                        countRecord++
                                                                    }
                                                                } else {
                                                                    d = Number.parseFloat(objData[j]).toFixed(item.read)
                                                                    if (isNaN(d)) {
                                                                        d = ""
                                                                    } else {
                                                                        countRecord++
                                                                    }
                                                                }
                                                                pushData = { ...pushData, [`data${j}`]: d }
                                                            }
                                                        }
                                                    }
                                                }
                                                if (item.interval.includes("When change")) {
                                                    tableDataWhenchange = [...tableDataWhenchange, pushData]
                                                } else {
                                                    tableData2 = [...tableData2, pushData]
                                                }

                                                var pushMsg = {}
                                                if (arrMsg[item.itemid] !== undefined) {
                                                    const arrMsgInd = arrMsg[item.itemid][indData]
                                                    if (arrMsgInd !== undefined && arrMsgInd !== "") {
                                                        const objarrMsg = JSON.parse(arrMsgInd)
                                                        if (objarrMsg[date] !== undefined) {
                                                            var objMsg = objarrMsg[date]
                                                            for (j = 1; j <= (item.intervalcount * item.interval_n * item.interval_wc); j++) {
                                                                d = objMsg[j]
                                                                if (d === undefined) {
                                                                    d = ""
                                                                }
                                                                pushMsg = { ...pushMsg, [j]: d }
                                                            }
                                                        }
                                                    }
                                                }
                                                tableMsg = { ...tableMsg, [item.itemid]: pushMsg }

                                                if (item.interval.includes("When change")) {
                                                    for (var i = (item.intervalcount * item.interval_n * item.interval_wc) + 1; i <= maxinter; i++) {
                                                        arrWhenchangeNoEditCell = { ...arrWhenchangeNoEditCell, [`${ind},${10 + i}`]: i }
                                                    }
                                                } else {
                                                    for (var i = (item.intervalcount * item.interval_n) + 1; i <= maxinter; i++) {
                                                        arrNoEditCell = { ...arrNoEditCell, [`${ind},${10 + i}`]: i }
                                                    }
                                                }
                                            })
                                            console.log(tableData2)
                                            console.log(tableDataWhenchange)
                                            //console.log(tableMsg)
                                            //console.log(countAll)
                                            //console.log(countRecord)
                                            this.setState({
                                                recordTableData: tableData2,
                                                recordTableDataFiltered: [],
                                                recordTableWhenchangeData: tableDataWhenchange,
                                                recordTableWhenchangeDataFiltered: [],
                                                inputMsg: tableMsg,
                                                nonEditCell: arrNoEditCell,
                                                whenchangenonEditCell: arrWhenchangeNoEditCell,
                                                countRecordAll: countAll,
                                                countRecorded: countRecord,
                                                approveData: approveData,
                                                approveDate: approveDate,
                                                approveEmp: approveEmp,
                                                approveName: approveName,
                                                approveItemId: apprvId,
                                                checkedCount: chkedCount,
                                                timeDataUpdate: timeUpdate,
                                                isLoading: false
                                            }, () => {
                                                this.selectTypeFilter(this.state.typeFilter)
                                            })
                                        })
                                        .catch(err => {
                                            alert(err)
                                            console.log("get x-R data of previous month is error")
                                        })
                                })
                                .catch(err => {
                                    alert(err)
                                })
                        });
                        //console.log(result.data);
                    })
                    .catch(error => alert(error))
            } else {
                console.log("same process and same month > get data only")
                const arrData = this.state.getarrData
                const arrMsg = this.state.getarrMsg
                const tableData = this.state.getTableData
                approveData = this.state.approveData
                approveDate = this.state.approveDate
                approveEmp = this.state.approveEmp
                approveName = this.state.approveName
                approveQueue = this.state.approveQueue
                //console.log(tableData)
                //console.log(arrData)
                const maxinter = this.state.maxInterval
                const whenchangemaxinter = this.state.whenchangemaxInterval
                var tableData2 = []
                var tableDataWhenchange = []
                var tableMsg = {}
                var arrNoEditCell = {}
                var whenchangearrNoEditCell = {}
                var countAll = 0
                var countRecord = 0
                tableData.forEach((item, ind) => {
                    countAll += (item.intervalcount * item.interval_n)
                    var pushData = item
                    //console.log(item.itemid)
                    var indData = 0
                    if (date >= 1 && date <= 8) {
                        indData = 1
                    } else if (date >= 9 && date <= 16) {
                        indData = 2
                    } else if (date >= 17 && date <= 24) {
                        indData = 3
                    } else {
                        indData = 4
                    }
                    if (arrData[item.itemid] !== undefined) {
                        const arrDataInd = arrData[item.itemid][indData]
                        if (arrDataInd !== undefined && arrDataInd !== "") {
                            const objarrData = JSON.parse(arrDataInd)
                            if (objarrData[date] !== undefined) {
                                const objData = objarrData[date]
                                for (var j = 1; j <= (item.intervalcount * item.interval_n); j++) {
                                    var d = ""
                                    if (item.method === "Check sheet") {
                                        d = objData[j]
                                        if (d === "" || d === undefined) {
                                            d = ""
                                        } else if (d === "O") {
                                            countRecord++
                                        }
                                    } else {
                                        d = Number.parseFloat(objData[j]).toFixed(item.read)
                                        if (isNaN(d)) {
                                            d = ""
                                        } else {
                                            countRecord++
                                        }
                                    }
                                    pushData = { ...pushData, [`data${j}`]: d }
                                }
                            } else {
                                for (j = 1; j <= (item.intervalcount * item.interval_n); j++) {
                                    pushData = { ...pushData, [`data${j}`]: "" }
                                }
                            }
                        }
                    }
                    if (item.interval.includes("When change")) {
                        tableDataWhenchange = [...tableDataWhenchange, pushData]
                    } else {
                        tableData2 = [...tableData2, pushData]
                    }

                    var pushMsg = {}
                    if (arrMsg[item.itemid] !== undefined) {
                        const arrMsgInd = arrMsg[item.itemid][indData]
                        if (arrMsgInd !== undefined && arrMsgInd !== "") {
                            const objarrMsg = JSON.parse(arrMsgInd)
                            if (objarrMsg[date] !== undefined) {
                                var objMsg = objarrMsg[date]
                                for (j = 1; j <= (item.intervalcount * item.interval_n); j++) {
                                    d = objMsg[j]
                                    if (d === undefined) {
                                        d = ""
                                    }
                                    pushMsg = { ...pushMsg, [j]: d }
                                }
                            } else {
                                for (j = 1; j <= (item.intervalcount * item.interval_n); j++) {
                                    pushMsg = { ...pushMsg, [j]: "" }
                                }
                            }
                        }
                    }
                    tableMsg = { ...tableMsg, [item.itemid]: pushMsg }

                    if (item.interval.includes("When change")) {
                        for (var i = (item.intervalcount * item.interval_n * item.interval_wc) + 1; i <= maxinter; i++) {
                            whenchangearrNoEditCell = { ...whenchangearrNoEditCell, [`${ind},${10 + i}`]: i }
                        }
                    } else {
                        for (var i = (item.intervalcount * item.interval_n) + 1; i <= maxinter; i++) {
                            arrNoEditCell = { ...arrNoEditCell, [`${ind},${10 + i}`]: i }
                        }
                    }
                })
                //console.log(tableData2)
                //console.log(tableMsg)
                //console.log(countAll)
                //console.log(countRecord)
                approveData.forEach((item, ind) => {
                    if (Number(item) === 1 && ind < dom) {
                        chkedCount++
                    }
                })
                this.setState({
                    recordTableData: tableData2,
                    recordTableDataFiltered: [],
                    recordTableWhenchangeData: tableDataWhenchange,
                    recordTableWhenchangeDataFiltered: [],
                    maxInterval: maxinter,
                    whenchangemaxInterval: whenchangemaxinter,
                    inputMsg: tableMsg,
                    nonEditCell: arrNoEditCell,
                    whenchangenonEditCell: whenchangearrNoEditCell,
                    countRecordAll: countAll,
                    countRecorded: countRecord,
                    approveData: approveData,
                    approveDate: approveDate,
                    approveEmp: approveEmp,
                    approveName: approveName,
                    approveQueue: approveQueue,
                    checkedCount: chkedCount,
                    isLoading: false
                }, () => {
                    this.selectTypeFilter(this.state.typeFilter)
                })
            }
        })
    }

    gotoPrevProcess = () => {
        if (this.state.tableDataChange) {
            const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
            if (!conf) {
                return
            }
        }
        const curproc = this.state.processSelectedIndex
        if (curproc > 0) {
            const prevproc = this.state.processLists[curproc - 1]["process"]
            if (Empview) {
                this.approveProcessSelect(prevproc, curproc - 1)
            } else {
                this.processSelect(prevproc, curproc - 1)
            }
        }
        this.checkNextPrevProcess()
    }

    gotoNextProcess = () => {
        //console.log("next proc")
        if (this.state.tableDataChange) {
            const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
            if (!conf) {
                return
            }
        }
        const len = this.state.processLists.length - 1
        const curproc = this.state.processSelectedIndex
        if (len > curproc) {
            const nextproc = this.state.processLists[curproc + 1]["process"]
            if (Empview) {
                this.approveProcessSelect(nextproc, curproc + 1)
            } else {
                this.processSelect(nextproc, curproc + 1)
            }
        }
        this.checkNextPrevProcess()
    }

    checkNextPrevProcess = () => {
        const len = this.state.processLists.length - 1
        const curproc = this.state.processSelectedIndex
        var disNext = false
        var disPrev = false
        if (curproc === 0) {
            disPrev = true
        } else if (len === curproc) {
            disNext = true
        }
        this.setState({
            disableNextProc: disNext,
            disablePrevProc: disPrev
        })
    }

    rowStyle = (row, rowIndex) => {
        const style = {};
        if (rowIndex % 2 === 0) {
            style.backgroundColor = "#E0E0E0"
            style.borderColor = '#000000'
            style.fontSize = '13px'
        } else {
            style.backgroundColor = "#B9B9B9"
            style.borderColor = '#000000'
            style.fontSize = '13px'
        }
        return style
    }

    hideColumnData = () => {
        this.setState({
            hide: !this.state.hide
        })
    }

    getDevices = async () => {
        let device
        await navigator.usb.requestDevice({ filters: [] })
            .then(usbDevices => {
                //console.log(usbDevices)
                device = usbDevices
                /*navigator.usb.getDevices()
                    .then(devices => {
                        console.log("Total devices: " + devices.length)
                        devices.forEach(device => {
                            console.log("Product name: " + device.productName + ", Serial number: " + device.serialNumber)
                        })
                    })*/
                return device.open()
                    .then(() => device.selectConfiguration(1))
                    .then(() => device.claimInterface(2))
                    .then(() => {
                        device.controlTransferOut({
                            requestType: 'class',
                            recipient: 'interface',
                            request: 0x22,
                            value: 0x01,
                            index: 0x02
                        })
                    })
                    .then(() => device.transferIn(5, 64))
                    .then(res => {
                        console.log(res)
                    })
            })
            .catch(err => console.log("There is no device." + err))


    }

    setSelectedRow = (colInd, row, rowInd) => {
        console.log("selected row")
        var selRow = []
        if (colInd <= 10 + (this.state.recordTableDataFiltered[rowInd]['intervalcount'] * this.state.recordTableDataFiltered[rowInd]['interval_n'])) {
            selRow.push(row.id)
            console.log(row.id)
        }
        this.setState({
            selectedRow: selRow
        }, () => {
            //console.log(this.state.selectedRow)
        })
    }

    setwhenchangeSelectedRow = (colInd, row, rowInd) => {
        console.log("when change selected row")
        var selRow = []
        if (colInd <= 10 + (this.state.recordTableWhenchangeDataFiltered[rowInd]['intervalcount'] * this.state.recordTableWhenchangeDataFiltered[rowInd]['interval_n'] * this.state.recordTableWhenchangeDataFiltered[rowInd]['interval_wc'])) {
            selRow.push(row.id)
        }
        this.setState({
            whenchangeselectedRow: selRow
        })
    }

    clearSelectedRow = () => {
        this.setState({
            selectedRow: [],
            whenchangeselectedRow: [],
        })
    }

    checkInputCondition = (row, val) => {
        console.log(row)
        console.log(val)
        if (val === "" && row.method !== "Check sheet") {
            return false
        }
        if (row.method !== "Check sheet") {
            var limitType = ""
            if (row.upperlimit === "" && row.lowerlimit !== "") {
                limitType = "min only"
            } else if (row.upperlimit !== "" && row.lowerlimit === "") {
                limitType = "max only"
            } else {
                limitType = "normal"
            }
            var upperlimit = row.upperlimit
            var lowerlimit = row.lowerlimit
            /*if (row.method === "x-R chart" || row.method === "x-Rs chart") {
                if (row.ucl !== undefined && row.lcl !== undefined) {
                    upperlimit = row.ucl
                    lowerlimit = row.lcl
                }
            }*/
            var upper = null
            var lower = null
            var flag = true
            var valcheck = val
            //if (val.includes("\n")) {
            valcheck = val.split("\n")
            //}
            console.log(valcheck)
            if (valcheck === " ") {
                return true
            }
            valcheck.forEach(value => {
                //console.log(limitType)
                if (limitType === "normal") {
                    upper = Number.parseFloat(upperlimit)
                    lower = Number.parseFloat(lowerlimit)
                    if (value > upper || value < lower) {
                        flag = flag && false
                    } else {
                        flag = flag && true
                    }
                } else if (limitType === "max only") {
                    upper = Number.parseFloat(upperlimit)
                    if (value > upper) {
                        flag = flag && false
                    } else {
                        flag = flag && true
                    }
                } else if (limitType === "min only") {
                    lower = Number.parseFloat(lowerlimit)
                    if (value < lower) {
                        flag = flag && false
                    } else {
                        flag = flag && true
                    }
                } else {
                    alert("Check input condition error")
                    return
                }
            })
            return flag
        } else { //check sheet condition
            return true
        }
    }

    saveRecordData = () => {
        this.setState({
            savingStatus: true,
            countRecorded: 0,
            isLoading: true
        }, () => {
            const pno = this.state.currentViewNo
            const proc = this.state.processText
            const ym = moment(this.state.pickedDate).format('YYYY-MM')
            const date = moment(this.state.pickedDate).format('D')
            const shift = this.state.shift
            const tableData = [...this.state.recordTableDataFiltered, ...this.state.recordTableWhenchangeDataFiltered]
            const msgInput = this.state.inputMsg
            const curarrData = this.state.getarrData
            const curarrData2 = this.state.getarrData2
            const curarrMsg = this.state.getarrMsg
            const curNgDayFlag = this.state.ngDataItem
            var indData = 0
            if (date >= 1 && date <= 8) {
                indData = 1
            } else if (date >= 9 && date <= 16) {
                indData = 2
            } else if (date >= 17 && date <= 24) {
                indData = 3
            } else {
                indData = 4
            }
            this.saveWorkAmount()
            console.log(tableData)
            var dataLen = tableData.length
            var dataLenID = 1
            var dataLenFin = true
            tableData.forEach((item, ind) => {
                console.log(item)
                //if (ind === 0) {
                var countRecorded = 0
                var sumtxtData = curarrData[item.itemid]
                var sumtxtData2 = curarrData2[item.itemid]
                var summsgData = curarrMsg[item.itemid]
                var sumNgFlagData = curNgDayFlag[item.itemid]
                var upper = Number.parseFloat(item.upperlimit)
                var lower = Number.parseFloat(item.lowerlimit)
                if (sumtxtData === undefined) {
                    sumtxtData = {}
                } else {
                    sumtxtData = sumtxtData[indData]
                }
                if (sumtxtData2 === undefined) {
                    sumtxtData2 = {}
                } else {
                    sumtxtData2 = sumtxtData2[indData]
                }
                if (summsgData === undefined) {
                    summsgData = {}
                } else {
                    summsgData = summsgData[indData]
                }
                //console.log(sumNgFlagData)
                if (sumNgFlagData === undefined) {
                    sumNgFlagData = []
                }
                console.log(sumtxtData2)
                if (sumtxtData !== "" && Object.keys(sumtxtData).length !== 0) {
                    sumtxtData = JSON.parse(sumtxtData)
                }
                if (sumtxtData2 !== "" && Object.keys(sumtxtData2).length !== 0) {
                    sumtxtData2 = JSON.parse(sumtxtData2)
                }
                if (summsgData !== "" && Object.keys(summsgData).length !== 0) {
                    summsgData = JSON.parse(summsgData)
                }
                var txtData = {}
                var txtData2 = {}
                var msgData = {}
                //console.log(summsgData[date])
                if (summsgData[date] !== "") {
                    msgData = summsgData[date]
                }
                //console.log(msgData)
                var addNgFlag = false
                for (var x = 1; x <= (item.intervalcount * item.interval_n * item.interval_wc); x++) {
                    var dat = ""
                    if (item.method === "Check sheet") {
                        console.log(item)
                        dat = item[`data${x}`]
                        if (dat === "O") {
                            countRecorded++
                        }
                    } else {
                        if (item.calmethod === "Max & Min") {
                            dat = item[`data${x}`].split("\n")
                            dat.forEach((val, ind) => {
                                dat[ind] = Number.parseFloat(val)
                            })
                            console.log(dat)
                        } else {
                            dat = Number.parseFloat(item[`data${x}`])
                        }
                        console.log(dat.length)
                        if (isNaN(dat) && dat.length === 1) {
                            dat = ""
                        } else if (dat.length > 1) {
                            dat.forEach(val => {
                                if (!isNaN(upper) && !isNaN(lower)) { //normal limit
                                    if (val > upper || val < lower) {
                                        addNgFlag = true
                                    }
                                } else if (!isNaN(upper) && isNaN(lower)) { //upper only
                                    if (val > upper) {
                                        addNgFlag = true
                                    }
                                } else if (isNaN(upper) && !isNaN(lower)) { //lower only
                                    if (val < lower) {
                                        addNgFlag = true
                                    }
                                }
                            })
                            if (addNgFlag && !sumNgFlagData.includes(date)) {
                                sumNgFlagData.push(date)
                            }
                        } else {
                            //check upper,lower limit
                            if (!isNaN(upper) && !isNaN(lower)) { //normal limit
                                if (dat > upper || dat < lower) {
                                    addNgFlag = true
                                }
                            } else if (!isNaN(upper) && isNaN(lower)) { //upper only
                                if (dat > upper) {
                                    addNgFlag = true
                                }
                            } else if (isNaN(upper) && !isNaN(lower)) { //lower only
                                if (dat < lower) {
                                    addNgFlag = true
                                }
                            }
                            if (addNgFlag && !sumNgFlagData.includes(date)) {
                                sumNgFlagData.push(date)
                            }
                        }
                        if (!isNaN(dat) && dat !== "" && dat !== null) {
                            countRecorded++
                        }
                    }
                    if (item.calmethod === "Max & Min") {
                        txtData = { ...txtData, [x]: dat[0] }
                        txtData2 = { ...txtData2, [x]: dat[1] }
                        console.log(dat)
                        console.log(txtData2)
                    } else {
                        console.log(dat)
                        if ((isNaN(dat) || dat === undefined || dat === null) && item.method !== "Check sheet") {
                            dat = ""
                        }
                        txtData = { ...txtData, [x]: dat }
                    }
                    if (msgInput[item.itemid] !== undefined) {
                        dat = msgInput[item.itemid][x]
                        if ((isNaN(dat) || dat === undefined || dat === null) && item.method !== "Check sheet") {
                            dat = ""
                        }
                        msgData = { ...msgData, [x]: dat }
                    }
                }
                if (!addNgFlag && sumNgFlagData.includes(date)) { //data is OK, check contain in ng flag data
                    const itemInd = sumNgFlagData.indexOf(date)
                    sumNgFlagData.splice(itemInd, 1)
                }
                sumtxtData = { ...sumtxtData, [date]: txtData }
                if (item.calmethod === "Max & Min") {
                    sumtxtData2 = { ...sumtxtData2, [date]: txtData2 }
                }
                console.log(txtData)
                //console.log(sumtxtData2)
                summsgData = { ...summsgData, [date]: msgData }
                //console.log(item.method)
                var sumcl = ""
                var sumxbar = ""
                if (item.method === "x-R chart" || item.method === "x-Rs chart") {
                    //console.log("x-r calculate")
                    //console.log(sumtxtData)
                    var xbefore = null
                    var xsum = 0
                    var rsum = 0
                    var xcount = 0
                    var rcount = 0
                    var allData = curarrData[item.itemid]
                    var allDataSum = {}
                    if (allData === undefined) {
                        allData = {}
                    }
                    Object.keys(allData).forEach(key => { //key = inddata
                        var allDataInd = {}
                        console.log(allData[key])
                        if (allData[key] !== "" && key !== 'id') {
                            const parseallDatakey = JSON.parse(allData[key])
                            if (Object.keys(parseallDatakey).length !== 0) {
                                allDataInd = parseallDatakey
                                allDataSum = { ...allDataSum, ...allDataInd }
                            }
                        }
                    })
                    //console.log(allDataSum)
                    //console.log(sumtxtData)
                    var sumData = { ...allDataSum, ...sumtxtData }
                    console.log(sumData)
                    //current inddata
                    Object.keys(sumData).forEach(key1 => { //day loop
                        var rmax = ""
                        var rmin = ""
                        Object.keys(sumData[key1]).forEach(key2 => { //interval loop
                            var dat = sumData[key1][key2]
                            if (dat !== "" && dat !== undefined) {
                                dat = Number.parseFloat(dat)
                                if (!isNaN(dat)) {
                                    xsum += dat
                                    xcount++
                                    if (item.method === "x-R chart") {
                                        if (rmax === "") {
                                            rmax = dat
                                        } else if (dat > rmax) {
                                            rmax = dat
                                        }
                                        if (rmin === "") {
                                            rmin = dat
                                        } else if (dat < rmin) {
                                            rmin = dat
                                        }
                                    } else {
                                        console.log(xbefore)
                                        console.log(dat)
                                        if (xbefore !== null) {
                                            rsum += Math.abs(xbefore - dat)
                                            rcount++
                                        }
                                        xbefore = dat
                                    }
                                }
                            }
                        })
                        if (rmax !== "" && rmin !== "" && item.method !== "x-Rs chart") {
                            rsum += (rmax - rmin)
                            rcount++
                        }
                    })
                    console.log(xsum)
                    console.log(rsum)
                    console.log(xcount)
                    console.log(rcount)
                    var xbar = xsum / xcount
                    var rbar = rsum / rcount
                    var cpk = 0
                    if (xcount === 0) {
                        xbar = 0
                    }
                    if (rcount === 0) {
                        rbar = 0
                    }
                    var d2 = 0
                    var E2 = 0
                    var D4 = 0
                    const intcount = item.intervalcount
                    if (intcount === 2) {
                        d2 = 1.13
                        E2 = 2.66
                        D4 = 3.27
                    } else if (intcount === 3) {
                        d2 = 1.69
                        E2 = 1.77
                        D4 = 2.57
                    } else if (intcount === 4) {
                        d2 = 2.06
                        E2 = 1.46
                        D4 = 2.28
                    } else if (intcount === 5) {
                        d2 = 2.33
                        E2 = 1.29
                        D4 = 2.11
                    } else if (intcount === 6) {
                        d2 = 2.53
                        E2 = 1.18
                        D4 = 2.00
                    }
                    if (item.method === "x-Rs chart") {
                        d2 = 1.13
                        E2 = 2.66
                        D4 = 3.27
                    }
                    var ucl = xbar + (E2 * rbar)
                    var lcl = xbar - (E2 * rbar)
                    var rucl = D4 * rbar
                    const sigma = rbar / d2
                    if (item.upperlimit !== "" && item.lowerlimit !== "") { //two side
                        const upper = Number.parseFloat(item.upperlimit)
                        const lower = Number.parseFloat(item.lowerlimit)
                        const cpku = (upper - xbar) / (3 * sigma)
                        const cpkl = (xbar - lower) / (3 * sigma)
                        cpk = cpku
                        if (cpku > cpkl) {
                            cpk = cpkl
                        }
                    } else if (item.upperlimit !== "" && item.lowerlimit === "") { //upper spec
                        const upper = Number.parseFloat(item.upperlimit)
                        cpk = (upper - xbar) / (3 * sigma)
                    } else { //lower spec
                        const lower = Number.parseFloat(item.lowerlimit)
                        cpk = (xbar - lower) / (3 * sigma)
                    }
                    //console.log(cpk)
                    sumcl = `${ucl.toFixed(item.read)};${lcl.toFixed(item.read)};${rucl.toFixed(item.read)}`
                    sumxbar = `${xbar.toFixed(item.read)};${rbar.toFixed(item.read)};${cpk.toFixed(3)}`
                }
                console.log(sumcl)
                console.log(sumxbar)
                console.log(sumtxtData)
                sumtxtData = JSON.stringify(sumtxtData)
                sumtxtData2 = JSON.stringify(sumtxtData2)
                summsgData = JSON.stringify(summsgData)
                sumNgFlagData = sumNgFlagData.join(";")
                //console.log(sumNgFlagData)

                //check row is exists
                /*await api.get(`/datarec/${curSection}_${pno}_${proc}_${item.itemid}_${ym}`)
                    .then(results => {
                        const arrResult = results.data*/
                if (dataLen === dataLenID) {
                    dataLenFin = false
                } else {
                    dataLenID++
                }
                if (curarrData[item.itemid] === undefined) {
                    //create
                    api.post(`/datarec/create/`, {
                        section: curSection,
                        partno: pno,
                        process: proc,
                        itemid: item.itemid,
                        ym: ym,
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
                            this.postRecordData(res.data['id'], sumtxtData, sumtxtData2, summsgData, indData, [countRecorded, (item.intervalcount * item.interval_n * item.interval_wc)], item.itemid, sumNgFlagData, sumcl, sumxbar, dataLenFin)
                        })
                        .catch(err => alert(err))
                } else {
                    //console.log("exists")
                    this.postRecordData(curarrData[item.itemid]['id'], sumtxtData, sumtxtData2, summsgData, indData, [countRecorded, item.intervalcount * item.interval_n * item.interval_wc], item.itemid, sumNgFlagData, sumcl, sumxbar, dataLenFin)
                }
                //})
                //}
            })
        })
    }

    postRecordData = (id, txtData, txtData2, msgData, indData, countRec, itemid, ngDayData, sumcl, sumxbar, dataLenFin) => {
        //console.log(id)
        console.log(txtData)
        //console.log(txtData2)
        //console.log(msgData)
        const date = moment(this.state.pickedDate).format('D')
        const procIndex = this.state.processSelectedIndex
        const countRecAll = this.state.countRecordAll
        var progData = {}
        const progItemid = this.state.getarrProgress[itemid]
        if (progItemid !== undefined && progItemid !== "") {
            progData = JSON.parse(progItemid)
        }
        //console.log(progData)
        progData = { ...progData, [date]: countRec }
        //console.log(progData)
        var countRecMonth = 0
        var countRecAllMonth = 0
        Object.keys(progData).forEach(keys => {
            if (keys !== 'm') {
                countRecMonth += progData[keys][0]
                countRecAllMonth += progData[keys][1]
            }
        })
        //console.log(countRecMonth)
        //console.log(countRecAllMonth)
        progData = { ...progData, m: [countRecMonth, countRecAllMonth] }
        const todayCount = progData[date][0]
        progData = JSON.stringify(progData)
        var timeUpdate = this.state.timeDataUpdate
        timeUpdate[Number(date) - 1] = moment().format('HH:mm:ss DD-MM-YYYY')
        const jointimeUpdate = timeUpdate.join(";")
        console.log(jointimeUpdate)
        api.put(`/datarec/${id}/update/`, {
            [`d${indData}`]: txtData,
            [`dm${indData}`]: txtData2,
            [`msg${indData}`]: msgData,
            progress: progData,
            ngdayflag: ngDayData,
            cl: sumcl,
            xbar: sumxbar,
            update: jointimeUpdate
        })
            .then(res => {
                //console.log(res)
                this.setState({
                    savingStatus: false,
                    tableDataChange: false,
                    countRecorded: this.state.countRecorded + todayCount,
                    getarrProgress: { ...this.state.getarrProgress, [itemid]: progData },
                    ngDataProcess: ngDayData,
                    timeDataUpdate: timeUpdate,
                })
                console.log(timeUpdate)
                const ym = moment(this.state.pickedDate).format('YYYY-MM')
                const date = moment(this.state.pickedDate).format('D')
                const shift = this.state.shift
                if (!dataLenFin) {
                    this.getControlItemData(this.state.processText, this.state.processSelectedIndex, ym, date, false, shift)
                }
            })
            .catch(err => console.log(err.response.data))
    }

    saveWorkAmount = () => {
        this.setState({
            saveWork: true,
            isLoading: true
        }, () => {
            const pno = this.state.currentViewNo
            const ym = moment(this.state.pickedDate).format('YYYY-MM')
            api.get(`/datarec/data/${curSection}_${pno}_amount_${ym}_no`)
                .then(res => {
                    if (res.data.length === 0) {
                        //console.log("amount row not found")
                        api.post(`/datarec/createmulti/`, [{
                            section: curSection,
                            partno: pno,
                            process: "amount",
                            ym: ym,
                            shift: "A",
                            cl: ""
                        }, {
                            section: curSection,
                            partno: pno,
                            process: "amount",
                            ym: ym,
                            shift: "B",
                            cl: ""
                        }])
                            .then(res1 => {
                                //console.log(res1.data)
                                this.postWorkAmount(res1.data)
                            })
                            .catch(err => {
                                alert("create amount row error")
                                console.log(err.response.data)
                            })
                    } else {
                        //console.log(res.data)
                        this.postWorkAmount(res.data)
                    }
                })
                .catch(err => {
                    alert("check amount row error")
                    console.log(err)
                })
        })
    }

    postWorkAmount = (data) => {
        var id = null
        var arrAmount = { A: [], B: [] }
        var arrShiftAmount = ""
        data.forEach(item => {
            if (item.shift === this.state.shift) {
                id = item.id
                arrShiftAmount = item.progress
            }
            arrAmount = { ...arrAmount, [item.shift]: item.progress.split(";") }
        })
        if (id !== null) {
            const date = moment(this.state.pickedDate).format('D')
            const amt = document.getElementById('workamount').value
            arrShiftAmount = arrShiftAmount.split(";")
            arrShiftAmount[date - 1] = amt
            arrAmount = { ...arrAmount, [this.state.shift]: arrShiftAmount }
            arrShiftAmount = arrShiftAmount.join(";")
            //console.log(arrShiftAmount)
            api.put(`/datarec/${id}/update/`, {
                progress: arrShiftAmount,
            })
                .then(res => {
                    //console.log(res)
                    this.setState({
                        workAmount: arrAmount,
                        saveWork: false,
                        tableDataChange: false,
                        isLoading: false
                    })
                })
                .catch(err => {
                    alert("save work amount error")
                    console.log(err)
                })
        }
    }

    selectNextRecord = (r, c) => {
        var row = null
        var col = null
        const len = this.recordTable.props.data.length - 1
        const arrNoEditCell = this.state.nonEditCell
        if (r !== undefined && c !== undefined) {
            row = r
            col = c
        } else {
            row = this.state.currentRow
            col = this.state.currentCol
        }
        if (r !== "" && c !== "") {
            row += 1
            col += 10
            console.log(row)
            console.log(col)
            console.log(len)
            var loopFlag = true
            while (loopFlag) {
                if (row <= len) {
                    if (!arrNoEditCell.hasOwnProperty(`${row},${col}`)) {
                        //console.log("select next")
                        this.recordTable.cellEditContext.startEditing(row, col)
                        loopFlag = false
                    } else {
                        row++
                    }
                } else {
                    //last row
                    loopFlag = false
                    /*setTimeout(() => {
                        document.getElementById('saveDataBtn').focus()
                    }, 200);*/
                }
            }
        }
    }

    selectNextRecordwhenchange = (r, c) => {
        var row = null
        var col = null
        const len = this.whenchangerecordTable.props.data.length - 1
        const arrNoEditCell = this.state.whenchangenonEditCell
        if (r !== undefined && c !== undefined) {
            row = r
            col = c
        } else {
            row = this.state.currentRowwhenchange
            col = this.state.currentColwhenchange
        }
        if (r !== "" && c !== "") {
            row += 1
            col += 10
            console.log(row)
            console.log(col)
            console.log(len)
            var loopFlag = true
            while (loopFlag) {
                if (row <= len) {
                    if (!arrNoEditCell.hasOwnProperty(`${row},${col}`)) {
                        //console.log("select next")
                        this.whenchangerecordTable.cellEditContext.startEditing(row, col)
                        loopFlag = false
                    } else {
                        row++
                    }
                } else {
                    //last row
                    loopFlag = false
                    /*setTimeout(() => {
                        document.getElementById('saveDataBtn').focus()
                    }, 200);*/
                }
            }
        }
    }

    showPopOver = (r, c, itemid) => {
        //console.log(`${r},${c},${itemid}`)
        const msgData = this.state.inputMsg
        clearTimeout(this.timerHidePopOver)
        this.hoverPopOverTimeout = setTimeout(() => {
            //console.log("show")
            //console.log(msgData)
            if (msgData[itemid][c] !== "") {
                this.setState({
                    textPopOver: `${msgData[itemid][c]}`,
                    popOverTarget: `span${r}-${c}`,
                    renderPop: true
                })
            }
            this.timerHidePopOver = setTimeout(() => {
                this.hidePopOver()
            }, 2000);
        }, 500);
    }

    hidePopOver = () => {
        console.log("hide")
        clearTimeout(this.hoverPopOverTimeout)
        this.setState({
            renderPop: false,
        })
    }

    showCalendarProgress = () => {
        var styledTxtCalendar = `
            .react-datepicker__day--selected {
                border-radius: 0;
                background-color: transparent;
                color: black;
            }
            .react-datepicker__day--keyboard-selected {
                color: black;
                background: transparent;
            }
        `
        if (!this.state.calendarShow) {
            const arrProgress = this.state.progDayAllProc
            var arrProgressLevel = {}
            Object.keys(arrProgress).forEach(date => {
                const progRatio = arrProgress[date][0] / arrProgress[date][1]
                var result = 0
                if (progRatio === 1) {
                    result = 4
                } else if (progRatio >= 0.7) {
                    result = 3
                } else if (progRatio >= 0.5) {
                    result = 2
                } else if (progRatio >= 0.25) {
                    result = 1
                } else {
                    result = 0
                }
                arrProgressLevel = { ...arrProgressLevel, [date]: result }
            })
            //console.log(arrProgressLevel)
            Object.keys(arrProgressLevel).forEach(day => {
                var color = 'rgba(255,0,0,0.5)'
                if (arrProgressLevel[day] === 1) {
                    color = 'rgba(255,138,42,0.7)'
                } else if (arrProgressLevel[day] === 2) {
                    color = 'rgba(255,138,42,0.5)'
                } else if (arrProgressLevel[day] === 3) {
                    color = 'rgba(34,172,41,0.5)'
                } else if (arrProgressLevel[day] === 4) {
                    color = 'rgba(0,0,255,0.5)'
                }
                var dayid = day
                if (day.length === 1) {
                    dayid = `0${day}`
                }
                styledTxtCalendar = `${styledTxtCalendar}
                .react-datepicker__day--0${dayid} {
                    background-color: ${color};
                    border-radius: 0.3rem;
                    color: black;
                }
                `
            })
            styledTxtCalendar = `${styledTxtCalendar}
                .react-datepicker__day--outside-month {
                    color: grey;
                    background: transparent;
                }
                `
            //console.log(styledTxtCalendar)
        }
        this.setState({
            calendarShow: !this.state.calendarShow,
            styledProgressCalendar: styledTxtCalendar
        })
    }

    setDateValuebyProgress = (seldate) => {
        this.setState({
            calendarShow: false
        }, () => {
            this.setDateValue(seldate)
        })
    }

    unControlToolTipPack = (targetid, text) => {
        return (
            <UncontrolledTooltip placement="top" target={targetid} hideArrow={true} >
                {text}
            </UncontrolledTooltip>
        )
    }

    unControlToolTipPackHelp = (targetid) => {
        return (
            <UncontrolledTooltip placement="top" target={targetid} hideArrow={true} >
                <div className="rec-data-tooltip-help">
                    <div>
                        <FontAwesomeIcon icon={faBatteryEmpty} style={{ color: 'red' }} />
                        <i>{": 0~25%"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faBatteryQuarter} style={{ color: 'rgb(255,138,42)' }} />
                        <i>{": 25~50%"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faBatteryHalf} style={{ color: 'rgb(255,138,42)' }} />
                        <i>{": 50~75%"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faBatteryThreeQuarters} style={{ color: 'rgb(34,172,41)' }} />
                        <i>{": 75~99%"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faBatteryFull} style={{ color: 'rgb(120,120,255)' }} />
                        <i>{": 100%"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faExclamationCircle} style={{ color: 'red' }} />
                        <i>{": have NG"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'rgb(120,120,255)' }} />
                        <i>{": Checked"}</i>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'red' }} />
                        <i>{": Not check"}</i>
                    </div>
                </div>
            </UncontrolledTooltip>
        )
    }

    unControlToolTipPackRecord = (targetid) => {
        return (
            <UncontrolledTooltip placement="bottom" target={targetid} hideArrow={true} >
                <div className="rec-data-tooltip-record">
                    <li>Shortcut Keys</li>
                    <li>"Enter" : Record</li>
                    <li>"Esc" : Skip item</li>
                    <li>"Delete" : Clear Record</li>
                    <li>(Check sheet ONLY)</li>
                    <li>"O" : Check</li>
                    <li>"X" : Uncheck</li>
                </div>
            </UncontrolledTooltip>
        )
    }

    selectShift = (shift) => {
        if (this.state.tableDataChange) {
            const conf = window.confirm("Data's changes is not saved, are you sure to discard ?")
            if (!conf) {
                return
            }
        }
        this.setState({
            shift: shift,
            shiftChange: true,
        }, () => {
            this.setDateValue(this.state.pickedDate, true)
        })
    }

    selectTypeFilter = (type) => {
        this.setState({
        })
        var filterTable = []
        var filterTableWhenchange = []
        if (type === "All") {
            filterTable = this.state.recordTableData
            filterTableWhenchange = this.state.recordTableWhenchangeData
        } else {
            this.state.recordTableData.forEach(item => {
                if (item.method === type) {
                    filterTable = [...filterTable, item]
                }
            })
            this.state.recordTableWhenchangeData.forEach(item => {
                if (item.method === type) {
                    filterTableWhenchange = [...filterTableWhenchange, item]
                }
            })
        }
        //console.log(filterTable)
        this.setState({
            typeFilter: type,
            recordTableDataFiltered: filterTable,
            recordTableWhenchangeDataFiltered: filterTableWhenchange
        })
    }

    showGraphData = (row) => {
        this.setState({
            graphDataShow: !this.state.graphDataShow,
            graphItem: row.itemid,
            graphParam: row.parameter
        })
    }

    viewGraphData = (row) => {
        console.log(row)
        const gData = this.state.getarrData[row.itemid]
        const gData2 = this.state.getarrData2[row.itemid]
        const msgData = this.state.getarrMsg[row.itemid]
        const day = moment(this.state.pickedDate).daysInMonth()
        var arrXTicks = []
        for (var d = 1; d <= day; d++) {
            arrXTicks.push(d)
        }
        //console.log(row.itemid)
        //console.log(this.state.getarrData)
        //console.log(gData)
        if (gData !== undefined) {
            var arrGraphData = {}
            var arrGraphData2 = {}
            var arrGraphMsg = {}
            Object.keys(gData).forEach(key => {
                if (gData[key] !== "") {
                    arrGraphData = { ...arrGraphData, ...JSON.parse(gData[key]) }
                }
            })
            console.log(arrGraphData)
            Object.keys(gData2).forEach(key => {
                if (gData2[key] !== "") {
                    arrGraphData2 = { ...arrGraphData2, ...JSON.parse(gData2[key]) }
                }
            })
            console.log(arrGraphData2)
            Object.keys(msgData).forEach(key => {
                if (msgData[key] !== "") {
                    arrGraphMsg = { ...arrGraphMsg, ...JSON.parse(msgData[key]) }
                }
            })
            const pitchDate = 1 / (row.intervalcount * row.interval_n)
            var setGraphData = []
            var setGraphRData = {}
            var date = 0
            var val = 0
            var val2 = 0
            var maxG = null
            var minG = null
            var upper = null
            var lower = null
            var maxR = 0
            Object.keys(arrGraphData).forEach(key => {
                for (var i = 1; i <= (row.intervalcount * row.interval_n); i++) {
                    date = Number.parseInt(key) + (pitchDate * (i - 1))
                    val = Number.parseFloat(arrGraphData[key][i])
                    if (arrGraphData2[key] !== undefined) {
                        val2 = Number.parseFloat(arrGraphData2[key][i])
                    }
                    if (!isNaN(val)) {
                        var subGraphData = { x: date, y: val, msg: arrGraphMsg[key][i] }
                        if (!isNaN(val2) && row.calmethod === "Max & Min") {
                            subGraphData = { ...subGraphData, y2: val2 }
                        }
                        setGraphData = [...setGraphData, subGraphData]
                        if (maxG === null) {
                            maxG = val
                            minG = val
                        }
                        if (val > maxG) {
                            maxG = val
                        }
                        if (val < minG) {
                            minG = val
                        }
                        if (!isNaN(val2) && row.calmethod === "Max & Min") {
                            if (val2 > maxG) {
                                maxG = val2
                            }
                            if (val2 < minG) {
                                minG = val2
                            }
                        }
                    }
                }
            })
            /*Object.keys(arrGraphData2).forEach(key => {
                for (var i = 1; i <= row.intervalcount; i++) {
                    date = Number.parseInt(key) + (pitchDate * (i - 1))
                    val = Number.parseFloat(arrGraphData[key][i])
                    if (arrGraphData2[key] !== undefined) {
                        val2 = Number.parseFloat(arrGraphData2[key][i])
                    }
                    if (!isNaN(val)) {
                        setGraphData = [...setGraphData, { x: date, y: val, y2: val2, msg: arrGraphMsg[key][i] }]
                        if (maxG === null) {
                            maxG = val
                            minG = val
                        }
                        if (val > maxG) {
                            maxG = val
                        }
                        if (val < minG) {
                            minG = val
                        }
                        if (!isNaN(val2) && ) {
                            if (val2 > maxG) {
                                maxG = val2
                            }
                            if (val2 < minG) {
                                minG = val2
                            }
                        }
                    }
                }
            })*/
            console.log(maxG)
            console.log(minG)
            console.log(row.upperlimit)
            if (row.upperlimit !== "") {
                upper = Number.parseFloat(row.upperlimit)
                setGraphData.push(
                    { x: 0, upper: row.upperlimit },
                    { x: day + 2, upper: row.upperlimit }
                )
                if (maxG === null) {
                    maxG = row.upperlimit
                    minG = row.lowerlimit
                } else if (upper > maxG) {
                    maxG = row.upperlimit
                } else if (upper < minG) {
                    minG = row.upperlimit
                }
            }
            console.log(maxG)
            console.log(minG)
            console.log(row.lowerlimit)
            if (row.lowerlimit !== "") {
                lower = Number.parseFloat(row.lowerlimit)
                setGraphData.push(
                    { x: 0, lower: row.lowerlimit },
                    { x: day + 2, lower: row.lowerlimit }
                )
                if (maxG === null) {
                    maxG = row.upperlimit
                    minG = row.lowerlimit
                    //console.log("maxG null")
                } else if (lower > maxG) {
                    maxG = row.lowerlimit
                    //console.log("lower > maxG")
                } else if (lower < minG) {
                    minG = row.lowerlimit
                    //console.log("lower < minG")
                }
            }
            console.log(maxG)
            console.log(minG)
            var arrGraphRData = []
            //var RBar = 0
            var ucl = null
            var lcl = null
            var rFlag = false
            if (row.method === "x-R chart" || row.method === "x-Rs chart") {
                //upper = row.ucl
                //lower = row.lcl
                ucl = row.ucl
                lcl = row.lcl
                rFlag = true
                if (ucl !== "" && lcl !== "" && ucl !== undefined && lcl !== undefined) {
                    setGraphData.push(
                        { x: 0, ucl: ucl },
                        { x: day + 2, ucl: ucl },
                        { x: 0, xbar: row.xbar },
                        { x: day + 2, xbar: row.xbar },
                        { x: 0, lcl: lcl },
                        { x: day + 2, lcl: lcl },
                    )
                    if (maxG === null) {
                        maxG = row.ucl
                        minG = row.lcl
                    } else if (row.ucl > maxG) {
                        maxG = row.ucl
                    } else if (row.lcl < minG) {
                        minG = row.lcl
                    }
                }
                //set r data array
                setGraphData.forEach(data => {
                    if (data['y'] !== undefined) {
                        const k = parseInt(data['x'])
                        if (setGraphRData[k] === undefined) {
                            setGraphRData = { ...setGraphRData, [k]: [data['y']] }
                        } else {
                            setGraphRData = { ...setGraphRData, [k]: [...setGraphRData[k], data['y']] }
                        }
                    }
                })
                var maxRdata = -Infinity
                //var sumR = 0
                var xbefore = null
                Object.keys(setGraphRData).forEach(key => {
                    var max = -Infinity
                    var min = +Infinity
                    setGraphRData[key].forEach(item => {
                        if (item > max) {
                            max = item
                        }
                        if (item < min) {
                            min = item
                        }
                    })
                    var r = (max - min).toFixed(row.read)
                    if (row.method === "x-Rs chart") {
                        console.log(xbefore)
                        console.log(max)
                        if (xbefore !== null) {
                            r = (Math.abs(xbefore - max)).toFixed(row.read)
                        } else {
                            r = ""
                        }
                        xbefore = max
                    }
                    if (r > maxRdata) {
                        maxRdata = r
                    }
                    if (r !== "") {
                        //sumR += Number(r)
                        arrGraphRData = [...arrGraphRData, { x: key, y: r }]
                    }
                })
                maxR = maxRdata
                //console.log(sumR)
                //console.log(arrGraphRData.length)
                //RBar = sumR / arrGraphRData.length
                if (row.rcl !== "" && row.rcl !== undefined) {
                    if (Number(maxR) < Number(row.rcl)) {
                        maxR = row.rcl
                    }
                    arrGraphRData.push(
                        { x: 0, upper: row.rcl },
                        { x: day + 2, upper: row.rcl },
                        { x: 0, rbar: row.rbar },
                        { x: day + 2, rbar: row.rbar },
                    )
                }
                //console.log(setGraphRData)
                console.log(arrGraphRData)
            }
            maxR = Number.parseFloat(maxR)
            const pitchR = maxR / 5
            var yRTick = []
            for (var i = 0; i < 5; i++) {
                yRTick.push((pitchR * i).toFixed(row.read))
            }
            yRTick.push(Number(maxR).toFixed(row.read))
            //console.log(yRTick)
            maxG = Number.parseFloat(maxG)
            minG = Number.parseFloat(minG)
            const pitchY = (maxG - minG) / 10
            var yTick = []
            for (var i = 0; i < 10; i++) {
                yTick.push((minG + (pitchY * i)).toFixed(row.read))
            }
            yTick.push((minG - pitchY).toFixed(row.read))
            yTick.push((maxG + pitchY).toFixed(row.read))
            yTick.push(maxG.toFixed(row.read))
            console.log(setGraphData)
            //console.log(yTick)
            //console.log(pitchY)
            this.setState({
                graphData: setGraphData,
                pureGraphData: setGraphData,
                circleGraphData: [],
                centerData: [],
                graphRData: arrGraphRData,
                ySliderValue: [minG.toFixed(row.read), maxG.toFixed(row.read)],
                yDomain: [minG.toFixed(row.read) - pitchY, Number(maxG.toFixed(row.read)) + pitchY],
                maxY: maxG,
                minY: minG,
                yTicks: yTick,
                yRead: row.read,
                dayOfMonth: day,
                xSliderValue: [1, day],
                xTicks: arrXTicks,
                graphPitchData: pitchDate,
                graphUnit: row.unit,
                graphUpperLimit: upper,
                graphLowerLimit: lower,
                graphUCL: ucl,
                graphLCL: lcl,
                graphXBar: row.xbar,
                graphCpk: row.cpk,
                yRSliderValue: [0, maxR],
                yRDomain: [0 - pitchR, Number(maxR.toFixed(row.read)) + pitchR],
                maxR: maxR,
                yRTicks: yRTick,
                graphRUpper: row.rcl,
                graphRShow: rFlag,
                disableTrend: row.method !== "x-R chart" && row.method !== "x-Rs chart",
                showCircle: row.method === "x-R chart" || row.method === "x-Rs chart"
            }, () => {
                console.log(row.method)
                console.log(this.state.disableTrend)
                console.log(this.state.showCircle)
                this.showGraphData(row)
                if (row.method === "x-R chart" || row.method === "x-Rs chart") {
                    this.checkTrendData("graph")
                }
                //console.log(this.state.yRDomain)
                //console.log(this.state.graphRUpper)
            })
        } else {
            alert("Record Data is empty, please save data at least once")
        }
    }

    xSliderChange = value => {
        var arrTick = []
        for (var x = value[0]; x <= value[1]; x++) {
            arrTick.push(x)
        }
        this.setState({
            xSliderValue: [value[0], value[1]],
            xTicks: arrTick
        })
    }

    xSliderTooltip = (props) => {
        const { value, dragging, index, ...rest } = props
        return (
            <Handle key={index} {...rest}>
                <div>
                    <p>{value}</p>
                </div>
            </Handle>
        )
    }

    ySliderChange = (value) => {
        var arrTick = []
        const pitchY = (value[1] - value[0]) / 10
        for (var i = 0; i < 10; i++) {
            arrTick.push((value[0] + (pitchY * i)).toFixed(this.state.yRead))
        }
        arrTick.push((value[0] - pitchY).toFixed(this.state.yRead))
        arrTick.push((value[1] + pitchY).toFixed(this.state.yRead))
        arrTick.push(value[1].toFixed(this.state.yRead))
        this.setState({
            ySliderValue: [value[0], value[1]],
            yDomain: [value[0] - pitchY, value[1] + pitchY],
            yTicks: arrTick,
        })
    }

    ySliderTooltip = (props) => {
        const { value, dragging, index, ...rest } = props
        return (
            <Handle key={index} {...rest}>
                <div>
                    <p>{value}</p>
                </div>
            </Handle>
        )
    }

    yRSliderChange = (value) => {
        var arrTick = []
        const pitchY = (value[1] - value[0]) / 5
        for (var i = 0; i < 5; i++) {
            arrTick.push((value[0] + (pitchY * i)).toFixed(this.state.yRead))
        }
        arrTick.push(value[1].toFixed(this.state.yRead))
        this.setState({
            yRSliderValue: [value[0], value[1]],
            yRDomain: [value[0] - pitchY, value[1] + pitchY],
            yRTicks: arrTick,
        })
    }

    CustomToolTipChart = ({ active, payload, label }, unit, pitch, up, lo, uc, lc) => {
        if (active) {
            //console.log(payload)
            if (payload !== null) {
                if (payload[0] !== undefined) {
                    const date = parseInt(payload[0]['payload']['x'])
                    var ind = ((payload[0]['payload']['x'] - date) / this.state.graphPitchData) + 1
                    if (unit !== undefined) { //approve view
                        ind = ((payload[0]['payload']['x'] - date) / pitch) + 1
                    }
                    if (payload[0]['name'] === "Data") {
                        var upper = this.state.graphUpperLimit
                        var lower = this.state.graphLowerLimit
                        var ucl = this.state.graphUCL
                        var lcl = this.state.graphLCL
                        if (Empview) {
                            upper = up
                            lower = lo
                            ucl = uc
                            lcl = lc
                        }
                        var clas = "rec-data-graph-tooltip-ng"
                        var detail = false
                        var near = false
                        var nearmsg = []
                        if ((upper !== null && payload[0]['payload']['y'] > upper) ||
                            (lower !== null && payload[0]['payload']['y'] < lower)) {
                            clas = "rec-data-graph-tooltip-ng"
                            detail = true
                        } else if ((ucl !== null && payload[0]['payload']['y'] > ucl) ||
                            (lcl !== null && payload[0]['payload']['y'] < lcl) ||
                            payload[0]['payload']['comment'] === 1) {
                            clas = "rec-data-graph-tooltip-warn"
                            detail = true
                        } else if (payload[0]['payload']['near'] === 1) {
                            clas = "rec-data-graph-tooltip-near"
                            near = true
                            payload[0]['payload']['nearmsg'].forEach((i, ind) => {
                                var msg = ""
                                if (i === 2) {
                                    msg = `nearly become "Run 7 points continuously"`
                                } else if (i === 3) {
                                    msg = `nearly become "Run up/down 7 points continuously"`
                                } else if (i === 4) {
                                    msg = `nearly become "Incline 12/14 or 10/11 points"`
                                } else if (i === 5) {
                                    msg = `nearly become "Near Control Limit 2/3 points"`
                                }
                                nearmsg.push(
                                    <p key={ind}>{msg}</p>
                                )
                            })
                        } else {
                            clas = "rec-data-graph-tooltip"
                        }
                        var datMsg = ""
                        var dataMin = false
                        if (payload[0]['payload']['y2'] !== undefined) {
                            datMsg = payload[0]['payload']['y2']
                            dataMin = true
                        }
                        return (
                            <div className={clas}>
                                <p>{`Date : ${date}-${ind}`}</p>
                                <p>{unit === undefined ?
                                    `Data : ${payload[0].value} ${this.state.graphUnit}`
                                    :
                                    `Data : ${payload[0].value} ${unit}`
                                }
                                </p>
                                {dataMin && <p>{`Data (Min): ${datMsg} ${this.state.graphUnit}`}</p>}
                                {detail && <p>{`Details : ${payload[0]['payload']['msg']}`}</p>}
                                {near && nearmsg}
                            </div>
                        )
                        //
                        /*if (payload[0]['payload']['msg'] === "" || payload[0]['payload']['msg'] === undefined) {
                            return (
                                <div className="rec-data-graph-tooltip">
                                    <p>{`Date : ${date}-${ind}`}</p>
                                    <p>{`Data : ${payload[0].value} ${this.state.graphUnit}`}</p>
                                </div>
                            )
                        } else {
                            const upper = this.state.graphUpperLimit
                            const lower = this.state.graphLowerLimit
                            const ucl = this.state.graphUCL
                            const lcl = this.state.graphLCL
                            var clas = "rec-data-graph-tooltip-ng"
                            if ((ucl !== null && payload[0]['payload']['y'] > ucl) ||
                                (lcl !== null && payload[0]['payload']['y'] < lcl) ||
                                payload[0]['payload']['comment'] === 1) {
                                clas = "rec-data-graph-tooltip-warn"
                            }
                            if ((upper !== null && payload[0]['payload']['y'] > upper) ||
                                (lower !== null && payload[0]['payload']['y'] < lower)) {
                                clas = "rec-data-graph-tooltip-ng"
                            }
                            return (
                                <div className={clas}>
                                    <p>{`Date : ${date}-${ind}`}</p>
                                    <p>{`Data : ${payload[0].value} ${this.state.graphUnit}`}</p>
                                    <p>{`Details : ${payload[0]['payload']['msg']}`}</p>
                                </div>
                            )
                        }*/
                    }
                }
            }
        }
        return null
    }

    customDot = (props, up, lo, uc, lc) => {
        const { cx, cy, stroke, payload, value } = props
        //console.log(`${payload['x']}/${payload['y']}/${cx}/${cy}`)
        var upper = this.state.graphUpperLimit
        var lower = this.state.graphLowerLimit
        var ucl = this.state.graphUCL
        var lcl = this.state.graphLCL
        if (Empview) {
            upper = up
            lower = lo
            ucl = uc
            lcl = lc
        }
        var shape = []
        var payY = payload['y']
        if (payY !== undefined) {
            var cFill = ""
            var cStroke = ""
            if ((upper !== null && payY > upper) ||
                (lower !== null && payY < lower)) {
                //ng
                cFill = "rgb(255,150,150)"
                cStroke = "red"
                shape.push(
                    <rect key={cx} width="10" height="10" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            } else if ((ucl !== null && ucl !== "" && payY > ucl) ||
                (lcl !== null && lcl !== "" && payY < lcl) || payload['comment'] === 1) {
                //warning
                cFill = "rgb(255,200,0)"
                cStroke = "#525252"
                shape.push(
                    <polygon key={cx} points="5,0 0,10 10,10" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            } else if (payload['near'] === 1) {
                //near
                cFill = "rgb(80,255,0)"
                cStroke = "#525252"
                shape.push(
                    <circle key={cx} cx="5" cy="5" r="5" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            } else {
                //ok
                cFill = "rgb(0,70,255)"
                cStroke = "#525252"
                shape.push(
                    <circle key={cx} cx="5" cy="5" r="5" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            }
            return (
                <svg x={cx - 5} y={cy - 5} width={10} height={10}>
                    {shape}
                </svg>
            )
        }
        return null
    }

    customDotMin = (props) => {
        const { cx, cy, stroke, payload, value } = props
        //console.log(`${payload['x']}/${payload['y']}/${cx}/${cy}`)
        const upper = this.state.graphUpperLimit
        const lower = this.state.graphLowerLimit
        const ucl = this.state.graphUCL
        const lcl = this.state.graphLCL
        var shape = []
        var payY = payload['y2']
        if (payY !== undefined) {
            var cFill = ""
            var cStroke = ""
            if ((upper !== null && payY > upper) ||
                (lower !== null && payY < lower)) {
                //ng
                cFill = "rgb(255,150,150)"
                cStroke = "red"
                shape.push(
                    <rect key={cx} width="10" height="10" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            } else if ((ucl !== null && ucl !== "" && payY > ucl) ||
                (lcl !== null && lcl !== "" && payY < lcl) || payload['comment'] === 1) {
                //warning
                cFill = "rgb(255,200,0)"
                cStroke = "#525252"
                shape.push(
                    <polygon key={cx} points="5,0 0,10 10,10" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            } else if (payload['near'] === 1) {
                //near
                cFill = "rgb(80,255,0)"
                cStroke = "#525252"
                shape.push(
                    <circle key={cx} cx="5" cy="5" r="5" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            } else {
                //ok
                cFill = "rgb(100,230,255)"
                cStroke = "#525252"
                shape.push(
                    <circle key={cx} cx="5" cy="5" r="5" fill={cFill} stroke={cStroke} strokeWidth="1" />
                )
            }
            return (
                <svg x={cx - 5} y={cy - 5} width={10} height={10}>
                    {shape}
                </svg>
            )
        }
        return null
    }

    customDotR = (props, upper) => {
        const { cx, cy, stroke, payload, value } = props
        if (payload['y'] !== undefined) {
            var cFill = ""
            var cStroke = ""
            const rcl = Number(this.state.graphRUpper)
            if (this.state.graphUpperLimit !== null && payload['y'] > rcl
                && this.state.graphRUpper !== "") {
                //ng
                cFill = "rgb(255,200,0)"
                cStroke = "#525252"
            } else {
                if (Empview && payload['y'] > upper) {
                    cFill = "rgb(255,200,0)"
                    cStroke = "#525252"
                } else {
                    cFill = "rgb(0,70,255)"
                    cStroke = "#525252"
                }
            }
            return (
                <svg x={cx - 4} y={cy - 4} width={8} height={8}>
                    <circle cx="4" cy="4" r="4" fill={cFill} stroke={cStroke} strokeWidth="1" />
                </svg>
            )
        }
        return null
    }

    customLabelUpper = (props, unit) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 350) {
            //console.log(y)
            return (
                <text className="rec-data-graph-limit" x={675} y={y} dy={-4} textAnchor="end">
                    {Empview ?
                        `Upper limit : ${value} ${unit}`
                        :
                        `Upper limit : ${value} ${this.state.graphUnit}`
                    }
                </text>
            )
        }
        return null
    }

    customLabelLower = (props, unit) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 350) {
            return (
                <text className="rec-data-graph-limit" x={675} y={y} dy={15} textAnchor="end">
                    {Empview ?
                        `Lower limit : ${value} ${unit}`
                        :
                        `Lower limit : ${value} ${this.state.graphUnit}`
                    }
                </text>
            )
        }
    }

    customLabelUCL = (props, unit) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 350) {
            return (
                <text className="rec-data-graph-control" x={675} y={y} dy={-4} textAnchor="end">
                    {Empview ?
                        `UCL : ${value} ${unit}`
                        :
                        `UCL : ${value} ${this.state.graphUnit}`
                    }
                </text>
            )
        }
    }

    customLabelXbar = (props, unit,cpk) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 350) {
            return (
                <>
                    <text className="rec-data-graph-control" x={675} y={y} dy={-4} textAnchor="end">
                        {Empview ?
                            `X bar : ${value} ${unit}`
                            :
                            `X bar : ${value} ${this.state.graphUnit}`
                        }
                    </text>
                    <text className="rec-data-graph-control" x={675} y={y} dy={12} textAnchor="end">
                        { cpk ?
                            `Cpk : ${cpk}`
                            :
                            `Cpk : ${this.state.graphCpk}`
                        }
                    </text>
                </>
            )
        }
    }

    customLabelLCL = (props, unit) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 350) {
            return (
                <text className="rec-data-graph-control" x={675} y={y} dy={15} textAnchor="end">
                    {Empview ?
                        `LCL : ${value} ${unit}`
                        :
                        `LCL : ${value} ${this.state.graphUnit}`
                    }
                </text>
            )
        }
    }

    customLabelRUCL = (props, unit) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 150) {
            //console.log(y)
            return (
                <text className="rec-data-graph-control" x={675} y={y} dy={-4} textAnchor="end">
                    {Empview ?
                        `R UCL : ${value} ${unit}`
                        :
                        `R UCL : ${value} ${this.state.graphUnit}`
                    }
                </text>
            )
        }
    }

    customLabelRbar = (props, unit) => {
        const { x, y, stroke, value } = props
        //console.log(props)
        if (value !== undefined && y > 20 && y < 150) {
            return (
                <text className="rec-data-graph-control" x={675} y={y} dy={-4} textAnchor="end">
                    {Empview ?
                        `R bar : ${value} ${unit}`
                        :
                        `R bar : ${value} ${this.state.graphUnit}`
                    }
                </text>
            )
        }
    }

    viewCheckData = (row) => {
        const checkData = this.state.getarrData[row.itemid]
        if (checkData !== undefined) {
            var arrCheckData = {}
            Object.keys(checkData).forEach(key => {
                if (checkData[key] !== "") {
                    arrCheckData = { ...arrCheckData, ...JSON.parse(checkData[key]) }
                }
            })
            //console.log(arrCheckData)
            const day = moment(this.state.pickedDate).daysInMonth()
            var tableCheckData = []
            for (var i = 1; i <= (row.intervalcount * row.interval_n); i++) {
                tableCheckData.push({ list: i })
            }
            console.log(tableCheckData)
            Object.keys(arrCheckData).forEach(key => {
                for (var j = 0; j < (row.intervalcount * row.interval_n); j++) {
                    tableCheckData[j] = { ...tableCheckData[j], [key]: arrCheckData[key][`${j + 1}`] }
                }
            })
            console.log(tableCheckData)
            this.setState({
                tableCheckData: tableCheckData,
                dayOfMonth: day
            }, () => {
                this.showCheckData(row)
            })
        }
    }

    showCheckData = (row) => {
        this.setState({
            checkDataShow: !this.state.checkDataShow,
            graphItem: row.itemid,
            graphParam: row.parameter
        })
    }

    workAmountChange = () => {
        this.setState({
            tableDataChange: true
        })
    }

    showCalendarAmount = () => {
        const day = moment(this.state.pickedDate).daysInMonth()
        const arrAmount = this.state.workAmount
        var arrTableAmount = []
        var arrSum = { list: "Sum" }
        Object.keys(arrAmount).forEach(key => {
            var tempArr = {}
            var sumVal = 0
            arrAmount[key].forEach((item, ind) => {
                var val = item
                if (val === "" || val === undefined) {
                    val = 0
                } else {
                    val = Number(item)
                }
                sumVal += val
                tempArr = { ...tempArr, [ind + 1]: val }
            })
            tempArr = { ...tempArr, sum: sumVal, list: key }
            arrTableAmount = [...arrTableAmount, tempArr]
        })
        var sumAll = 0
        var arrGraphAmount = []
        console.log(arrAmount)
        arrAmount['A'].forEach((item, ind) => {
            var valA = item
            var valB = arrAmount['B'][ind]
            //console.log(valA + "/" + valB)
            if (valA === "" || valA === undefined) {
                valA = 0
            } else {
                valA = Number(item)
            }
            if (valB === "" || valB === undefined) {
                valB = 0
            } else {
                valB = Number(valB)
            }
            sumAll += valA + valB
            arrSum = { ...arrSum, [ind + 1]: valA + valB }
        })
        arrSum = { ...arrSum, sum: sumAll }
        arrTableAmount = [...arrTableAmount, arrSum]
        //console.log(arrTableAmount)
        var acc = 0
        for (var i = 1; i <= day; i++) {
            var a = arrTableAmount[0][i]
            var b = arrTableAmount[1][i]
            if (a === undefined) {
                a = 0
            }
            if (b === undefined) {
                b = 0
            }
            acc += a + b
            arrGraphAmount = [...arrGraphAmount, {
                d: i,
                amtA: a,
                amtB: b,
                acc: acc,
            }]
        }
        this.setState({
            dayOfMonth: day,
            tableAmountData: arrTableAmount,
            graphAmount: arrGraphAmount
        }, () => {
            this.trigShowCalendarAmount()
        })
    }

    trigShowCalendarAmount = () => {
        this.setState({
            calendarAmountShow: !this.state.calendarAmountShow
        })
    }

    checkTrendData = (method, itemid, newvalue, col, row) => {
        var arrData = []
        var arrDataX = []
        var indNewValue = null
        if (method === "graph") {
            const gData = this.state.graphData
            gData.forEach(item => {
                if (item.y !== undefined) {
                    arrData.push(item.y)
                    arrDataX.push(item.x)
                }
            })
        } else if (method === "record") {
            const recData = this.state.getarrData[itemid]
            console.log(recData)
            const day = moment(this.state.pickedDate).format('D')
            var dTarget = ""
            if (day >= 1 && day <= 8) {
                dTarget = '1'
            } else if (day >= 9 && day <= 16) {
                dTarget = '2'
            } else if (day >= 17 && day <= 24) {
                dTarget = '3'
            } else {
                dTarget = '4'
            }
            if (recData !== undefined) {
                Object.keys(recData).forEach(key => { //d1-4
                    if (recData[key] !== "" && key !== "id") {
                        //console.log(JSON.parse(recData[key]))
                        var recDataKey = JSON.parse(recData[key])
                        if (key === dTarget) {
                            recDataKey[day] = { ...recDataKey[day], [col['i']]: Number(newvalue) }
                        }
                        console.log(recDataKey)
                        Object.keys(recDataKey).forEach(date => { //day loop
                            //console.log(recDataKey[date])
                            Object.keys(recDataKey[date]).forEach(dat => { //interval loop
                                if (recDataKey[date][dat] !== "") {
                                    console.log(recDataKey[date][dat])
                                    arrData.push(Number(recDataKey[date][dat]))
                                    if (date === day && dat === col['i'].toString()) {
                                        indNewValue = arrData.length - 1
                                    }
                                }
                            })
                        })
                    }
                })
            }
        }
        console.log(arrData)
        if (arrData.length === 0) {
            console.log("arrData is empty")
            return 0
        }
        var abnormalFlag = [false, false, false, false, false, false, false]
        var abnormalIndex = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
        var abnormalnearFlag = [false, false, false, false, false, false, false]
        var abnormalnearIndex = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
        //when view graph
        var upper = this.state.graphUpperLimit
        var lower = this.state.graphLowerLimit
        var ucl = this.state.graphUCL
        var lcl = this.state.graphLCL
        var xbar = this.state.graphXBar
        if (method === "record") {
            //console.log(row)
            upper = row['upperlimit']
            lower = row['lowerlimit']
            ucl = row['ucl']
            lcl = row['lcl']
            xbar = row['xbar']
        }
        console.log(ucl)
        if (ucl === "" || lcl === "") {
            return 0
        }
        const len = arrData.length
        //console.log(len)
        arrData.forEach((data, ind) => {
            //check abnormal case1 [0] :over upper and lower limit
            //check abnormal case1-1 [1] :over ucl and lcl
            if (upper !== null && data > upper) {
                abnormalFlag[0] = true
                abnormalIndex[0].push(ind)
            } else if (ucl !== null && data > ucl) {
                abnormalFlag[1] = true
                abnormalIndex[1].push(ind)
            }
            if (lower !== null && data < lower) {
                abnormalFlag[0] = true
                abnormalIndex[0].push(ind)
            } else if (lcl !== null && data < lcl) {
                abnormalFlag[1] = true
                abnormalIndex[1].push(ind)
            }
            if (len > 7 && xbar !== undefined) {
                var f = false
                //check abnormal
                for (var i = 6; i <= len - 1; i++) {
                    //check abnormal case2 [2] :run 7 continue
                    if (arrData[i - 6] >= xbar && arrData[i - 5] >= xbar && arrData[i - 4] >= xbar
                        && arrData[i - 3] >= xbar && arrData[i - 2] >= xbar && arrData[i - 1] >= xbar
                        && arrData[i] >= xbar) {
                        abnormalFlag[2] = true
                        abnormalIndex[2].push([i - 6, i])
                        if (i + 7 > len - 1) {
                            break
                        } else {
                            i += 7
                        }
                    }
                    if (arrData[i - 6] <= xbar && arrData[i - 5] <= xbar && arrData[i - 4] <= xbar
                        && arrData[i - 3] <= xbar && arrData[i - 2] <= xbar && arrData[i - 1] <= xbar
                        && arrData[i] <= xbar) {
                        abnormalFlag[2] = true
                        abnormalIndex[2].push([i - 6, i])
                        if (i + 7 > len - 1) {
                            break
                        } else {
                            i += 7
                        }
                    }
                }
                for (var i = 6; i <= len - 1; i++) {
                    //check abnormal case3 [3] :run up/down 7 continue
                    if (arrData[i - 6] >= arrData[i - 5] && arrData[i - 5] >= arrData[i - 4] && arrData[i - 4] >= arrData[i - 3]
                        && arrData[i - 3] >= arrData[i - 2] && arrData[i - 2] >= arrData[i - 1] && arrData[i - 1] >= arrData[i]) {
                        abnormalFlag[3] = true
                        abnormalIndex[3].push([i - 6, i])
                        if (i + 7 > len - 1) {
                            break
                        } else {
                            i += 7
                        }
                    }
                    //run up 7 continue
                    if (arrData[i - 6] <= arrData[i - 5] && arrData[i - 5] <= arrData[i - 4] && arrData[i - 4] <= arrData[i - 3]
                        && arrData[i - 3] <= arrData[i - 2] && arrData[i - 2] <= arrData[i - 1] && arrData[i - 1] <= arrData[i]) {
                        abnormalFlag[3] = true
                        abnormalIndex[3].push([i - 6, i])
                        if (i + 7 > len - 1) {
                            break
                        } else {
                            i += 7
                        }
                    }
                }
                //check near 5
                for (var i = 4; i <= len - 1; i++) {
                    f = false
                    //check abnormal case2 [2] :run 7 continue
                    if (arrData[i - 4] >= xbar
                        && arrData[i - 3] >= xbar && arrData[i - 2] >= xbar && arrData[i - 1] >= xbar
                        && arrData[i] >= xbar) {
                        abnormalIndex[2].forEach(arr => {
                            if (i === arr[0] || i - 4 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[2] = true
                        abnormalnearIndex[2].push([i - 4, i])
                        if (i + 5 > len - 1) {
                            break
                        } else {
                            i += 5
                        }
                    }
                    if (arrData[i - 4] <= xbar
                        && arrData[i - 3] <= xbar && arrData[i - 2] <= xbar && arrData[i - 1] <= xbar
                        && arrData[i] <= xbar) {
                        abnormalIndex[2].forEach(arr => {
                            if (i === arr[0] || i - 4 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[2] = true
                        abnormalnearIndex[2].push([i - 4, i])
                        if (i + 5 > len - 1) {
                            break
                        } else {
                            i += 5
                        }
                    }
                }
                for (var i = 4; i <= len - 1; i++) {
                    f = false
                    //check abnormal case3 [3] :run up/down 7 continue
                    if (arrData[i - 4] >= arrData[i - 3]
                        && arrData[i - 3] >= arrData[i - 2] && arrData[i - 2] >= arrData[i - 1] && arrData[i - 1] >= arrData[i]) {
                        abnormalIndex[3].forEach(arr => {
                            if (i === arr[0] || i - 4 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[3] = true
                        abnormalnearIndex[3].push([i - 4, i])
                        if (i + 5 > len - 1) {
                            break
                        } else {
                            i += 5
                        }
                    }
                    //run up 7 continue
                    if (arrData[i - 4] <= arrData[i - 3]
                        && arrData[i - 3] <= arrData[i - 2] && arrData[i - 2] <= arrData[i - 1] && arrData[i - 1] <= arrData[i]) {
                        abnormalIndex[3].forEach(arr => {
                            if (i === arr[0] || i - 4 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[3] = true
                        abnormalnearIndex[3].push([i - 4, i])
                        if (i + 5 > len - 1) {
                            break
                        } else {
                            i += 5
                        }
                    }
                }
                //check near 6
                for (var i = 5; i <= len - 1; i++) {
                    f = false
                    //check abnormal case2 [2] :run 7 continue
                    if (arrData[i - 5] >= xbar && arrData[i - 4] >= xbar
                        && arrData[i - 3] >= xbar && arrData[i - 2] >= xbar && arrData[i - 1] >= xbar
                        && arrData[i] >= xbar) {
                        abnormalIndex[2].forEach(arr => {
                            if (i === arr[0] || i - 5 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[2] = true
                        abnormalnearIndex[2].push([i - 5, i])
                        if (i + 6 > len - 1) {
                            break
                        } else {
                            i += 6
                        }
                    }
                    if (arrData[i - 5] <= xbar && arrData[i - 4] <= xbar
                        && arrData[i - 3] <= xbar && arrData[i - 2] <= xbar && arrData[i - 1] <= xbar
                        && arrData[i] <= xbar) {
                        abnormalIndex[2].forEach(arr => {
                            if (i === arr[0] || i - 5 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[2] = true
                        abnormalnearIndex[2].push([i - 5, i])
                        if (i + 6 > len - 1) {
                            break
                        } else {
                            i += 6
                        }
                    }
                }
                for (var i = 5; i <= len - 1; i++) {
                    f = false
                    //check abnormal case3 [3] :run up/down 7 continue
                    if (arrData[i - 5] >= arrData[i - 4] && arrData[i - 4] >= arrData[i - 3]
                        && arrData[i - 3] >= arrData[i - 2] && arrData[i - 2] >= arrData[i - 1] && arrData[i - 1] >= arrData[i]) {
                        abnormalIndex[3].forEach(arr => {
                            if (i === arr[0] || i - 5 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[3] = true
                        abnormalnearIndex[3].push([i - 5, i])
                        if (i + 6 > len - 1) {
                            break
                        } else {
                            i += 6
                        }
                    }
                    //run up 7 continue
                    if (arrData[i - 5] <= arrData[i - 4] && arrData[i - 4] <= arrData[i - 3]
                        && arrData[i - 3] <= arrData[i - 2] && arrData[i - 2] <= arrData[i - 1] && arrData[i - 1] <= arrData[i]) {
                        abnormalIndex[3].forEach(arr => {
                            if (i === arr[0] || i - 5 === arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[3] = true
                        abnormalnearIndex[3].push([i - 5, i])
                        if (i + 6 > len - 1) {
                            break
                        } else {
                            i += 6
                        }
                    }
                }
            }
            //check abnormal case4 [4] :incline 10/11 point
            //check abnormal
            if (len > 11 && xbar !== undefined) {
                for (i = 10; i <= len - 1; i++) {
                    var iUpper = 0
                    var iLower = 0
                    for (var j = 10; j >= 0; j--) {
                        if (arrData[i - j] >= xbar) {
                            iUpper++
                        } else {
                            iLower++
                        }
                    }
                    if (iUpper >= 10 || iLower >= 10) {
                        abnormalFlag[4] = true
                        abnormalIndex[4].push([i - 10, i])
                        if (i + 11 > len - 1) {
                            break
                        } else {
                            i += 11
                        }
                    }
                }
            }
            //check near 9
            if (len > 9 && xbar !== undefined) {
                for (i = 8; i <= len - 1; i++) {
                    f = false
                    iUpper = 0
                    iLower = 0
                    for (var j = 8; j >= 0; j--) {
                        if (arrData[i - j] >= xbar) {
                            iUpper++
                        } else {
                            iLower++
                        }
                    }
                    if (iUpper >= 8 || iLower >= 8) {
                        abnormalIndex[4].forEach(arr => {
                            if (i >= arr[0] && i - 5 <= arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[4] = true
                        abnormalnearIndex[4].push([i - 8, i])
                        if (i + 9 > len - 1) {
                            break
                        } else {
                            i += 9
                        }
                    }
                }
            }
            //check near 10
            if (len > 10 && xbar !== undefined) {
                for (i = 9; i <= len - 1; i++) {
                    f = false
                    iUpper = 0
                    iLower = 0
                    for (var j = 9; j >= 0; j--) {
                        if (arrData[i - j] >= xbar) {
                            iUpper++
                        } else {
                            iLower++
                        }
                    }
                    if (iUpper >= 9 || iLower >= 9) {
                        abnormalIndex[4].forEach(arr => {
                            if (i >= arr[0] && i - 5 <= arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[4] = true
                        abnormalnearIndex[4].push([i - 9, i])
                        if (i + 10 > len - 1) {
                            break
                        } else {
                            i += 10
                        }
                    }
                }
            }

            //check abnormal case4 [4] :incline 12/14 point
            //check abnormal
            if (len > 14 && xbar !== undefined) {
                for (i = 13; i <= len - 1; i++) {
                    iUpper = 0
                    iLower = 0
                    for (j = 13; j >= 0; j--) {
                        if (arrData[i - j] >= xbar) {
                            iUpper++
                        } else {
                            iLower++
                        }
                    }
                    if (iUpper >= 12 || iLower >= 12) {
                        abnormalFlag[4] = true
                        abnormalIndex[4].push([i - 13, i])
                        //console.log(i)
                        if (i + 14 > len - 1) {
                            break
                        } else {
                            i += 14
                        }
                    }
                }
            }
            //check near 12
            if (len > 12 && xbar !== undefined) {
                for (i = 11; i <= len - 1; i++) {
                    f = false
                    iUpper = 0
                    iLower = 0
                    for (j = 11; j >= 0; j--) {
                        if (arrData[i - j] >= xbar) {
                            iUpper++
                        } else {
                            iLower++
                        }
                    }
                    if (iUpper >= 10 || iLower >= 10) {
                        abnormalIndex[4].forEach(arr => {
                            if (i >= arr[0] && i - 5 <= arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[4] = true
                        abnormalnearIndex[4].push([i - 11, i])
                        //console.log(i)
                        if (i + 12 > len - 1) {
                            break
                        } else {
                            i += 12
                        }
                    }
                }
            }
            //check near 13
            if (len > 13 && xbar !== undefined) {
                for (i = 12; i <= len - 1; i++) {
                    f = false
                    iUpper = 0
                    iLower = 0
                    for (j = 12; j >= 0; j--) {
                        if (arrData[i - j] >= xbar) {
                            iUpper++
                        } else {
                            iLower++
                        }
                    }
                    if (iUpper >= 11 || iLower >= 11) {
                        abnormalIndex[4].forEach(arr => {
                            if (i >= arr[0] && i - 5 <= arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[4] = true
                        abnormalnearIndex[4].push([i - 12, i])
                        //console.log(i)
                        if (i + 13 > len - 1) {
                            break
                        } else {
                            i += 13
                        }
                    }
                }
            }
            //check abnormal case5 [5]  :near limit 2/3 point
            //check near 2
            if (len > 2 && xbar !== undefined) {
                const nearUCLLimit = Number(xbar) + ((ucl - xbar) * 2 / 3)
                const nearLCLLimit = Number(xbar) - ((xbar - lcl) * 2 / 3)
                for (i = 1; i <= len - 1; i++) {
                    f = false
                    iUpper = 0
                    iLower = 0
                    for (j = 1; j >= 0; j--) {
                        if (arrData[i - j] >= nearUCLLimit && arrData[i - j] <= upper) {
                            iUpper++
                        }
                        if (arrData[i - j] > upper) {
                            iUpper--
                        }
                        if (arrData[i - j] <= nearLCLLimit && arrData[i - j] >= lower) {
                            iLower++
                        }
                        if (arrData[i - j] < lower) {
                            iLower--
                        }
                    }
                    //console.log(`${i}/${iUpper}/${iLower}`)
                    if (iUpper + iLower >= 1) {
                        abnormalIndex[5].forEach(arr => {
                            if (i >= arr[0] && i - 5 <= arr[1]) {
                                f = true
                            }
                        })
                        if (f) continue
                        abnormalnearFlag[5] = true
                        abnormalnearIndex[5].push([i - 1, i])
                        if (i + 2 > len - 1) {
                            break
                        } else {
                            i += 2
                        }
                    }
                }
            }
            //check abnormal
            if (len > 3 && xbar !== undefined) {
                const nearUCLLimit = Number(xbar) + ((ucl - xbar) * 2 / 3)
                const nearLCLLimit = Number(xbar) - ((xbar - lcl) * 2 / 3)
                for (i = 2; i <= len - 1; i++) {
                    iUpper = 0
                    iLower = 0
                    for (j = 2; j >= 0; j--) {
                        if (arrData[i - j] >= nearUCLLimit && arrData[i - j] <= upper) {
                            iUpper++
                        }
                        if (arrData[i - j] > upper) {
                            iUpper--
                        }
                        if (arrData[i - j] <= nearLCLLimit && arrData[i - j] >= lower) {
                            iLower++
                        }
                        if (arrData[i - j] < lower) {
                            iLower--
                        }
                    }
                    //console.log(`${i}/${iUpper}/${iLower}`)
                    if (iUpper + iLower >= 2) {
                        abnormalFlag[5] = true
                        abnormalIndex[5].push([i - 2, i])
                        if (i + 3 > len - 1) {
                            break
                        } else {
                            i += 3
                        }
                    }
                }
            }
            //check abnormal case6 [6] :cycle form
            var arrTrendIndex = []
            if (len > 2) {
                var arrTrend = []
                var trend = 0
                var freq = 0
                for (i = 1; i <= len - 1; i++) {
                    if (arrData[i] >= arrData[i - 1]) { //rise trend= 1
                        if (trend === -1) {
                            arrTrend.push(trend * freq)
                            arrTrendIndex.push([i - 1 - freq, i - 1])
                            freq = 0
                        }
                        trend = 1
                    } else { //rest trend= -1
                        if (trend === 1) {
                            arrTrend.push(trend * freq)
                            arrTrendIndex.push([i - 1 - freq, i - 1])
                            freq = 0
                        }
                        trend = -1
                    }
                    freq++
                    if (i === len - 1) {
                        arrTrend.push(trend * freq)
                        arrTrendIndex.push([i - 1 - freq, i - 1])
                    }
                }
                //console.log(arrTrend)
                //console.log(arrTrendIndex)
                //check condition cycle >=4 over 5times?
                var trendFreq = 0
                var trendCont = 0
                arrTrend.forEach((data, ind) => {
                    if (data >= 4) {
                        if (trendFreq === -1 || trendFreq === 0) {
                            trendCont++
                        } else {
                            trendCont = 0
                        }
                        trendFreq = 1
                    } else if (data <= -4) {
                        if (trendFreq === 1 || trendFreq === 0) {
                            trendCont++
                        } else {
                            trendCont = 0
                        }
                        trendFreq = -1
                    } else {
                        trendCont = 0
                        trendFreq = 0
                    }
                    if (trendCont === 5) {
                        abnormalFlag[6] = true
                        abnormalIndex[6].push([arrTrendIndex[ind - 4][0], arrTrendIndex[ind][1]])
                        trendCont = 0
                    }
                })
            }
            //console.log(arrTrendIndex)
        })
        /*var arrAbnormalIndex = Object.keys(abnormalIndex).map(key => {
            return ([...new Set(abnormalIndex[key])])
        })*/
        var arrAbnormalIndex = []
        arrAbnormalIndex.push([...new Set(abnormalIndex[0])])
        Object.keys(abnormalIndex).forEach(key => {
            if (key !== "0") {
                var tempArrIndex = []
                abnormalIndex[key].forEach(data => {
                    //console.log(data)
                    if (!JSON.stringify(tempArrIndex).includes(JSON.stringify(data))) {
                        tempArrIndex.push(data)
                    }
                })
                //console.log(tempArrIndex)
                arrAbnormalIndex.push(tempArrIndex)
            }
        })
        var arrAbnormalnearIndex = []
        arrAbnormalnearIndex.push([...new Set(abnormalnearIndex[0])])
        Object.keys(abnormalnearIndex).forEach(key => {
            if (key !== "0") {
                var tempArrIndex = []
                abnormalnearIndex[key].forEach(data => {
                    //console.log(data)
                    if (!JSON.stringify(tempArrIndex).includes(JSON.stringify(data))) {
                        tempArrIndex.push(data)
                    }
                })
                //console.log(tempArrIndex)
                arrAbnormalnearIndex.push(tempArrIndex)
            }
        })
        console.log(abnormalIndex)
        console.log(abnormalFlag)
        console.log(arrAbnormalIndex)
        console.log(abnormalnearFlag)
        console.log(arrAbnormalnearIndex)
        console.log(indNewValue)
        if (method === "record") {
            //alert
            if (abnormalnearFlag[2]) {
                arrAbnormalnearIndex[2].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        alert(`Warning!! Data trend nearly become "Run 7 points continuously"\nPlease take any action`)
                    }
                })
            }
            if (abnormalnearFlag[3]) {
                arrAbnormalnearIndex[3].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        alert(`Warning!! Data trend nearly become "Run up/down 7 points continuously"\nPlease take any action`)
                    }
                })
            }
            if (abnormalnearFlag[4]) {
                arrAbnormalnearIndex[4].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        alert(`Warning!! Data trend nearly become "Incline 12/14 or 10/11 points"\nPlease take any action`)
                    }
                })
            }
            if (abnormalnearFlag[5]) {
                arrAbnormalnearIndex[5].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        alert(`Warning!! Data trend nearly become "Near Control Limit 2/3 points"\nPlease take any action`)
                    }
                })
            }
            //return
            var res = 0
            if (abnormalFlag[1]) {
                if (arrAbnormalIndex[1].includes(indNewValue)) {
                    res = 1
                }
            }
            if (abnormalFlag[2]) {
                arrAbnormalIndex[2].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        res = 2
                    }
                })
            }
            if (abnormalFlag[3]) {
                arrAbnormalIndex[3].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        res = 3
                    }
                })
            }
            if (abnormalFlag[4]) {
                arrAbnormalIndex[4].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        res = 4
                    }
                })
            }
            if (abnormalFlag[5]) {
                arrAbnormalIndex[5].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        res = 5
                    }
                })
            }
            if (abnormalFlag[6]) {
                arrAbnormalIndex[6].forEach(indarr => {
                    if (indNewValue >= indarr[0] && indNewValue <= indarr[1]) {
                        res = 6
                    }
                })
            }
            return res
        } else {
            console.log()
            this.createCircleAbnormal(abnormalFlag, arrAbnormalIndex, arrData, arrDataX, abnormalnearFlag, arrAbnormalnearIndex)
        }
    }

    createCircleAbnormal = (abnormalFlag, abnormalIndex, arrData, arrDataX, abnormalnearFlag, abnormalnearIndex) => {
        /*var gData = this.state.graphData
        gData.push({ x: 24, y: 16 })
        this.setState({
            abnormal: abnormalFlag,
            abnormalFlag: abnormalFlag,
            abnormalIndex: arrAbnormalIndex,
            graphData: gData
        })*/
        console.log(abnormalFlag)
        console.log(abnormalIndex)
        console.log(arrData)
        console.log(arrDataX)
        //get center of trend data
        var centerData = []
        var centerDataFlag = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
        var commentDataX = []
        abnormalFlag.forEach((flag, ind) => {
            if (flag) {
                if (ind === 0 || ind === 1) {
                    abnormalIndex[ind].forEach(data => {
                        centerDataFlag[ind].push(true)
                        if (centerData[ind] !== undefined) {
                            centerData[ind] = [...centerData[ind], [arrDataX[data], arrData[data]]]
                        } else {
                            centerData[ind] = [[arrDataX[data], arrData[data]]]
                        }
                    })
                } else {
                    abnormalIndex[ind].forEach(data => {
                        centerDataFlag[ind].push(true)
                        console.log(data)
                        console.log(arrDataX[data[0]] + "/" + arrDataX[data[1]])
                        console.log(arrData[data[0]] + "/" + arrData[data[1]])
                        const maxX = arrDataX[data[1]]
                        const minX = arrDataX[data[0]]
                        var maxY = -Infinity
                        var minY = Infinity
                        for (var i = data[0]; i <= data[1]; i++) {
                            if (arrData[i] > maxY) {
                                maxY = arrData[i]
                            }
                            if (arrData[i] < minY) {
                                minY = arrData[i]
                            }
                        }
                        const cX = (arrDataX[data[0]] + arrDataX[data[1]]) / 2
                        const cY = (maxY + minY) / 2
                        if (centerData[ind] !== undefined) {
                            centerData[ind] = [...centerData[ind], [cX, cY, minX, maxX, minY, maxY]]
                        } else {
                            centerData[ind] = [[cX, cY, minX, maxX, minY, maxY]]
                        }
                        /*if (ind > 0) {
                            var arrDist = []
                            for (i = data[0]; i <= data[1]; i++) {
                                const dist = Math.pow(cX - arrDataX[i],2) + Math.pow(cY - arrData[i],2)
                                arrDist.push({ index: i, val: dist })
                            }
                            console.log(arrDist)
                        }*/
                    })
                    if (ind === 2) {
                        abnormalIndex[ind].forEach(item => {
                            commentDataX.push(arrDataX[item[1]])
                        })
                    } else if (ind === 3) {
                        abnormalIndex[ind].forEach(item => {
                            commentDataX.push(arrDataX[item[1]])
                        })
                    } else if (ind === 4) {
                        abnormalIndex[ind].forEach(item => {
                            commentDataX.push(item[1])
                        })
                    } else if (ind === 5) {
                        abnormalIndex[ind].forEach(item => {
                            commentDataX.push(arrDataX[item[1]])
                        })
                    }
                }
            }
        })
        console.log(centerData)
        var gData = [...this.state.graphData]
        console.log(gData)
        console.log(abnormalnearIndex)
        var nearDataX = []
        var nearDataMsg = {}
        abnormalnearFlag.forEach((flag, ind) => {
            if (flag) {
                if (ind === 2) {
                    abnormalnearIndex[ind].forEach(item => {
                        const c = item[1] - item[0] + 1
                        if (c === 5) {
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        } else if (c === 6) {
                            nearDataX.push(arrDataX[item[1] - 1])
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined && nearDataMsg[arrDataX[item[1] - 1]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [...nearDataMsg[arrDataX[item[1] - 1]], ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        }
                    })
                } else if (ind === 3) {
                    abnormalnearIndex[ind].forEach(item => {
                        const c = item[1] - item[0] + 1
                        if (c === 5) {
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        } else if (c === 6) {
                            nearDataX.push(arrDataX[item[1] - 1])
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined && nearDataMsg[arrDataX[item[1] - 1]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [...nearDataMsg[arrDataX[item[1] - 1]], ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        }
                    })
                } else if (ind === 4) {
                    console.log(arrDataX)
                    abnormalnearIndex[ind].forEach(item => {
                        console.log(item)
                        const c = item[1] - item[0] + 1
                        if (c === 9) {
                            nearDataX.push(item[1])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        } else if (c === 10) {
                            nearDataX.push(arrDataX[item[1] - 1])
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined && nearDataMsg[arrDataX[item[1] - 1]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [...nearDataMsg[arrDataX[item[1] - 1]], ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        } else if (c === 12) {
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        } else if (c === 13) {
                            nearDataX.push(arrDataX[item[1] - 1])
                            nearDataX.push(arrDataX[item[1]])
                            if (nearDataMsg[arrDataX[item[1]]] !== undefined && nearDataMsg[arrDataX[item[1] - 1]] !== undefined) {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [...nearDataMsg[arrDataX[item[1] - 1]], ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                            } else {
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1] - 1]]: [ind] }
                                nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                            }
                        }
                    })
                } else if (ind === 5) {
                    abnormalnearIndex[ind].forEach(item => {
                        nearDataX.push(arrDataX[item[1]])
                        if (nearDataMsg[arrDataX[item[1]]] !== undefined) {
                            nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [...nearDataMsg[arrDataX[item[1]]], ind] }
                        } else {
                            nearDataMsg = { ...nearDataMsg, [arrDataX[item[1]]]: [ind] }
                        }
                    })
                }
            }
        })
        console.log(nearDataX)
        gData.forEach((data, ind) => {
            if (data.y !== undefined) {
                nearDataX.forEach(x => {
                    if (data.x === x) {
                        gData[ind] = { ...gData[ind], near: 1, nearmsg: nearDataMsg[x] }
                    }
                })
                commentDataX.forEach(x => {
                    if (data.x === x) {
                        gData[ind] = { ...gData[ind], comment: 1 }
                    }
                })
            }
        })
        console.log(gData)
        const puregData = [...gData]
        centerData.forEach((arrData, ind) => {
            if (ind === 0 || ind === 1) {
                arrData.forEach((data, indP) => {
                    gData.push({ case: ind, index: indP, x: data[0], cY: data[1] })
                })
            } else {
                //for data > 3 = calculate distance and get top 2 distance to make rectangle
                //for data > 4 = calculate distance and get top 4 distance to make rectangle
                //separate point 1.left/right 2.top/bottom
                /*centerData[ind].forEach(point => {
                    const cx = point[0]
                    const cy = point[1]
                    const minx = point[2]
                    const maxx = point[3]
                })*/
                //get K-position
                const yDomain = this.state.yDomain
                console.log(yDomain) //update when slider change
                const kY = 330 / (yDomain[1] - yDomain[0])
                arrData.forEach((data, indP) => {
                    gData.push({ case: ind, index: indP, x: data[0], cY: data[1], minX: data[2], maxX: data[3], minY: data[4], maxY: data[5] })
                })
            }
        })
        console.log("create circle")
        this.setState({
            pureGraphData: puregData,
            graphData: gData,
            circleGraphData: gData,
            centerData: centerData,
            centerDataFlag: centerDataFlag
        }, () => {
            console.log(gData)
        })
        /*console.log(arrDotPos)
        console.log(arrDotData)
        var dotPos = []
        gData.forEach(data => {
            for (var i = 0; i < arrDotData.length; i++) {
                if (JSON.stringify(arrDotData[i]).includes(JSON.stringify(data))) {
                    dotPos.push(arrDotPos[i])
                    break
                }
            }
        })
        console.log(dotPos)*/
    }

    customCircle = (props) => {
        const { cx, cy, stroke, payload, value } = props
        if (payload['cY'] !== undefined) {
            if (payload['case'] === 0 || payload['case'] === 1) {
                return (
                    <svg x={cx - 12} y={cy - 12} width={24} height={24}>
                        <circle cx="12" cy="12" r="10" fillOpacity="0" stroke="red" strokeWidth="2" />
                    </svg>
                )
            } else {
                const minx = payload['minX']
                const maxx = payload['maxX']
                const miny = payload['minY']
                const maxy = payload['maxY']
                const xDomain = [this.state.xSliderValue[0] - 0.5, this.state.xSliderValue[1] + 1.5]
                const kX = 600 / (xDomain[1] - xDomain[0])
                const w = (maxx - minx) * kX
                const yDomain = this.state.yDomain
                const kY = 330 / (yDomain[1] - yDomain[0])
                const h = (maxy - miny) * kY
                if (w > h) {
                    var r = (h + 10) / 5
                } else {
                    r = (w + 10) / 5
                }
                r = 5
                //console.log(w + "/" + h + "/" + r)
                return (
                    <svg x={cx - ((w + 46) / 2)} y={cy - ((h + 46) / 2)} width={w + 46} height={h + 46}>
                        <rect className="rect-trend" x={(46 - 12) / 2} y={(46 - 12) / 2} rx={r} ry={r} width={w + 12} height={h + 12} />
                        {/*<rect className="text-background" x={w + 20 - 80 + 4} y="0" width="80" height="16" />
                        <text className="text-trend" x={w + 20} y="15" textAnchor="end">
                            {`Case ${payload['case'] + 1} - ${Number(payload['index']) + 1}`}
                </text>*/}
                    </svg>
                )
            }
        }
        return null
    }

    showCircleGraph = () => {
        var pushGraph = []
        if (!this.state.showCircle) {
            pushGraph = [...this.state.circleGraphData]
        } else {
            pushGraph = [...this.state.pureGraphData]
        }
        this.setState({
            showCircle: !this.state.showCircle,
            graphData: pushGraph
        })
    }

    checkTrendItem = (e, ind, indP) => {
        console.log(e.currentTarget.checked)
        var newCircleData = [...this.state.pureGraphData]
        var cData = this.state.centerData
        var cDataFlag = this.state.centerDataFlag
        cDataFlag[ind][indP] = e.currentTarget.checked
        console.log(cDataFlag)
        cData.forEach((arrData, indD) => {
            if (indD === 0) {
                arrData.forEach((data, indF) => {
                    if (cDataFlag[indD][indF]) {
                        newCircleData.push({ case: indD, index: indF, x: data[0], cY: data[1] })
                    }
                })
            } else {
                const yDomain = this.state.yDomain
                const kY = 330 / (yDomain[1] - yDomain[0])
                arrData.forEach((data, indF) => {
                    if (cDataFlag[indD][indF]) {
                        newCircleData.push({ case: indD, index: indF, x: data[0], cY: data[1], minX: data[2], maxX: data[3], minY: data[4], maxY: data[5] })
                    }
                })
            }
        })
        this.setState({
            graphData: newCircleData,
            centerDataFlag: cDataFlag
        })
    }

    allTrigCircle = (flag) => {
        var cDataFlag = this.state.centerDataFlag
        Object.keys(cDataFlag).forEach(key => {
            cDataFlag[key].forEach((f, ind) => {
                cDataFlag[key][ind] = flag
                document.getElementById(`chk-${key}-${ind}`).checked = flag
            })
        })
        var pushGraph = []
        if (flag) {
            pushGraph = [...this.state.circleGraphData]
        } else {
            pushGraph = [...this.state.pureGraphData]
        }
        this.setState({
            centerDataFlag: cDataFlag,
            graphData: pushGraph
        })
    }

    readCSVFile = () => {
        var file = document.getElementById('csvfile')
        var reader = new FileReader()
        reader.onload = function () {
            var res = reader.result
            resData1 = res.split('\r\n')
            console.log(resData1)
        }
        reader.readAsBinaryString(file.files[0])
    }

    readCSVFile2 = () => {
        var file = document.getElementById('csvfilectrl')
        var reader = new FileReader()
        reader.onload = function () {
            var res = reader.result
            resData2 = res.split('\r\n')
            console.log(resData2)
        }
        reader.readAsBinaryString(file.files[0])
    }

    readCSVFile3 = () => {
        var file = document.getElementById('csvfiledata')
        var reader = new FileReader()
        reader.onload = function () {
            var res = reader.result
            resData3 = res.split('\r\n')
            console.log(resData3)
        }
        reader.readAsBinaryString(file.files[0])
    }

    filterCSV = () => {
        const csvData = resData1
        const month = document.getElementById('month').value
        /*var filterData = []
        csvData.forEach(line => {
            if (line.split(',').length > 2) {
                if (line.split(',')[1].indexOf(month) > -1 &&
                    line.split(',')[3].indexOf(procid) > -1 &&
                    line.split(',')[4].indexOf(itemid) > -1) {
                    filterData.push(line)
                }
            }
        })
        console.log(filterData)
        filterData.forEach(data => {

        })*/
        if (month === "") {
            alert("input part no")
            return
        }
        csvData.forEach((line, ind) => {
            if (ind > 0 && line !== "") {
                const procname = line
                api.post('/controlitems/create/', {
                    section: curSection,
                    partno: month,
                    process: procname,
                    itemid: 0
                })
                    .then(res => {
                        console.log(res)
                    })
                    .catch(error => alert(error))
            }
        })
    }

    checkAddItemCSV = () => {
        console.log(errorC)
        console.log(errorA)
        console.log(errorR)
    }

    addItemCSV = () => {
        const csvData = resData2
        const pno = document.getElementById('month').value
        var errorCount = 0
        var errorArr = []
        var errorRow = []
        if (pno === "") {
            alert("input part no")
            return
        }
        csvData.forEach((line, ind) => {
            if (line !== "" && ind > 0 && line.split(',').length === 15) {
                const calmethod = line.split(',')[10].split(';')[0]
                var rec = ""
                var cal = ""
                var meas = line.split(',')[6]
                if (calmethod === "Check Sheet") {
                    rec = "Check sheet"
                    meas = 1
                } else if (calmethod === "Normal") {
                    rec = "Record sheet"
                    cal = "None"
                } else if (calmethod === "Max only") {
                    rec = "Record sheet"
                    cal = "Max only"
                } else if (calmethod === "Min only") {
                    rec = "Record sheet"
                    cal = "Min only"
                } else if (calmethod === "Max-Min") {
                    rec = "Record sheet"
                    cal = "Max-Min"
                } else if (calmethod === "Average") {
                    rec = "Record sheet"
                    cal = "Average"
                } else if (calmethod === "x-R Chart") {
                    rec = "x-R chart"
                    cal = line.split(',')[10].split(';')[1]
                } else if (calmethod === "Max & Min") {
                    rec = "Record sheet"
                    cal = "Max & Min"
                }
                var upper = line.split(',')[4]
                var lower = line.split(',')[5]
                if (upper === "9999") {
                    upper = ""
                }
                if (lower === "-9999") {
                    lower = ""
                }
                api.post('/controlitems/create/', {
                    section: curSection,
                    partno: pno,
                    process: line.split(',')[1],
                    itemid: line.split(',')[2],
                    parameter: line.split(',')[3],
                    recmethod: rec,
                    limit: `${upper};${lower}`,
                    unit: line.split(',')[11],
                    masterval: line.split(',')[14],
                    calmethod: cal,
                    meastimes: meas,
                    interval1: line.split(',')[7],
                    interval2: line.split(',')[8],
                    meastool: line.split(',')[9],
                    mcno: line.split(',')[12],
                    readability: line.split(',')[13]
                })
                    .then(res => {
                        console.log(res)
                    })
                    .catch(error => {
                        //alert(error)
                        console.log(ind)
                        console.log(line)
                        console.log(error.response.data)
                        errorCount++
                        errorArr.push(ind)
                        errorRow.push(line)
                    })
            } else {
                errorCount++
                errorArr.push(ind)
                errorRow.push(line)
            }
        })
        errorC = errorCount
        errorA = errorArr
        errorR = errorRow
    }

    addDataCSV = () => {
        this.setState({
            saveCSV: true
        })
        const csvData = resData3
        const pno = document.getElementById('month').value
        const procList = resData1
        const shift = document.getElementById('shiftdata').value
        console.log(csvData)
        console.log(procList)
        if (pno === "" || procList.length <= 0) {
            alert("input part no and import process file")
            return
        }
        var arrData = []
        procList.forEach((proc, ind) => {
            var arrProc = []
            csvData.forEach(data => {
                if (data.split(',')[1] === proc) {
                    arrProc.push(data.split(','))
                }
            })
            arrData.push(arrProc)
        })
        console.log(arrData)
        var arrDataInsert = []
        arrData.forEach((data, ind) => { //process loop
            var month = ""
            var date = ""
            var itemid = ""
            var itemidCur = ""
            var itemidM = 0
            if (ind !== 0 && data.length > 0) {
                var d1 = {}
                var d2 = {}
                var d3 = {}
                var d4 = {}
                var dm1 = {}
                var dm2 = {}
                var dm3 = {}
                var dm4 = {}
                var dSub = {}
                var dSubMin = {}
                var olddate = ""
                var finitemid = itemid
                data.forEach((dat, inddat) => { //data in process each day loop
                    date = Number(dat[0].substring(8, 10))
                    if (olddate === "") {
                        olddate = date
                    }
                    if (!dat[2].includes('_')) {
                        itemidCur = dat[2]
                        itemidM = 0
                    } else {
                        //itemidCur = dat[2].substring(0, dat[2].indexOf('_'))
                        itemidCur = `${Number(dat[2].substring(0, dat[2].indexOf('_')))}-${dat[2].substring(dat[2].indexOf('_') + 1, dat[2].length)}`
                        //itemidM = Number(dat[2].substring(dat[2].indexOf('_') + 1, dat[2].length)) - 1
                    }
                    if (month === "") {
                        month = dat[0].substring(0, 7)
                    } else if (month !== dat[0].substring(0, 7) || itemid !== itemidCur) {
                        finitemid = itemid
                        if (!isNaN(Number(itemid))) {
                            finitemid = Number(itemid).toString()
                        }
                        arrDataInsert.push([
                            pno,
                            procList[ind],
                            finitemid,
                            month,
                            JSON.stringify(d1),
                            JSON.stringify(d2),
                            JSON.stringify(d3),
                            JSON.stringify(d4),
                            JSON.stringify(dm1),
                            JSON.stringify(dm2),
                            JSON.stringify(dm3),
                            JSON.stringify(dm4),
                            //d1, d2, d3, d4,
                            shift
                        ])
                        d1 = {}
                        d2 = {}
                        d3 = {}
                        d4 = {}
                        dm1 = {}
                        dm2 = {}
                        dm3 = {}
                        dm4 = {}
                        month = dat[0].substring(0, 7)
                    }
                    if (!dat[2].includes("_")) { //normal
                        itemid = dat[2]
                    } else { // _x to continue
                        //itemid = dat[2].substring(0, dat[2].indexOf('_'))
                        itemid = `${Number(dat[2].substring(0, dat[2].indexOf('_')))}-${dat[2].substring(dat[2].indexOf('_') + 1, dat[2].length)}`
                    }
                    //console.log(date + "/" + olddate)
                    if (date !== olddate || itemidCur !== itemid) {
                        //console.log('clear dsub')
                        dSub = {}
                        dSubMin = {}
                    }
                    if (month === dat[0].substring(0, 7) && itemid === itemidCur) {
                        //console.log(`${date}/${month}/${dat[0].substring(0, 7)}/${itemid}/${itemidCur}`)
                        //console.log(dSub)
                        for (var i = 3; i <= 12; i++) {
                            if (dat[i] !== "") { //record
                                dSub = { ...dSub, [i - 2 + (10 * itemidM)]: dat[i] }
                            } else if (dat[i] === "" && dat[i + 10] === "True") { //check
                                dSub = { ...dSub, [i - 2 + (10 * itemidM)]: "O" }
                            }
                            if (dat[i + 20] !== "") { //max&min data
                                dSubMin = { ...dSubMin, [i - 2 + (10 * itemidM)]: dat[i] }
                            }
                        }
                        //console.log(d1)
                        if (date >= 1 && date <= 8) {
                            d1 = { ...d1, [date]: dSub }
                            dm1 = { ...dm1, [date]: dSubMin }
                            //console.log(date)
                            //console.log(d1)
                        } else if (date >= 9 && date <= 16) {
                            d2 = { ...d2, [date]: dSub }
                            dm2 = { ...dm2, [date]: dSubMin }
                        } else if (date >= 17 && date <= 24) {
                            d3 = { ...d3, [date]: dSub }
                            dm3 = { ...dm3, [date]: dSubMin }
                        } else if (date >= 25 && date <= 31) {
                            d4 = { ...d4, [date]: dSub }
                            dm4 = { ...dm4, [date]: dSubMin }
                        }
                    }
                    finitemid = itemid
                    if (!isNaN(Number(itemid))) {
                        finitemid = Number(itemid).toString()
                    }
                    if (inddat === data.length - 1) {
                        //console.log('push')
                        //console.log(`a${date}/${month}/${dat[0].substring(0, 7)}/${itemid}/${itemidCur}`)
                        arrDataInsert.push([
                            pno,
                            procList[ind],
                            finitemid,
                            month,
                            JSON.stringify(d1),
                            JSON.stringify(d2),
                            JSON.stringify(d3),
                            JSON.stringify(d4),
                            JSON.stringify(dm1),
                            JSON.stringify(dm2),
                            JSON.stringify(dm3),
                            JSON.stringify(dm4),
                            //d1, d2, d3, d4,
                            shift
                        ])
                        d1 = {}
                        d2 = {}
                        d3 = {}
                        d4 = {}
                        dm1 = {}
                        dm2 = {}
                        dm3 = {}
                        dm4 = {}
                    }
                    olddate = date
                })
            }
        })
        console.log(arrDataInsert)
        arrDataInsert.forEach((data, ind) => {
            api.post(`/datarec/create/`, {
                section: curSection,
                partno: data[0],
                process: data[1],
                itemid: data[2],
                ym: data[3],
                d1: data[4],
                d2: data[5],
                d3: data[6],
                d4: data[7],
                dm1: data[8],
                dm2: data[9],
                dm3: data[10],
                dm4: data[11],
                shift: shift,
            })
                .then(res => {
                    console.log(res)
                    if (ind === arrDataInsert.length - 1) {
                        this.setState({
                            saveCSV: false
                        })
                    }
                })
                .catch(err => console.log(err))
        })
    }

    showImport = () => {
        this.setState({
            showImport: !this.state.showImport
        })
    }

    testMQTT = () => {
        /*console.log("mqtt click")
        var options = {
            protocol: 'mqtt',
            clientId: 'testclientreact'
        }
        const client = mqtt.connect('ws://127.0.0.1:1885', options)
        client.on('connect', (err) => {
            console.log(err)
        })
        client.subscribe('test/2')
        client.subscribe('test/3')
        client.on('message', (topic, payload, packet) => {
            console.log(topic)
            const msg = payload.toString()
            console.log("test2")
            console.log(JSON.parse(msg))
        })*/
    }

    checkProcess = (type) => {
        this.setState({
            isLoading: true
        }, () => {
            const pno = this.state.currentViewNo
            const proc = this.state.processText
            const ym = moment(this.state.pickedDate).format('YYYY-MM')
            const shift = this.state.shift
            const dom = this.state.dayOfMonth
            api.get(`/datarec/${curSection}_${pno}_${proc}_apprv_${ym}_${shift}`)
                .then(res => {
                    if (res.data.length === 0) {
                        //create
                        api.post(`/datarec/create/`, {
                            section: curSection,
                            partno: pno,
                            process: proc,
                            itemid: 'apprv',
                            ym: ym,
                            shift: shift,
                        })
                            .then(res1 => {
                                var empData = []
                                var empDate = []
                                var empId = []
                                var empName = []
                                for (var i = 1; i <= (14 + (2 * dom)); i++) {
                                    console.log(i)
                                    empData.push(0)
                                    empDate.push("")
                                    empId.push("")
                                    empName.push("")
                                }
                                console.log(empData)
                                this.changeRecorderStatus(res1.data['id'], empData, empDate, empId, empName, type)
                            })
                    } else {
                        //update
                        console.log(res.data)
                        var appData = res.data[0]['d1']
                        var appDate = res.data[0]['d2']
                        var appEmp = res.data[0]['d3']
                        var appName = res.data[0]['d4']
                        console.log(appData)
                        console.log(appDate)
                        console.log(appEmp)
                        console.log(appName)
                        if (appData === "") {
                            appData = []
                            for (var i = 1; i <= (14 + (2 * dom)); i++) {
                                appData.push(0)
                            }
                        } else {
                            appData = appData.split(";")
                            appData.forEach((item, ind) => {
                                appData[ind] = Number(item)
                            })
                        }
                        if (appDate === "") {
                            appDate = []
                            for (var i = 1; i <= (14 + (2 * dom)); i++) {
                                appDate.push("")
                            }
                        } else {
                            appDate = appDate.split(";")
                        }
                        if (appEmp === "") {
                            appEmp = []
                            for (var i = 1; i <= (14 + (2 * dom)); i++) {
                                appEmp.push("")
                            }
                        } else {
                            appEmp = appEmp.split(";")
                        }
                        if (appName === "") {
                            appName = []
                            for (var i = 1; i <= (14 + (2 * dom)); i++) {
                                appName.push("")
                            }
                        } else {
                            appName = appName.split(";")
                        }
                        this.changeRecorderStatus(res.data[0]['id'], appData, appDate, appEmp, appName, type)
                    }
                })
        })
    }

    changeRecorderStatus = (id, curData, curDate, arrcurEmp, curName, type) => {
        const today = Number(moment(this.state.pickedDate).format('D'))
        const dom = this.state.dayOfMonth
        const ym = moment(this.state.pickedDate).format('YYYY-MM')
        const fweekday = moment(`${ym}-01`, 'YYYY-MM-DD').isoWeekday()
        var fmonday = 0
        if (fweekday === 1) {
            fmonday = 1
        } else {
            fmonday = 7 - fweekday + 2
        }
        var week = 0
        if (today <= fmonday) {
            week = 1
        } else {
            for (var i = 1; i <= 4; i++) {
                if (today > fmonday + (7 * i) && today < fmonday + (7 * (i + 1))) {
                    week = i + 1
                    break
                }
            }
        }
        console.log(week)
        var approveData = curData
        var approveDate = curDate
        var approveEmp = arrcurEmp
        var approveName = curName
        var index = null
        if (type === "LL check") {
            index = today - 1
        } else if (type === "TL M check") {
            index = dom
        } else if (type === "AM M approve") {
            index = dom + 1
        } else if (type === "TL check") { //xr
            index = dom + 1 + today
        } else if (type === "TL W check") { //xr
            index = (2 * dom) + 1 + week
        } else if (type === "AM W check") { //xr
            index = (2 * dom) + 1 + 5 + week
        } else if (type === "AM M check") { //xr
            index = (2 * dom) + 1 + 10 + 1
        } else if (type === "AGM M approve") { //xr
            index = (2 * dom) + 1 + 10 + 2
        } else {
            alert("change approve status type is not match")
            return
        }
        console.log(index)
        if (approveData[index] !== 1) {
            approveData[index] = 1
            approveDate[index] = moment().format('HH:mm DD-MM-YYYY')
            approveEmp[index] = this.state.inputEmpId
            approveName[index] = this.state.inputEmpName
        } else {
            approveData[index] = 0
            approveDate[index] = moment().format('HH:mm DD-MM-YYYY')
            approveEmp[index] = this.state.inputEmpId
            approveName[index] = this.state.inputEmpName
        }
        console.log(approveData)
        console.log(approveDate)
        console.log(approveEmp)
        console.log(approveName)
        var chkedCount = 0
        for (var i1 = 0; i1 < dom; i1++) {
            if (approveData[i1] === 1) {
                chkedCount++
            }
        }
        console.log(chkedCount)
        const joinApproveData = approveData.join(";")
        const joinApproveDate = approveDate.join(";")
        const joinApproveEmp = approveEmp.join(";")
        const joinApproveName = approveName.join(";")
        api.put(`/datarec/${id}/update/`, {
            d1: joinApproveData,
            d2: joinApproveDate,
            d3: joinApproveEmp,
            d4: joinApproveName
        })
            .then(res => {
                //insert queue
                this.setState({
                    approveData: approveData,
                    approveDate: approveDate,
                    approveEmp: approveEmp,
                    approveName: approveName,
                    approveItemId: id,
                    checkedCount: chkedCount,
                    isLoading: false
                })
            })
    }

    selectSectionApprove = (section, partno, shift, ym, process) => {
        curSection = section
        this.setState({
            approveView: false,
            approvePartView: true,
            approveDataShift: shift,
            approveDataYM: ym,
            approveProcess: process
        }, () => {
            //this.getList()
            this.toggleView(partno)
            this.getApproverList()
        })
    }

    backToApproveView = () => {
        console.log(curEmp)
        var flagApprove = true
        var flagSectionDist = false
        if (Monitorview) {
            flagApprove = false
        }
        this.setState({
            approveView: flagApprove
        }, () => {
            if (flagApprove) {
                this.getSection()
            }
        })
    }

    getApproveQueue = (apprvId) => {
        this.setState({
            isLoading: true
        }, () => {
            var apprvQueue = ""
            var normalChecker = "..."
            var normalApprover = "..."
            var normStatus = "0"
            var updateValue = []
            var normalCheckStatusMsg = ""
            var normalApproveStatusMsg = ""
            const emplist = this.state.EmpLists
            console.log(emplist)
            //get data approve queue
            api.get(`/datarec/appqueue/itemlist/recordid_${apprvId}`)
                .then(res => {
                    console.log(res.data)
                    if (res.data.length > 0) {
                        apprvQueue = res.data[0]
                        normStatus = Number(apprvQueue['status'])
                        normalChecker = emplist[apprvQueue['checker']]['empname']
                        normalApprover = emplist[apprvQueue['approver']]['empname']
                        updateValue = apprvQueue['update'].split(";")
                        if (normStatus === 1) {
                            normalCheckStatusMsg = "Waiting Check"
                            normalApproveStatusMsg = "Wait Checked"
                        } else if (normStatus === 20) {
                            normalCheckStatusMsg = "Checked"
                            normalApproveStatusMsg = "Waiting Approve"
                        } else if (normStatus === 21) {
                            normalCheckStatusMsg = "Check rejected"
                            normalApproveStatusMsg = "Wait Checked"
                        } else if (normStatus === 30) {
                            normalCheckStatusMsg = "Checked"
                            normalApproveStatusMsg = "Approved"
                        } else if (normStatus === 31) {
                            normalCheckStatusMsg = "Checked"
                            normalApproveStatusMsg = "Approve rejected"
                        } else {
                            alert("normal status is not match")
                            console.log(normStatus)
                        }
                    } else {
                        normStatus = 0
                        normalCheckStatusMsg = "Not send to Check"
                        normalApproveStatusMsg = "Not send to Check"
                    }
                    console.log(normStatus)
                    console.log(normalCheckStatusMsg)
                    console.log(normalApproveStatusMsg)
                    console.log(normalChecker)
                    console.log(normalApprover)
                    console.log(updateValue)
                    this.setState({
                        approveQueue: apprvQueue,
                        approveQueueId: apprvQueue['id'],
                        normalStatus: normStatus,
                        queueUpdate: updateValue,
                        normalCheckStatusMsg: normalCheckStatusMsg,
                        normalApproveStatusMsg: normalApproveStatusMsg,
                        TLupName: normalChecker,
                        AMupName: normalApprover,
                        commentCheck: apprvQueue['comment_check'],
                        commentApprove: apprvQueue['comment_approve'],
                        isLoading: false,
                    })
                })
                .catch(err => {
                    alert("get approve queue data error")
                    console.log(err)
                })
        })
    }

    statusSearchSelect = (status, code) => {
        this.setState({
            statusSearchTxt: status,
            statusSearchCode: code
        }, () => {
            this.approveSearch()
        })
    }

    approveSearch = () => {
        var arrList = this.state.approveLists
        const section = document.getElementById('approve-search-section').value
        const partno = document.getElementById('approve-search-partno').value
        const month = document.getElementById('approve-search-month').value
        const status = this.state.statusSearchCode
        var filterarrList = []
        arrList.forEach(list => {
            if (status !== "" && list.section.includes(section) && list.partno.includes(partno) && list.ym.includes(month) && list.status === status) {
                filterarrList.push(list)
            } else if (status === "" && list.section.includes(section) && list.partno.includes(partno) && list.ym.includes(month)) {
                filterarrList.push(list)
            }
        })
        console.log(filterarrList)
        this.setState({
            filteredApproveLists: filterarrList
        })
    }

    showInputEmpId = (type, msg, flag) => {
        //flag true=checked ,false=not check
        console.log(type)
        var msg1 = msg
        if (flag) {
            msg1 = "Clear " + msg
        }
        if (type !== null) {
            if (type.substring(0, 5) === "queue") {
                if (type.includes("normal")) {
                    msg1 = "Monthly Check and Approve"
                } else if (type.includes("chart") && type.includes("week")) {
                    msg1 = "Chart Weekly Check and Approve"
                } else if (type.includes("chart") && type.includes("month")) {
                    msg1 = "Chart Monthly Check and Approve"
                } else {
                    alert("show input emp id type is not match")
                }
                if (type.includes("normal") && (this.state.TLupName === "..." || this.state.AMupName === "...")) {
                    alert("Please select Checker and Approver for Monthly Approval")
                    return
                } else if (type.includes("chart") && type.includes("W") && (this.state.TLupName === "..." || this.state.AMupName === "...")) {
                    alert("Please select Checker and Approver for Chart Weekly Approval")
                    return
                } else if (type.includes("chart") && !type.includes("W") && (this.state.AMupName === "..." || this.state.AGMupName === "...")) {
                    alert("Please select Checker and Approver for Chart Monthly Approval")
                    return
                }
            }
        }
        this.setState({
            inputEmpIdShow: true,
            inputEmpIdType: type,
            inputEmpIdMsg: msg1
        })
    }

    hideInputEmpId = () => {
        this.setState({
            inputEmpIdShow: false,
        })
    }

    enterEmpId = () => {
        this.setState({
            isLoading: true
        }, () => {
            const type = this.state.inputEmpIdType
            const empid = document.getElementById('inputempid').value
            const pass = document.getElementById('inputemppass').value
            var pos = 0
            api.get(`/datarec/approver/${empid}`)
                .then(res => {
                    console.log(res.data)
                    if (res.data.length > 0) {
                        const position = res.data[0]['position']
                        if (position === "LLa" || position === "LLb") {
                            pos = 1
                        } else if (position === "TL") {
                            pos = 2
                        } else if (position === "AM" && position === "MGR") {
                            pos = 3
                        } else if (position === "AGM" || position === "GM") {
                            pos = 4
                        }
                        if (res.data[0]['pswd'] === pass) {
                            this.setState({
                                inputEmpIdShow: false,
                                inputEmpId: empid,
                                inputEmpName: res.data[0]['empname'],
                                inputEmpPos: pos
                            }, () => {
                                if (type.includes("queue")) {
                                    //check queue and update queue
                                    this.checkQueue(type, empid)
                                } else {
                                    this.checkProcess(type)
                                }
                            })
                        } else {
                            alert("password not match")
                            return
                        }
                    } else {
                        alert("not found employee id")
                        return
                    }
                    this.setState({
                        isLoading: false
                    })
                })
        })
    }

    editInchargeApprove = (saveFlag, editFlag) => {
        this.setState({
            isLoading: true
        }, () => {
            const queID = this.state.approveQueueId
            const apprvId = this.state.approveItemId
            const flag = this.state.editInchargeFlag
            const empList = this.state.EmpLists
            var showEditFlag = false
            const reSubmitFlag = saveFlag && !editFlag
            if ((flag && saveFlag) || (reSubmitFlag)) { //save edit
                const TLup = { id: this.state.TLupId, name: this.state.TLupName, pos: this.state.TLupPos }
                const AMup = { id: this.state.AMupId, name: this.state.AMupName, pos: this.state.AMupPos }
                if (TLup['id'] === "" || AMup['id'] === "") {
                    //get detail emp name
                    Object.keys(empList).forEach(key => {
                        if (empList[key].empname === TLup['name']) {
                            TLup['id'] = empList[key].empid
                            TLup['pos'] = empList[key].position
                        }
                        if (empList[key].empname === AMup['name']) {
                            AMup['id'] = empList[key].empid
                            AMup['pos'] = empList[key].position
                        }
                    })
                }
                console.log(TLup)
                console.log(AMup)
                var arrUpdate = this.state.queueUpdate
                arrUpdate[1] = moment().format('YYYY-MM-DD HH:mm:ss')
                arrUpdate = arrUpdate.join(";")
                api.put(`/datarec/appqueue/${queID}/update/`, {
                    checker: TLup['id'],
                    approver: AMup['id'],
                    status: "1",
                    update: arrUpdate
                })
                    .then(res => {
                        console.log(res)
                        this.getApproveQueue(apprvId)
                    })
                    .catch(err => {
                        alert("create queue error")
                        console.log(err.response.data)
                    })
            }
            if (editFlag) {
                showEditFlag = !this.state.editInchargeFlag
            }
            this.setState({
                editInchargeFlag: showEditFlag
            })
        })
    }

    checkQueue = (type, empid) => {
        this.setState({
            isLoading: true
        }, () => {
            const apprvItemId = this.state.approveItemId
            if (apprvItemId === "") {
                alert("This month's data not checked at least once, please check before send to Check")
                return
            }
            const TLup = { id: this.state.TLupId, name: this.state.TLupName, pos: this.state.TLupPos }
            const AMup = { id: this.state.AMupId, name: this.state.AMupName, pos: this.state.AMupPos }
            const AGMup = { id: this.state.AGMupId, name: this.state.AGMupName, pos: this.state.AGMupPos }
            var rectype = 0
            var creator = "" //for normal
            var arrCreator = ["", "", "", "", "", ""] //for chart
            var checker = ""
            var arrChecker = ["", "", "", "", "", ""]
            var approver = ""
            var arrApprover = ["", "", "", "", "", ""]
            var arrUpdate = []
            var status = ""
            var wkind = null
            if (type.includes("normal")) {
                rectype = 1
                creator = empid
                checker = TLup['id']
                approver = AMup['id']
            } else if (type.includes("chart") && type.includes("week")) {
                rectype = 2
                creator = empid
                checker = TLup['id']
                approver = AMup['id']
                wkind = Number(type.substring(type.length - 1, type.length)) - 1
            } else if (type.includes("chart") && type.includes("month")) {
                rectype = 2
                creator = empid
                checker = AMup['id']
                approver = AGMup['id']
                wkind = 5
            } else {
                alert("show input emp id type is not match")
            }
            console.log(rectype)
            console.log(creator)
            console.log(checker)
            console.log(approver)
            console.log(wkind)
            api.get(`/datarec/appqueue/itemlist/recordid_${apprvItemId}`)
                .then(res => {
                    var finCreator = ""
                    var finChecker = ""
                    var finApprover = ""
                    var iMax = 0
                    var iUpdate = 0
                    var stat = 0
                    if (res.data.length > 0) {
                        var curQueue = res.data[0]
                        console.log(curQueue)
                        arrCreator = res.data[0]['creator']
                        arrChecker = res.data[0]['checker']
                        arrApprover = res.data[0]['approver']
                    } else {
                        arrCreator[wkind] = creator
                        arrChecker[wkind] = checker
                        arrApprover[wkind] = approver
                    }
                    if (rectype === 2) {
                        finCreator = arrCreator.join(";")
                        finChecker = arrChecker.join(";")
                        finApprover = arrApprover.join(";")
                        iMax = 18
                        if (type.includes("create")) {
                            stat = 1
                            if (wkind !== null) {
                                iUpdate = wkind - 1
                            } else {
                                iUpdate = 5
                            }
                        } else if (type.includes("check")) {
                            stat = 2
                            if (wkind !== null) {
                                iUpdate = wkind + 5
                            } else {
                                iUpdate = 11
                            }
                        } else if (type.includes("approve")) {
                            stat = 3
                            if (wkind !== null) {
                                iUpdate = wkind + 11
                            } else {
                                iUpdate = 17
                            }
                        }
                    } else {
                        finCreator = creator
                        finChecker = checker
                        finApprover = approver
                        iMax = 4
                        if (type.includes("create")) {
                            stat = 1
                            iUpdate = 1
                        } else if (type.includes("check")) {
                            stat = 2
                            iUpdate = 2
                        } else if (type.includes("approve")) {
                            stat = 3
                            iUpdate = 3
                        }
                    }
                    for (var i = 1; i <= iMax; i++) {
                        arrUpdate.push("")
                    }
                    if (res.data.length === 0) {
                        //create
                        arrUpdate[0] = moment().format('YYYY-MM-DD HH:mm:ss')
                        arrUpdate[iUpdate] = moment().format('YYYY-MM-DD HH:mm:ss')
                        arrUpdate = arrUpdate.join(";")
                        api.post(`/datarec/appqueue/create/`, {
                            recordid: apprvItemId,
                            recordtype: rectype,
                            creator: finCreator,
                            checker: finChecker,
                            approver: finApprover,
                            status: stat,
                            update: arrUpdate
                        })
                            .then(res1 => {
                                console.log(res1)
                                this.getApproveQueue(apprvItemId)
                            })
                            .catch(err => {
                                alert("create queue error")
                                console.log(err)
                            })
                    } else {
                        //update
                        arrUpdate = res.data[0]['update'].split(";")
                        arrUpdate[iUpdate] = moment().format('YYYY-MM-DD HH:mm:ss')
                        arrUpdate = arrUpdate.join(";")
                        api.post(`/datarec/appqueue/${res.data[0]['id']}/update/`, {
                            recordid: apprvItemId,
                            recordtype: rectype,
                            creator: finCreator,
                            checker: finChecker,
                            approver: finApprover,
                            status: stat,
                            update: arrUpdate
                        })
                            .then(res2 => {
                                console.log(res2)
                                this.getApproveQueue(apprvItemId)
                            })
                            .catch(err => {
                                alert("create queue error")
                                console.log(err)
                            })
                    }
                })
                .catch(err => {
                    alert("get data approve queue error")
                    console.log(err)
                })
        })
    }

    TLupSelect = (id, name, pos) => {
        this.setState({
            TLupId: id,
            TLupName: name,
            TLupPos: pos,
        })
    }

    AMupSelect = (id, name, pos) => {
        this.setState({
            AMupId: id,
            AMupName: name,
            AMupPos: pos,
        })
    }

    checkMonthly = () => {
        this.setState({
            isLoading: true
        }, () => {
            const queID = this.state.approveQueueId
            const apprvId = this.state.approveItemId
            var arrUpdate = this.state.queueUpdate
            arrUpdate[2] = moment().format('YYYY-MM-DD HH:mm:ss')
            arrUpdate = arrUpdate.join(";")
            api.put(`/datarec/appqueue/${queID}/update/`, {
                status: "20",
                update: arrUpdate
            })
                .then(res => {
                    console.log(res)
                    this.getApproveQueue(apprvId)
                })
                .catch(err => {
                    alert("update check queue error")
                    console.log(err.response.data)
                })
        })
    }

    rejectCheckMonthlyToggle = () => {
        this.setState({
            rejectCheckMonthlyFlag: !this.state.rejectCheckMonthlyFlag
        })
    }

    rejectCheckMonthly = () => {
        this.setState({
            isLoading: true
        }, () => {
            const queID = this.state.approveQueueId
            const apprvId = this.state.approveItemId
            const comment = document.getElementById('inputrejectcheckmonthly').value
            var arrUpdate = this.state.queueUpdate
            arrUpdate[2] = moment().format('YYYY-MM-DD HH:mm:ss')
            arrUpdate = arrUpdate.join(";")
            api.put(`/datarec/appqueue/${queID}/update/`, {
                status: "21",
                update: arrUpdate,
                comment_check: comment
            })
                .then(res => {
                    console.log(res)
                    this.getApproveQueue(apprvId)
                    this.rejectCheckMonthlyToggle()
                })
                .catch(err => {
                    alert("reject check queue error")
                    console.log(err.response.data)
                })
        })
    }

    approveMonthly = () => {
        this.setState({
            isLoading: true
        }, () => {
            const queID = this.state.approveQueueId
            const apprvId = this.state.approveItemId
            var arrUpdate = this.state.queueUpdate
            arrUpdate[3] = moment().format('YYYY-MM-DD HH:mm:ss')
            arrUpdate = arrUpdate.join(";")
            api.put(`/datarec/appqueue/${queID}/update/`, {
                status: "30",
                update: arrUpdate
            })
                .then(res => {
                    console.log(res)
                    this.getApproveQueue(apprvId)
                })
                .catch(err => {
                    alert("update approve queue error")
                    console.log(err.response.data)
                })
        })
    }

    rejectApproveMonthlyToggle = () => {
        this.setState({
            rejectApproveMonthlyFlag: !this.state.rejectApproveMonthlyFlag
        })
    }

    rejectApproveMonthly = () => {
        this.setState({
            isLoading: true
        }, () => {
            const queID = this.state.approveQueueId
            const apprvId = this.state.approveItemId
            const comment = document.getElementById('inputrejectapprovemonthly').value
            var arrUpdate = this.state.queueUpdate
            arrUpdate[3] = moment().format('YYYY-MM-DD HH:mm:ss')
            arrUpdate = arrUpdate.join(";")
            api.put(`/datarec/appqueue/${queID}/update/`, {
                status: "31",
                update: arrUpdate,
                comment_approve: comment
            })
                .then(res => {
                    console.log(res)
                    this.getApproveQueue(apprvId)
                    this.rejectApproveMonthlyToggle()
                })
                .catch(err => {
                    alert("reject approve queue error")
                    console.log(err.response.data)
                })
        })
    }

    SearchDistinctBySection = (section) => {
        var distinctSection = this.state.sectionDistinct
        var filterSection = []
        distinctSection.forEach(sect => {
            if (sect['section'].includes(section)) {
                filterSection.push(sect)
            }
        })
        this.setState({
            filteredSectionDistinct: filterSection
        })
    }

    backToSectionDistinct = () => {
        this.setState({
            sectionDistinctView: false
        })
    }

    backToPartNoMonitor = () => {
        this.setState({
            currentViewNo: ""
        })
    }

    gotoPrevMonth = () => {
        const curDate = this.state.pickedDate
        const targetDate = new Date(moment(curDate).subtract(1, 'months'))
        this.setDateValue(targetDate)
    }

    gotoNextMonth = () => {
        const curDate = this.state.pickedDate
        const targetDate = new Date(moment(curDate).add(1, 'months'))
        this.setDateValue(targetDate)
    }

    test = () => {
        this.setState({
            isLoading: true
        }, () => {
            setTimeout(() => {
                this.setState({
                    isLoading: false
                })
            }, 1000)
        })
    }

    render() {
        const checkcolumns = [{
            dataField: 'list',
            text: 'Date',
            headerClasses: 'rec-header-check-date',
            classes: 'rec-cell-check',
            style: {
                fontWeight: 'bold'
            }
        }]
        for (var j = 1; j <= this.state.dayOfMonth; j++) {
            checkcolumns.push({
                dataField: j.toString(),
                text: j.toString(),
                headerClasses: 'rec-header-check',
                classes: 'rec-cell-check',
                formatter: checkFormatter,
            })
        }

        const amountcolumns = [{
            dataField: 'list',
            text: 'Date Shift',
            headerClasses: 'rec-header-check-date',
            classes: 'rec-cell-check',
            style: {
                fontWeight: 'bold'
            }
        }]
        for (j = 1; j <= this.state.dayOfMonth; j++) {
            amountcolumns.push({
                dataField: j.toString(),
                text: j.toString(),
                headerClasses: 'rec-header-check',
                classes: 'rec-cell-check',
            })
        }
        amountcolumns.push({
            dataField: 'sum',
            text: 'Sum',
            headerClasses: 'rec-header-sum',
            classes: 'rec-cell-sum',
            style: {
                backgroundColor: 'rgba(255,255,0,0.8)'
            }
        })

        const rowAmountClasses = (row, rowIndex) => {
            let classes = null
            if (row.list === "Sum") {
                classes = 'rec-data-amount-sum-row'
            }
            return classes
        }

        var columns = [{
            dataField: 'id',
            text: '',
            classes: 'rec-cell-fix',
            hidden: true,
        }, {
            dataField: 'itemid',
            text: 'No.',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word',
                fontWeight: 'bold'
            },
            headerClasses: 'rec-header-no',
            classes: 'rec-cell-fix',
            editable: false,
            hidden: this.state.hide,
            formatter: NoFormatter,
        }, {
            dataField: 'parameter',
            text: 'Parameter',
            style: {
            },
            headerClasses: 'rec-header-param',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'upperlimit',
            text: 'Upper',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-upper',
            classes: 'rec-cell-fix',
            editable: false,
            formatter: UpperFormatter,
        }, {
            dataField: 'lowerlimit',
            text: 'Lower',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-lower',
            classes: 'rec-cell-fix',
            editable: false,
            formatter: LowerFormatter
        }, {
            dataField: 'interval',
            text: 'Interval',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-interval',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'interval_n',
            text: 'N =',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-interval_n',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'method',
            text: 'Method',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-recmethod',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'tool',
            text: 'Tool',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-tool',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'meastimes',
            text: 'Meas. Times',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-meastimes',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'calmethod',
            text: 'Cal. Method',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-calmethod',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'masterval',
            text: 'Master Value',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-masterval',
            classes: 'rec-cell-fix-last',
            editable: false,
        }]
        var whenchangecolumns = [{
            dataField: 'id',
            text: '',
            classes: 'rec-cell-fix',
            hidden: true,
        }, {
            dataField: 'itemid',
            text: 'No.',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word',
                fontWeight: 'bold'
            },
            headerClasses: 'rec-header-no',
            classes: 'rec-cell-fix',
            editable: false,
            hidden: this.state.hide,
            formatter: NoFormatter,
        }, {
            dataField: 'parameter',
            text: 'Parameter',
            style: {
            },
            headerClasses: 'rec-header-param',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'upperlimit',
            text: 'Upper',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-upper',
            classes: 'rec-cell-fix',
            editable: false,
            formatter: UpperFormatter,
        }, {
            dataField: 'lowerlimit',
            text: 'Lower',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-lower',
            classes: 'rec-cell-fix',
            editable: false,
            formatter: LowerFormatter
        }, {
            dataField: 'interval',
            text: 'Interval',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-interval',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'interval_n',
            text: 'N =',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-interval_n',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'method',
            text: 'Method',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-recmethod',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'tool',
            text: 'Tool',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-tool',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'meastimes',
            text: 'Meas. Times',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-meastimes',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'calmethod',
            text: 'Cal. Method',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-calmethod',
            classes: 'rec-cell-fix',
            editable: false,
        }, {
            dataField: 'masterval',
            text: 'Master Value',
            style: {
                textAlign: 'center',
                wordWrap: 'break-word'
            },
            headerClasses: 'rec-header-masterval',
            classes: 'rec-cell-fix-last',
            editable: false,
        }]
        for (var i = 1; i <= this.state.maxInterval; i++) {
            columns.push({
                dataField: `data${i}`,
                text: `Data ${i}`,
                i: i,
                formatter: dataFormatter,
                formatExtraData: { index: i },
                headerStyle: (colum, colIndex) => {
                    return { textAlign: 'center', fontSize: '13px' }
                },
                style: {
                    fontWeight: 'bold',
                    textAlign: 'center',
                    wordWrap: 'break-word'
                },
                headerClasses: 'rec-header-cell-edit',
                classes: (cell, row, rowIndex, colIndex) => {
                    if (colIndex <= 10 + (this.state.recordTableDataFiltered[rowIndex]['intervalcount'] * this.state.recordTableDataFiltered[rowIndex]['interval_n'])) {
                        return 'rec-cell-edit'
                    }
                    return 'rec-cell-no-edit'
                },
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        console.log(row)
                        this.setSelectedRow(columnIndex, row, rowIndex)
                    }
                },
                editable: (content, row, rowIndex, columnIndex) => {
                    if (columnIndex <= 10 + (this.state.recordTableDataFiltered[rowIndex]['intervalcount'] * this.state.recordTableDataFiltered[rowIndex]['interval_n'])) {
                        return true
                    }
                    return false
                },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
                    const times = this.state.recordTableDataFiltered[rowIndex]['meastimes']
                    const read = this.state.recordTableDataFiltered[rowIndex]['read']
                    const recmet = this.state.recordTableDataFiltered[rowIndex]['method']
                    const calmet = this.state.recordTableDataFiltered[rowIndex]['calmethod']
                    const masterval = this.state.recordTableDataFiltered[rowIndex]['masterval']
                    const interval = this.state.recordTableDataFiltered[rowIndex]['interval']
                    return <CustomEditor
                        {...editorProps}
                        value={value}
                        meastimes={times}
                        readability={read}
                        recordmethod={recmet}
                        calmethod={calmet}
                        masterval={masterval}
                        rowi={rowIndex}
                        coli={columnIndex}
                        interval={interval}
                    />
                }
            })
        }
        for (var i = 1; i <= this.state.whenchangemaxInterval; i++) {
            whenchangecolumns.push({
                dataField: `data${i}`,
                text: `Data ${i}`,
                i: i,
                formatter: dataFormatter,
                formatExtraData: { index: i },
                headerStyle: (colum, colIndex) => {
                    return { textAlign: 'center', fontSize: '13px' }
                },
                style: {
                    fontWeight: 'bold',
                    textAlign: 'center',
                    wordWrap: 'break-word'
                },
                headerClasses: 'rec-header-cell-edit',
                classes: (cell, row, rowIndex, colIndex) => {
                    if (colIndex <= 10 + (this.state.recordTableWhenchangeDataFiltered[rowIndex]['intervalcount'] * this.state.recordTableWhenchangeDataFiltered[rowIndex]['interval_n'] * this.state.recordTableWhenchangeDataFiltered[rowIndex]['interval_wc'])) {
                        return 'rec-cell-edit'
                    }
                    return 'rec-cell-no-edit'
                },
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        this.setwhenchangeSelectedRow(columnIndex, row, rowIndex)
                    }
                },
                editable: (content, row, rowIndex, columnIndex) => {
                    if (columnIndex <= 10 + (this.state.recordTableWhenchangeDataFiltered[rowIndex]['intervalcount'] * this.state.recordTableWhenchangeDataFiltered[rowIndex]['interval_n'] * this.state.recordTableWhenchangeDataFiltered[rowIndex]['interval_wc'])) {
                        return true
                    }
                    return false
                },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
                    const times = this.state.recordTableWhenchangeDataFiltered[rowIndex]['meastimes']
                    const read = this.state.recordTableWhenchangeDataFiltered[rowIndex]['read']
                    const recmet = this.state.recordTableWhenchangeDataFiltered[rowIndex]['method']
                    const calmet = this.state.recordTableWhenchangeDataFiltered[rowIndex]['calmethod']
                    const masterval = this.state.recordTableWhenchangeDataFiltered[rowIndex]['masterval']
                    const interval = this.state.recordTableWhenchangeDataFiltered[rowIndex]['interval']
                    return <CustomEditor
                        {...editorProps}
                        value={value}
                        meastimes={times}
                        readability={read}
                        recordmethod={recmet}
                        calmethod={calmet}
                        masterval={masterval}
                        rowi={`wc_${rowIndex}`}
                        coli={columnIndex}
                        interval={interval}
                    />
                }
            })
        }

        function NoFormatter(cell, row, rowIndex, formatExtraData) {
            return (
                <div className="rec-data-table-no">
                    <p>{cell}</p>
                    <FontAwesomeIcon id={`vgraph${rowIndex}`} icon={faChartLine} onClick={() => { row.method === "Check sheet" ? viewCheckData(row) : viewGraphData(row) }} />
                    <UncontrolledTooltip placement="top" target={`vgraph${rowIndex}`} hideArrow={true} >
                        View graph
                    </UncontrolledTooltip>
                </div>
            )
        }

        function UpperFormatter(cell, row, rowIndex) {
            if (row.method === "x-R chart" || row.method === "x-Rs chart") {
                return (
                    <div className="rec-data-table-limit">
                        <p id="rec-data-ucl">{row.ucl}</p>
                        <UncontrolledTooltip placement="top" target="rec-data-ucl" hideArrow={true} >
                            {"UCL"}
                        </UncontrolledTooltip>
                        <p>{`(${cell})`}</p>
                    </div>
                )
            } else {
                return (
                    <span>{cell}</span>
                )
            }
        }

        function LowerFormatter(cell, row, rowIndex) {
            if (row.method === "x-R chart" || row.method === "x-Rs chart") {
                return (
                    <div className="rec-data-table-limit">
                        <p id="rec-data-lcl">{row.lcl}</p>
                        <UncontrolledTooltip placement="top" target="rec-data-lcl" hideArrow={true} >
                            {"LCL"}
                        </UncontrolledTooltip>
                        <p>{`(${cell})`}</p>
                    </div>
                )
            } else {
                return (
                    <span>{cell}</span>
                )
            }
        }

        function dataFormatter(cell, row, rowIndex, formatExtraData) {
            var val = Number.parseFloat(cell)
            var inclu = false
            if (cell !== undefined && cell !== null) {
                if (cell.includes("\n")) {
                    inclu = true
                }
            }
            //if (inclu) {
            if (cell !== undefined && cell !== null) {
                val = cell.split("\n")
                val.forEach((value, ind) => {
                    val[ind] = Number.parseFloat(value)
                })
            }
            const upper = Number.parseFloat(row.upperlimit)
            const lower = Number.parseFloat(row.lowerlimit)
            const ucl = Number(row.ucl)
            const lcl = Number(row.lcl)
            var clas = "rec-data-table-cell-ok"
            var ngFlag = false
            var overCL = false
            if (row.method === "Check sheet") {
                if (cell === "O" || cell === "") {
                    clas = "rec-data-table-cell-ok"
                } else {
                    clas = "rec-data-table-cell-ng"
                }
            } else {
                var isnan = false
                //console.log(cell)
                //console.log(val)
                if (cell !== undefined && cell !== null && inclu) {
                    val.forEach(value => {
                        if (isNaN(value)) {
                            isnan = true
                        }
                    })
                }
                //console.log(cell)
                //console.log(isnan)
                //console.log(val)
                //console.log(!isnan && inclu)
                if (cell !== "" && (!isNaN(val) || (!isnan && inclu))) {
                    val.forEach(value => {
                        //console.log(value)
                        if (!isNaN(upper) && !isNaN(lower)) { //normal limit
                            if (value > upper || value < lower) {
                                ngFlag = true
                            }
                        } else if (!isNaN(upper) && isNaN(lower)) { //upper only
                            if (value > upper) {
                                ngFlag = true
                            }
                        } else if (isNaN(upper) && !isNaN(lower)) { //lower only
                            if (value < lower) {
                                ngFlag = true
                            }
                        }
                        if (row.method === "x-R chart" || row.method === "x-Rs chart") {
                            //console.log(row.ucl)
                            if ((val > ucl || val < lcl) && row.ucl !== "" && row.lcl !== "") {
                                if (!isNaN(upper) && val < upper) {
                                    overCL = true
                                }
                                if (!isNaN(lower) && val > lower) {
                                    overCL = true
                                }
                            }
                        }
                    })
                }
                if (overCL) {
                    clas = "rec-data-table-cell-warn"
                }
                if (ngFlag) {
                    clas = "rec-data-table-cell-ng"
                }
            }
            return (
                <>
                    <p
                        id={`span${rowIndex}-${formatExtraData.index}`}
                        className={clas}
                        onMouseEnter={() => showPopOver(rowIndex, formatExtraData.index, row.itemid, ngFlag || overCL)}
                        onMouseLeave={() => hidePopOver()}
                    >
                        {cell}
                    </p>
                </>
            )
        }

        function checkFormatter(cell, row, rowIndex) {
            if (cell === "O") {
                return (
                    <p className="rec-cell-check-o">{cell}</p>
                )
            } else {
                return (
                    <p className="rec-cell-check-x">{cell}</p>
                )
            }
        }

        const selectRow = {
            mode: 'checkbox',
            clickToEdit: true,
            hideSelectColumn: true,
            bgColor: '#FFFF00',
            selected: this.state.selectedRow,
        }

        const whenchangeselectRow = {
            mode: 'checkbox',
            clickToEdit: true,
            hideSelectColumn: true,
            bgColor: '#FFFF00',
            selected: this.state.whenchangeselectedRow,
        }

        const checkInput = (row, col, newValue) => {
            //console.log(col)
            if (this.checkInputCondition(row, newValue)) { //ok
                const resCheck = this.checkTrendData("record", row.itemid, newValue, col, row)
                console.log(resCheck)
                if (resCheck === 0) {
                    return true
                } else {
                    const msgPromt = {
                        1: "Abnormal : Value within PCS limit, but over UCL or LCL",
                        2: "Abnormal : Run 7 points continuously",
                        3: "Abnormal : Run up/down 7 points continuously",
                        4: "Abnormal : Incline 12/14 or 10/11 points",
                        5: "Abnormal : Near Control Limit 2/3 points",
                        6: "Abnormal : Cycle pattern",
                    }
                    var msg = prompt(`${msgPromt[resCheck]}, Enter your comment`)
                    if (msg !== "" && msg !== null) {
                        //console.log("true")
                        const colind = col.i
                        this.setState({
                            selectedRow: [],
                            whenchangeselectedRow: [],
                            inputMsg: {
                                ...this.state.inputMsg,
                                [row.itemid]: {
                                    ...this.state.inputMsg[row.itemid],
                                    [colind]: msg
                                }
                            }
                        }, () => {
                            //console.log(this.state.inputMsg)
                        })
                        return true
                    } else {
                        //console.log("false")
                        this.setState({
                            selectedRow: [],
                            whenchangeselectedRow: []
                        })
                        return false
                    }
                }
            } else { //ng
                if (newValue === "") {
                    this.setState({
                        selectedRow: [],
                        whenchangeselectedRow: []
                    })
                    return false
                }
                if (newValue === " ") {
                    this.setState({
                        selectedRow: [],
                        whenchangeselectedRow: []
                    })
                    return true
                }
                msg = prompt("Value out of PCS limit, Enter your comment")
                //console.log(msg)
                if (msg !== "" && msg !== null) {
                    //console.log("true")
                    const colind = col.i
                    this.setState({
                        selectedRow: [],
                        whenchangeselectedRow: [],
                        inputMsg: {
                            ...this.state.inputMsg,
                            [row.itemid]: {
                                ...this.state.inputMsg[row.itemid],
                                [colind]: msg
                            }
                        }
                    }, () => {
                        //console.log(this.state.inputMsg)
                    })
                    return true
                } else {
                    //console.log("false")
                    this.setState({
                        selectedRow: [],
                        whenchangeselectedRow: []
                    })
                    return false
                }
            }
        }

        const selectNextRecord = (row, col) => {
            this.selectNextRecord(row, col)
        }

        const selectNextRecordwhenchange = (row, col) => {
            this.selectNextRecordwhenchange(row, col)
        }

        const showPopOver = (row, col, itemid, ngFlag) => {
            //console.log("mouse enter")
            if (ngFlag) {
                this.showPopOver(row, col, itemid)
            }
        }

        const hidePopOver = () => {
            this.hidePopOver()
        }

        const viewGraphData = (row) => {
            this.viewGraphData(row)
        }

        const viewCheckData = (row) => {
            this.viewCheckData(row)
        }

        const DatePickerWrapper = styled.div`${this.state.styledProgressCalendar}`

        return (
            <div className="rec-data-main" >
                <h1 className="title">
                    {(!Empview && !Monitorview) &&
                        "Record Data Control Items"
                    }
                    {(Empview && !Monitorview) &&
                        "Approve Record Data Control Items"
                    }
                    {(Monitorview) &&
                        "Monitor Record Data Control Items"
                    }
                </h1>
                <h1 className="title-1">
                    {Editview &&
                        "Current logged in user is not authorize to access this page"
                    }
                </h1>
                {(this.state.approveView && Empview && Recordview) &&
                    <div className="rec-data-approve-main">
                        <div className="rec-data-approve-search">
                            <p className="search-txt">{'Section code'}</p>
                            <InputGroup>
                                <Input placeholder="Input Section code ..." id="approve-search-section" onChange={() => this.approveSearch()} />
                            </InputGroup>
                            <p className="search-txt">{'Part no.'}</p>
                            <InputGroup>
                                <Input placeholder="Input Part no. ..." id="approve-search-partno" onChange={() => this.approveSearch()} />
                            </InputGroup>
                        </div>
                        <div className="rec-data-approve-search">
                            <p className="search-txt">{`Month (ex. '2021-06')`}</p>
                            <InputGroup>
                                <Input placeholder="Input Month ..." id="approve-search-month" onChange={() => this.approveSearch()} />
                            </InputGroup>
                            <p className="search-txt">{'Status'}</p>
                            <InputGroupButtonDropdown
                                className={"rec-data-approve-search-dropdown"}
                                addonType="append" isOpen={this.state.statusSearchOpen} toggle={() => this.toggleDropDown("status search")} >
                                <DropdownToggle caret >
                                    {this.state.statusSearchTxt}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.statusSearchSelect("All status", "")} >{"All Status"}</DropdownItem>
                                    <DropdownItem onClick={() => this.statusSearchSelect("Waiting to check", "1")} >{"Waiting to check"}</DropdownItem>
                                    <DropdownItem onClick={() => this.statusSearchSelect("Checked and Waiting to approve", "20")} >{"Checked and Waiting to approve"}</DropdownItem>
                                    <DropdownItem onClick={() => this.statusSearchSelect("Check rejected", "21")} >{"Check rejected"}</DropdownItem>
                                    <DropdownItem onClick={() => this.statusSearchSelect("Approved", "30")} >{"Approved"}</DropdownItem>
                                    <DropdownItem onClick={() => this.statusSearchSelect("Approve reject", "31")} >{"Approve reject"}</DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        </div>
                        <div className="table-responsive">
                            <Table striped hover responsive>
                                <thead>
                                    <tr>
                                        <th id="rec-data-approve-col1"></th>
                                        <th id="rec-data-approve-col2">Section</th>
                                        <th id="rec-data-approve-col3">Line name</th>
                                        <th id="rec-data-approve-col4">Part no.</th>
                                        <th id="rec-data-approve-col5">Shift</th>
                                        <th id="rec-data-approve-col6">Process</th>
                                        <th id="rec-data-approve-col7">Month</th>
                                        <th id="rec-data-approve-col8">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.filteredApproveLists.map((item, ind) => {
                                        if (ind === 0) {
                                            cntResults = 0
                                        }
                                        cntResults++
                                        if (cntResults <= perPage * this.state.pageActive && cntResults > perPage * (this.state.pageActive - 1)) {
                                            return (
                                                <tr key={ind}>
                                                    <td className="rec-data-col1-td">
                                                        <FontAwesomeIcon id={`enterRecPart${ind}`} icon={faAngleDoubleRight} onClick={() => this.selectSectionApprove(item.section, item.partno, item.shift, item.ym, item.process)} />
                                                        {this.unControlToolTipPack(`enterRecPart${ind}`, "Select")}
                                                    </td>
                                                    <td>{item.section}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.partno}</td>
                                                    <td>{item.shift}</td>
                                                    <td>{item.process}</td>
                                                    <td>{item.ym}</td>
                                                    {item.status === "1" &&
                                                        <td style={{ color: "blue", fontWeight: "bold" }}>{"Waiting to check"}</td>
                                                    }
                                                    {item.status === "20" &&
                                                        <td style={{ color: "blue", fontWeight: "bold" }}>{"Checked and Waiting to approve"}</td>
                                                    }
                                                    {item.status === "21" &&
                                                        <td style={{ color: "red", fontWeight: "bold" }}>{"Check rejected"}</td>
                                                    }
                                                    {item.status === "30" &&
                                                        <td style={{ color: "green", fontWeight: "bold", fontStyle: "italic" }}>{"Approved"}</td>
                                                    }
                                                    {item.status === "31" &&
                                                        <td style={{ color: "red", fontWeight: "bold" }}>{"Approve reject"}</td>
                                                    }
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
                {(!this.state.approveView && Recordview) &&
                    <>
                        {/*<Button id={'testbutton'} onClick={() => this.test()}>Test</Button>*/}
                        {/*this.state.isLoading && <h5>True</h5>*/}
                        {/*<Button id={'testbutton'} onClick={() => this.testMQTT()}>MQTT</Button>*/}
                        {Monitorview && <Button onClick={() => this.showImport()}>Show Import</Button>}
                        {this.state.showImport &&
                            <>
                                <p>1.process file</p>
                                <FormGroup>
                                    <Input type="file" name="file" id="csvfile" />
                                </FormGroup>
                                <p>2.</p>
                                <Button onClick={() => this.readCSVFile()}>Import1</Button>
                                <p>3.part no</p>
                                <Input type="text" id="month" />
                                <p>4.</p>
                                <Button onClick={() => this.filterCSV()}>insert Process</Button>
                                <p>5.control items file</p>
                                <FormGroup>
                                    <Input type="file" name="file" id="csvfilectrl" />
                                </FormGroup>
                                <p>6.</p>
                                <Button onClick={() => this.readCSVFile2()}>Import2</Button>
                                <p>7.</p>
                                <Button onClick={() => this.addItemCSV()}>insert Item</Button>
                                <p>8. error details</p>
                                <Button onClick={() => this.checkAddItemCSV()}>Error Details</Button>
                                <p>9.data file</p>
                                <Input type="file" id="csvfiledata" />
                                <p>10.</p>
                                <Button onClick={() => this.readCSVFile3()}>Import3</Button>
                                <p>11. shift</p>
                                <Input type="text" id="shiftdata" />
                                <p>12.</p>
                                <Button onClick={() => this.addDataCSV()}>insert data</Button>
                            </>
                        }
                        {this.state.saveCSV &&
                            <p>Saving ...</p>
                        }
                        {(Monitorview && !this.state.sectionDistinctView) &&
                            <div className="rec-data-partno">
                                <div className="regis-head">
                                    <div className="regis-table-search">
                                        <p className="search-txt">{'Search Section'}</p>
                                        <InputGroup>
                                            <Input placeholder="Input Section ..." id="section-search" onChange={(e) => this.SearchDistinctBySection(e.target.value)} autoComplete="off" />
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <Table striped hover responsive>
                                        <thead>
                                            <tr>
                                                <th id="rec-data-sect1"></th>
                                                <th id="rec-data-sect2">Section</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.filteredSectionDistinct.map((item, ind) => {
                                                return (
                                                    <tr key={ind}>
                                                        <td className="rec-data-sect1-td">
                                                            <FontAwesomeIcon id={`enterDistSect${ind}`} icon={faAngleDoubleRight} onClick={() => this.toggleMonitorSectionView(item.section)} />
                                                            {this.unControlToolTipPack(`enterDistSect${ind}`, "Select")}
                                                        </td>
                                                        <td>{item.section}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        }
                        {((!Monitorview && this.state.currentViewNo === "") || (Monitorview && this.state.currentViewNo === "" && this.state.sectionDistinctView)) &&
                            <div className="rec-data-partno">
                                <div className="regis-head">
                                    <div className="rec-data-table-search">
                                        {/*<Button onClick={() => this.getDevices()}>get device</Button>*/}
                                        {Monitorview &&
                                            <FontAwesomeIcon id="backSectDist" icon={faAngleDoubleLeft} onClick={() => this.backToSectionDistinct()} />
                                        }
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
                                                <th id="rec-data-col1"></th>
                                                <th id="rec-data-col2">Part no.</th>
                                                <th id="rec-data-col3">Part name</th>
                                                <th id="rec-data-col4">Model</th>
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
                                                            <td className="rec-data-col1-td">
                                                                <FontAwesomeIcon id={`enterRecPart${ind}`} icon={faAngleDoubleRight} onClick={() => this.toggleView(item.partno)} />
                                                                {this.unControlToolTipPack(`enterRecPart${ind}`, "Select")}
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
                            </div>
                        }
                        {this.state.currentViewNo !== "" &&
                            <div className="rec-data-record">
                                {Monitorview &&
                                    <>
                                        {this.state.approveDataView ?
                                            <>
                                                <FontAwesomeIcon id="backPart" icon={faAngleDoubleLeft} onClick={() => this.backToProcessView()} />
                                                <b>Back</b>
                                            </>
                                            :
                                            <>
                                                <FontAwesomeIcon id="backApprove" icon={faAngleDoubleLeft} onClick={() => this.backToPartNoMonitor()} />
                                                <b>Back</b>
                                            </>

                                        }
                                        <div className="rec-data-cur-text">
                                            <p>Current Part no. :</p>
                                            <p>{this.state.currentViewNo}</p>
                                        </div>
                                        <div className="rec-data-date-group">
                                            <Button id="prevRecDate" onClick={() => this.gotoPrevMonth()} >
                                                <FontAwesomeIcon icon={faAngleLeft} />
                                                {this.unControlToolTipPack("prevRecDate", "prev Month")}
                                            </Button>
                                            <div className="rec-data-datepicker">
                                                <DatePicker
                                                    dateFormat="MM/yyyy"
                                                    closeOnScroll={true}
                                                    selected={this.state.pickedDate}
                                                    onChange={(date) => this.setDateValue(date)}
                                                    showMonthYearPicker
                                                />
                                            </div>
                                            <Button id="nextRecDate" onClick={() => this.gotoNextMonth()} disabled={this.state.disableNextMonth}>
                                                <FontAwesomeIcon icon={faAngleRight} />
                                                {this.unControlToolTipPack("nextRecDate", "next Month")}
                                            </Button>
                                            <div className="rec-data-shift-btn">
                                                <span>Shift : </span>
                                                <ButtonGroup>
                                                    <Button onClick={() => this.selectShift('A')} active={this.state.shift === 'A'}>A</Button>
                                                    <Button onClick={() => this.selectShift('B')} active={this.state.shift === 'B'}>B</Button>
                                                </ButtonGroup>
                                            </div>
                                            <div className="rec-data-work">
                                                {this.state.saveWork && <p>Saving...</p>}
                                                <FontAwesomeIcon id="calendaramount" icon={faCalendarAlt} onClick={() => this.showCalendarAmount()} />
                                                {this.unControlToolTipPack("calendaramount", "Monthly")}
                                                <p>{`Work amount : `}</p>
                                                <Input type="text" placeholder="..." id="workamount" onChange={() => this.workAmountChange()} autoComplete="off" />
                                                {!this.state.tableView &&
                                                    <Button color={this.state.tableDataChange ? "secondary" : "success"}
                                                        onClick={() => this.saveWorkAmount()} >
                                                        {this.state.tableDataChange ? "*Save" : "Save"}
                                                    </Button>
                                                }
                                            </div>
                                        </div>
                                    </>
                                }
                                {!Empview &&
                                    <>
                                        <div className="rec-data-cur-text">
                                            {this.state.tableView ?
                                                <>
                                                    <FontAwesomeIcon id="backRecProc" icon={faAngleDoubleLeft} onClick={() => this.backToProcess()} />
                                                </>
                                                :
                                                <>
                                                    <FontAwesomeIcon id="backRecPart" icon={faAngleDoubleLeft} onClick={() => !Empview ? this.backToPartno() : this.backToApproveView()} />
                                                </>
                                            }
                                            <p>Current Part no. :</p>
                                            <p>{this.state.currentViewNo}</p>
                                        </div>
                                        <div className="rec-data-date-group">
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
                                            <div className="rec-data-work">
                                                {this.state.saveWork && <p>Saving...</p>}
                                                <FontAwesomeIcon id="calendaramount" icon={faCalendarAlt} onClick={() => this.showCalendarAmount()} />
                                                {this.unControlToolTipPack("calendaramount", "Monthly")}
                                                <p>{`Work amount : `}</p>
                                                <Input type="text" placeholder="..." id="workamount" onChange={() => this.workAmountChange()} autoComplete="off" />
                                                {!this.state.tableView &&
                                                    <Button color={this.state.tableDataChange ? "secondary" : "success"}
                                                        onClick={() => this.saveWorkAmount()} >
                                                        {this.state.tableDataChange ? "*Save" : "Save"}
                                                    </Button>
                                                }
                                            </div>
                                        </div>
                                    </>
                                }

                                {((!Empview && !this.state.tableView) || (Empview && !this.state.approveDataView)) &&
                                    <div className="rec-data-table-process">
                                        {(Empview && !Monitorview) &&
                                            <>
                                                <FontAwesomeIcon id="backApprove" icon={faAngleDoubleLeft} onClick={() => this.backToApproveView()} />
                                                <b>Back</b>
                                            </>
                                        }
                                        <Table striped hover responsive>
                                            <thead>
                                                <tr>
                                                    <th id="rec-data-col1">
                                                        <FontAwesomeIcon id="helpprocess" icon={faQuestionCircle} />
                                                        {this.unControlToolTipPackHelp("helpprocess")}
                                                    </th>
                                                    <th id="rec-data-proc-col2">Process</th>
                                                    <th id="rec-data-proc-col2-1">Status</th>
                                                    {!Empview &&
                                                        <th id="rec-data-proc-col3">Progress (Daily)</th>
                                                    }
                                                    <th id="rec-data-proc-col4">
                                                        <FontAwesomeIcon id="calendarprogress" icon={faCalendarAlt} onClick={() => this.showCalendarProgress()} />
                                                        {this.unControlToolTipPack("calendarprogress", "Show Calendar")}
                                                        <span>Progress (Monthly)</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="rec-data-table-process-tr-sum">
                                                    <td></td>
                                                    <td>Overall</td>
                                                    <td></td>
                                                    {!Empview &&
                                                        <td
                                                            style={{ 'color': this.state.countRecordedDayAllProc === this.state.countRecordAllDayAllProc ? 'blue' : 'red' }}
                                                            className="rec-data-table-process-day-sum">
                                                            {`${this.state.countRecordedDayAllProc}/${this.state.countRecordAllDayAllProc} (${this.state.countPercentRecordDayAllProc}%)`}
                                                        </td>
                                                    }
                                                    <td
                                                        style={{ 'color': this.state.countRecordedMonthAllProc === this.state.countRecordAllMonthAllProc ? 'blue' : 'red' }}
                                                        className="rec-data-table-process-month-sum">
                                                        {`${this.state.countRecordedMonthAllProc}/${this.state.countRecordAllMonthAllProc} (${this.state.counPercentRecordMonthAllProc}%)`}
                                                    </td>
                                                </tr>
                                                {this.state.processLists.map((list, ind) => {
                                                    /*if (ind === 0) {
                                                        cntResults = 0
                                                    }
                                                    cntResults++
                                                    if (cntResults <= perPage * this.state.pageActive && cntResults > perPage * (this.state.pageActive - 1)) {*/
                                                    //console.log(list)
                                                    var all0 = "-"
                                                    var all1 = "-"
                                                    var perall = "-"
                                                    var allMonth0 = "-"
                                                    var allMonth1 = "-"
                                                    var perallMonth = "-"
                                                    var showExclaim = false
                                                    var showApprove = false
                                                    const date = moment(this.state.pickedDate).format('D')
                                                    const ngDayData = this.state.ngDataProcess
                                                    const approveDataProcess = this.state.approveDataProcess
                                                    if (list.all !== undefined) {
                                                        if (Object.keys(list.all[0]).length !== 0 && Object.keys(list.all[1]).length !== 0) {
                                                            if (list.all[0][date] !== undefined) {
                                                                all0 = list.all[0][date]
                                                                all1 = list.all[1][date]
                                                            }
                                                            perall = Number.parseFloat(all0 / all1 * 100).toFixed(2)
                                                        }
                                                    }
                                                    if (list.allMonth !== undefined) {
                                                        allMonth0 = list.allMonth[0]
                                                        allMonth1 = list.allMonth[1]
                                                        perallMonth = Number.parseFloat(allMonth0 / allMonth1 * 100).toFixed(2)
                                                    }
                                                    if (isNaN(perall)) {
                                                        perall = 0
                                                    }
                                                    if (isNaN(perallMonth)) {
                                                        perallMonth = 0
                                                    }
                                                    var lvProgress = 0
                                                    if (perall >= 100) {
                                                        lvProgress = 4
                                                    } else if (perall >= 75) {
                                                        lvProgress = 3
                                                    } else if (perall >= 50) {
                                                        lvProgress = 2
                                                    } else if (perall >= 25) {
                                                        lvProgress = 1
                                                    } else {
                                                        lvProgress = 0
                                                    }
                                                    if (ngDayData[ind] !== undefined) {
                                                        if (ngDayData[ind].includes(date)) {
                                                            showExclaim = true
                                                        }
                                                    }
                                                    if (approveDataProcess[ind] !== undefined) {
                                                        //console.log(Number(date) - 1)
                                                        //console.log(approveDataProcess[ind][Number(date) - 1])
                                                        if (approveDataProcess[ind][Number(date) - 1] === 1) {
                                                            showApprove = true
                                                        }
                                                    }

                                                    return (
                                                        <tr key={ind}>
                                                            {(!Empview || (Empview && list.process === this.state.approveProcess) || Monitorview) ?
                                                                <td className="rec-data-col1-td">
                                                                    <FontAwesomeIcon id={`enterRecProc${ind}`} icon={faAngleDoubleRight} onClick={() => Empview ? this.toggleDataView(list.process, ind) : this.toggleTableView(list.process, ind)} />
                                                                    {this.unControlToolTipPack(`enterRecProc${ind}`, "Select")}
                                                                </td>
                                                                :
                                                                <td></td>
                                                            }
                                                            <td>{list.process}</td>
                                                            <td>
                                                                {lvProgress === 0 &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`bat0${ind}`} icon={faBatteryEmpty} className="rec-data-battery" style={{ 'color': 'red' }} />
                                                                        {this.unControlToolTipPack(`bat0${ind}`, "0~25%")}
                                                                    </>
                                                                }
                                                                {lvProgress === 1 &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`bat1${ind}`} icon={faBatteryQuarter} className="rec-data-battery" style={{ 'color': 'rgb(255, 138, 42)' }} />
                                                                        {this.unControlToolTipPack(`bat1${ind}`, "25~50%")}
                                                                    </>
                                                                }
                                                                {lvProgress === 2 &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`bat2${ind}`} icon={faBatteryHalf} className="rec-data-battery" style={{ 'color': 'rgb(255, 138, 42)' }} />
                                                                        {this.unControlToolTipPack(`bat2${ind}`, "50~75%")}
                                                                    </>
                                                                }
                                                                {lvProgress === 3 &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`bat3${ind}`} icon={faBatteryThreeQuarters} className="rec-data-battery" style={{ 'color': 'rgb(34, 172, 41)' }} />
                                                                        {this.unControlToolTipPack(`bat3${ind}`, "75~99%")}
                                                                    </>
                                                                }
                                                                {lvProgress === 4 &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`bat4${ind}`} icon={faBatteryFull} className="rec-data-battery" style={{ 'color': 'blue' }} />
                                                                        {this.unControlToolTipPack(`bat4${ind}`, "100%")}
                                                                    </>
                                                                }
                                                                {showExclaim &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`ng${ind}`} icon={faExclamationCircle} className="rec-data-exclam" />
                                                                        {this.unControlToolTipPack(`ng${ind}`, "NG data")}
                                                                    </>
                                                                }
                                                                {!showApprove &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`nocheck${ind}`} icon={faCheckCircle} className="rec-data-notcheck" />
                                                                        {this.unControlToolTipPack(`nocheck${ind}`, "Not check")}
                                                                    </>
                                                                }
                                                                {showApprove &&
                                                                    <>
                                                                        <FontAwesomeIcon id={`check${ind}`} icon={faCheckCircle} className="rec-data-check" />
                                                                        {this.unControlToolTipPack(`check${ind}`, "Checked")}
                                                                    </>
                                                                }
                                                            </td>
                                                            {!Empview &&
                                                                <td>{`${all0}/${all1} (${perall}%)`}</td>
                                                            }
                                                            <td>{`${allMonth0}/${allMonth1} (${perallMonth}%)`}</td>
                                                        </tr>
                                                    )
                                                    /*} else {
                                                        return null
                                                    }*/
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                }

                                {((!Empview && this.state.tableView) || (Empview && this.state.approveDataView)) &&
                                    <>
                                        {(Empview && !Monitorview) &&
                                            <>
                                                <FontAwesomeIcon id="backPart" icon={faAngleDoubleLeft} onClick={() => this.backToProcessView()} />
                                                <b>Back</b>
                                            </>
                                        }
                                        <div className="rec-data-process">
                                            {!Empview &&
                                                <div className="rec-data-process-np">
                                                    <Button id="prevRecProc" onClick={() => this.gotoPrevProcess()} disabled={this.state.disablePrevProc}>
                                                        <FontAwesomeIcon icon={faAngleLeft} />
                                                        {this.unControlToolTipPack("prevRecProc", "prev Process")}
                                                    </Button>
                                                </div>
                                            }
                                            <InputGroupButtonDropdown
                                                className={this.state.processSelected ? 'rec-proc-dropdown-selected' : 'rec-proc-dropdown-noselect'}
                                                addonType="append" isOpen={this.state.processOpen} toggle={() => this.toggleDropDown("process")} >
                                                <DropdownToggle caret >
                                                    {this.state.processText}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {this.state.processLists.map((list, ind) => (
                                                        <DropdownItem key={ind} onClick={() => this.processSelect(list.process, ind)} >{list.process}</DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                            {!Empview &&
                                                <div className="rec-data-process-np">
                                                    <Button id="nextRecProc" onClick={() => this.gotoNextProcess()} disabled={this.state.disableNextProc}>
                                                        <FontAwesomeIcon icon={faAngleRight} />
                                                        {this.unControlToolTipPack("nextRecProc", "next Process")}
                                                    </Button>
                                                </div>
                                            }
                                        </div>
                                        {!Empview &&
                                            <div className="rec-data-type-filter">
                                                <span>Method : </span>
                                                <InputGroupButtonDropdown
                                                    className='rec-proc-dropdown-selected'
                                                    addonType="append" isOpen={this.state.typeFilterOpen} toggle={() => this.toggleDropDown("typefilter")} >
                                                    <DropdownToggle caret >
                                                        {this.state.typeFilter}
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem onClick={() => this.selectTypeFilter("All")} >All</DropdownItem>
                                                        <DropdownItem onClick={() => this.selectTypeFilter("Check sheet")} >Check sheet</DropdownItem>
                                                        <DropdownItem onClick={() => this.selectTypeFilter("Record sheet")} >Record sheet</DropdownItem>
                                                        <DropdownItem onClick={() => this.selectTypeFilter("x-R chart")} >x-R chart</DropdownItem>
                                                        <DropdownItem onClick={() => this.selectTypeFilter("x-Rs chart")} >x-Rs chart</DropdownItem>
                                                    </DropdownMenu>
                                                </InputGroupButtonDropdown>
                                                {!Empview &&
                                                    <div className="rec-data-process-save">
                                                        {this.state.savingStatus && <p>Saving...</p>}
                                                        <Button
                                                            id="saveDataBtn"
                                                            color={this.state.tableDataChange ? "secondary" : "success"}
                                                            onClick={() => this.saveRecordData()}
                                                            disabled={!this.state.processSelected || Empview}
                                                        >
                                                            {this.state.tableDataChange ? "*Save" : "Save"}
                                                        </Button>
                                                    </div>
                                                }
                                            </div>
                                        }
                                        <b style={{ display: "block", textAlign: "right", margin: "0 0 0 auto" }}>
                                            {Empview ?
                                                `Last update : [${this.state.timeLastUpdate}]`
                                                :
                                                `Last update (i) : [${this.state.timeDataUpdate[Number(moment(this.state.pickedDate).format('D')) - 1] === undefined ? "-" : this.state.timeDataUpdate[Number(moment(this.state.pickedDate).format('D')) - 1]}]`
                                            }
                                        </b>
                                        {(this.state.processSelected && this.state.pickedDate !== "") &&
                                            <>
                                                <div className="rec-data-process-help">
                                                    <FontAwesomeIcon id="helprecord" icon={faQuestionCircle} />
                                                    {this.unControlToolTipPackRecord("helprecord")}
                                                </div>
                                                <div style={(this.state.countRecorded !== this.state.countRecordAll) ? { color: "red" } : { color: "blue" }} className="rec-data-process-count">
                                                    {`Record Progress : ${this.state.countRecorded} / ${this.state.countRecordAll} items`}
                                                </div>
                                            </>
                                        }
                                        {Empview &&
                                            <>
                                                <div className="rec-data-graph-legend">
                                                    <svg className="legend-spec" height="20" width="25">
                                                        <path d="M0 10 H25" />
                                                    </svg>
                                                    <p>Spec Limit</p>
                                                    <svg className="legend-control" height="20" width="25">
                                                        <path d="M0 10 H25" />
                                                    </svg>
                                                    <p>Control Limit</p>
                                                    <svg className="legend-control" height="20" width="25">
                                                        <path d="M0 10 H10 M15 10 h10" />
                                                    </svg>
                                                    <p>X bar</p>
                                                </div>
                                                <div className="rec-data-graph-legend-dot">
                                                    <svg height="15" width="15">
                                                        <rect width="15" height="15" fill="rgb(255,150,150)" stroke="red" strokeWidth="1" />
                                                    </svg>
                                                    <span>NG data</span>
                                                    <svg height="15" width="15">
                                                        <polygon points="7.5,0 0,15 15,15" fill="rgb(255,200,0)" stroke="#525252" strokeWidth="1" />
                                                    </svg>
                                                    <span>Warning data</span>
                                                    <svg height="15" width="15">
                                                        <circle cx="7.5" cy="7.5" r="7" fill="rgb(80,255,0)" stroke="#525252" strokeWidth="1" />
                                                    </svg>
                                                    <span>Alert data</span>
                                                    <svg height="15" width="15">
                                                        <circle cx="7.5" cy="7.5" r="7" fill="rgb(0,70,255)" stroke="#525252" strokeWidth="1" />
                                                    </svg>
                                                    <span>OK data</span>
                                                    <svg height="15" width="15">
                                                        <circle cx="7.5" cy="7.5" r="7" fill="rgb(100,230,255)" stroke="#525252" strokeWidth="1" />
                                                    </svg>
                                                    <span>OK data (Min)</span>
                                                </div>
                                            </>
                                        }
                                        {this.state.approveGraphList}
                                    </>
                                }

                                {/*RecordTableRender */}
                                {(this.state.processSelected && this.state.pickedDate !== "") &&
                                    <div className="rec-data-record-table" onBlur={() => this.clearSelectedRow()}>
                                        {!Empview &&
                                            <>
                                                <BootstrapTable
                                                    ref={x => this.recordTable = x}
                                                    keyField="id"
                                                    data={this.state.recordTableDataFiltered}
                                                    columns={columns}
                                                    rowStyle={this.rowStyle}
                                                    selectRow={selectRow}
                                                    cellEdit={cellEditFactory({
                                                        mode: 'click',
                                                        beforeSaveCell(oldValue, newValue, row, column, done) {
                                                            if (checkInput(row, column, newValue)) {
                                                                //console.log("save")
                                                                done()
                                                            } else {
                                                                console.log("no save")
                                                                //console.log(row.index)
                                                                //console.log(row.len - 1)
                                                                if (row.index < row.len - 1) {
                                                                    selectNextRecord(row.index, column['i'])
                                                                } else {
                                                                    done(false)
                                                                }
                                                                //done(false)
                                                            }
                                                            return { async: true }
                                                        },
                                                        afterSaveCell: (oldValue, newValue, row, column) => {
                                                            //console.log("old:" + oldValue)
                                                            //console.log("new:" + newValue)
                                                            //console.log(row.index)
                                                            //console.log(column['i'])
                                                            this.hidePopOver()
                                                            this.setState({
                                                                selectedRow: [],
                                                                currentRow: row.index,
                                                                currentCol: column['i'],
                                                                tableDataChange: true
                                                            }, () => {
                                                                this.selectNextRecord()
                                                            })
                                                        },
                                                    })}
                                                    wrapperClasses="table-responsive"
                                                />
                                                <h2>When change Record table</h2>
                                                <BootstrapTable
                                                    ref={x => this.whenchangerecordTable = x}
                                                    keyField="id"
                                                    data={this.state.recordTableWhenchangeDataFiltered}
                                                    columns={whenchangecolumns}
                                                    rowStyle={this.rowStyle}
                                                    selectRow={whenchangeselectRow}
                                                    cellEdit={cellEditFactory({
                                                        mode: 'click',
                                                        beforeSaveCell(oldValue, newValue, row, column, done) {
                                                            if (checkInput(row, column, newValue)) {
                                                                //console.log("save")
                                                                done()
                                                            } else {
                                                                console.log("no save")
                                                                //console.log(row.index)
                                                                //console.log(row.len - 1)
                                                                if (row.index < row.len - 1) {
                                                                    selectNextRecordwhenchange(row.index, column['i'])
                                                                } else {
                                                                    done(false)
                                                                }
                                                                //done(false)
                                                            }
                                                            return { async: true }
                                                        },
                                                        afterSaveCell: (oldValue, newValue, row, column) => {
                                                            //console.log("old:" + oldValue)
                                                            //console.log("new:" + newValue)
                                                            //console.log(row.index)
                                                            //console.log(column['i'])
                                                            this.hidePopOver()
                                                            this.setState({
                                                                whenchangeselectedRow: [],
                                                                currentRowwhenchange: row.index,
                                                                currentColwhenchange: column['i'],
                                                                tableDataChange: true
                                                            }, () => {
                                                                this.selectNextRecordwhenchange()
                                                            })
                                                        },
                                                    })}
                                                    wrapperClasses="table-responsive"
                                                />
                                            </>
                                        }

                                        <div className="rec-data-record-recorder">
                                            <span>Recorded by (LL):</span>
                                            <span>
                                                {this.state.approveData[this.state.todayD - 1] === 1 ?
                                                    `${this.state.approveName[this.state.todayD - 1]} [${this.state.approveDate[this.state.todayD - 1]}]`
                                                    :
                                                    "-"}
                                            </span>
                                            <Button color={this.state.approveData[this.state.todayD - 1] === 1 ? "success" : "secondary"}
                                                onClick={() => this.showInputEmpId("LL check", "Recorder", this.state.approveData[this.state.todayD - 1] === 1)}
                                                disabled={Empview}>
                                                {this.state.approveData[this.state.todayD - 1] === 1 ? "Checked" : "not check"}
                                            </Button>
                                        </div>
                                        <div className="rec-data-record-recorder">
                                            <span>{`Total checked (Monthly) = ${this.state.checkedCount} times`}</span>
                                        </div>
                                        {!Empview &&
                                            <div className="rec-data-record-approve">
                                                {(this.state.normalStatus !== 21 && this.state.normalStatus !== 31) &&
                                                    <Button color={this.state.normalStatus > 0 ? "success" : "secondary"}
                                                        onClick={() => this.showInputEmpId("queue normal create", "Submit to Monthly Approve", false)}
                                                        disabled={this.state.normalStatus > 0}>
                                                        Submit to approve
                                                    </Button>
                                                }
                                                {(this.state.normalStatus === 21 || this.state.normalStatus === 31) &&
                                                    <Button color="success"
                                                        onClick={() => this.editInchargeApprove(true, false)}>
                                                        Re-submit
                                                    </Button>
                                                }
                                                {!this.state.editInchargeFlag &&
                                                    <Button color="danger"
                                                        onClick={() => this.editInchargeApprove(false, true)}
                                                        disabled={(this.state.normalStatus === 0 || this.state.normalStatus === 30)}>
                                                        Edit Incharge
                                                    </Button>
                                                }
                                                {this.state.editInchargeFlag &&
                                                    <>
                                                        <Button color="primary"
                                                            onClick={() => this.editInchargeApprove(true, true)}>
                                                            Submit edit Incharge
                                                        </Button>
                                                        <Button color="warning"
                                                            onClick={() => this.editInchargeApprove(false, true)}>
                                                            Cancel edit Incharge
                                                        </Button>
                                                    </>
                                                }
                                            </div>
                                        }
                                        <div className="rec-data-record-approve">
                                            <span>Approval Queue created : </span>
                                            <span>
                                                {(this.state.queueUpdate[0] !== "" && this.state.queueUpdate.length > 0) ?
                                                    `[${moment(this.state.queueUpdate[0], 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD-MM-YYYY')}]`
                                                    :
                                                    `[-]`
                                                }
                                            </span>
                                        </div>
                                        <div className="rec-data-record-approve">
                                            <span>Approval Queue submitted : </span>
                                            <span>
                                                {(this.state.queueUpdate[1] !== "" && this.state.queueUpdate.length > 0) ?
                                                    `[${moment(this.state.queueUpdate[1], 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD-MM-YYYY')}]`
                                                    :
                                                    `[-]`
                                                }
                                            </span>
                                        </div>
                                        <div className="rec-data-record-approve">
                                            <span>Checker (Monthly) :</span>
                                            <InputGroupButtonDropdown
                                                addonType="append" isOpen={this.state.checkerListOpen} toggle={() => this.toggleDropDown("checker list")} disabled={(this.state.normalStatus > 0 && !this.state.editInchargeFlag)}>
                                                <DropdownToggle caret >
                                                    {this.state.TLupName}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {this.state.TLupList.map((list, ind) => (
                                                        <DropdownItem key={ind} onClick={() => this.TLupSelect(list.empid, list.empname, list.position)} >{list.empname}</DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                            <span style={{ color: this.state.normalStatus === 21 && "red" }}>{`${this.state.normalCheckStatusMsg} :`}</span>
                                            <span>
                                                {(this.state.queueUpdate[2] !== "" && this.state.queueUpdate.length > 0) ?
                                                    `[${moment(this.state.queueUpdate[2], 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD-MM-YYYY')}]`
                                                    :
                                                    `[-]`
                                                }
                                            </span>
                                            {Empview &&
                                                <>
                                                    <Button color="success"
                                                        onClick={() => this.checkMonthly()}
                                                        disabled={this.state.approverPos < 2 || (this.state.normalStatus !== 1)}>
                                                        Check
                                                    </Button>
                                                    <Button color="warning"
                                                        onClick={() => this.rejectCheckMonthlyToggle()}
                                                        disabled={this.state.approverPos < 2 || (this.state.normalStatus !== 1)}>
                                                        Reject check
                                                    </Button>
                                                </>
                                            }
                                        </div>
                                        {this.state.normalStatus === 21 &&
                                            <div className="rec-data-record-approve reject">
                                                <span>{`Reject comment : ${this.state.commentCheck}`}</span>
                                            </div>
                                        }
                                        <div className="rec-data-record-approve">
                                            <span>Approver (Monthly) :</span>
                                            <InputGroupButtonDropdown
                                                addonType="append" isOpen={this.state.approverListOpen} toggle={() => this.toggleDropDown("approver list")} disabled={(this.state.normalStatus > 0 && !this.state.editInchargeFlag)}>
                                                <DropdownToggle caret >
                                                    {this.state.AMupName}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {this.state.AMupList.map((list, ind) => (
                                                        <DropdownItem key={ind} onClick={() => this.AMupSelect(list.empid, list.empname, list.position)} >{list.empname}</DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </InputGroupButtonDropdown>
                                            <span style={{ color: this.state.normalStatus === 31 && "red" }}>{`${this.state.normalApproveStatusMsg} :`}</span>
                                            <span>
                                                {(this.state.queueUpdate[3] !== "" && this.state.queueUpdate.length > 0) ?
                                                    `[${moment(this.state.queueUpdate[3], 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD-MM-YYYY')}]`
                                                    :
                                                    `[-]`
                                                }
                                            </span>
                                            {Empview &&
                                                <>
                                                    <Button color="success"
                                                        onClick={() => this.approveMonthly()}
                                                        disabled={this.state.approverPos < 3 || (this.state.normalStatus !== 20)}>
                                                        Approve
                                                    </Button>
                                                    <Button color="warning"
                                                        onClick={() => this.rejectApproveMonthlyToggle()}
                                                        disabled={this.state.approverPos < 3 || (this.state.normalStatus !== 20)}>
                                                        Reject approve
                                                    </Button>
                                                </>
                                            }
                                        </div>
                                        {this.state.normalStatus === 31 &&
                                            <div className="rec-data-record-approve reject">
                                                <span>{`Reject comment : ${this.state.commentApprove}`}</span>
                                            </div>
                                        }
                                        {/*<div className="rec-data-record-approve">
                                            <span>Checked by (TL up):</span>
                                            <span>
                                                {this.state.approveData[this.state.dayOfMonth + 1 - 1] === 1 ?
                                                    `${this.state.processChecker["TL"]} [${this.state.approveDate[this.state.dayOfMonth + 1 - 1]}]`
                                                    :
                                                    "-"}
                                            </span>
                                            <Button color={this.state.approveData[this.state.dayOfMonth + 1 - 1] === 1 ? "success" : "secondary"}
                                                onClick={() => this.checkProcess("TL M check")}
                                                disabled={this.state.approverPos < 2}>
                                                {this.state.approveData[this.state.dayOfMonth + 1 - 1] === 1 ? "Checked" : "not check"}
                                            </Button>
                                        </div>
                                        <div className="rec-data-record-approve">
                                            <span>Approved by (AM up):</span>
                                            <span>
                                                {this.state.approveData[this.state.dayOfMonth + 2 - 1] === 1 ?
                                                    `${this.state.processChecker["AM"]} [${this.state.approveDate[this.state.dayOfMonth + 2 - 1]}]`
                                                    :
                                                    "-"}
                                            </span>
                                            <Button color={this.state.approveData[this.state.dayOfMonth + 2 - 1] === 1 ? "success" : "secondary"}
                                                onClick={() => this.checkProcess("AM M approve")}
                                                disabled={this.state.approverPos < 3}>
                                                {this.state.approveData[this.state.dayOfMonth + 2 - 1] === 1 ? "Checked" : "not check"}
                                            </Button>
                                                </div>*/}


                                        {(this.state.renderPop) &&
                                            <Popover className="rec-data-record-table-popover" placement="top" isOpen={true} target={this.state.popOverTarget} hideArrow={true} flip={false}>
                                                <PopoverBody>
                                                    {this.state.textPopOver}
                                                </PopoverBody>
                                            </Popover>
                                        }
                                    </div>
                                }
                            </div>
                        }
                        <Modal isOpen={this.state.calendarShow} toggle={this.showCalendarProgress} className="rec-data-calendar-modal">
                            <ModalHeader toggle={this.showCalendarProgress}>Progress Calendar</ModalHeader>
                            <ModalBody className="rec-data-calendar-modal-body">
                                <FormGroup >
                                    <span>Show progress month of selected date only</span>
                                    <DatePickerWrapper>
                                        <DatePicker
                                            selected={this.state.pickedDate}
                                            onChange={date => this.setDateValuebyProgress(date)}
                                            inline
                                        />
                                    </DatePickerWrapper>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" onClick={this.showCalendarProgress}>Close</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.graphDataShow} toggle={this.showGraphData} className="rec-data-graph-modal">
                            <ModalHeader toggle={this.showGraphData}>
                                <p>Graph Data</p>
                                <p>{`Part no. : ${this.state.currentViewNo}, Process : ${this.state.processText}`}</p>
                                <p>{`Shift : ${this.state.shift}, Month : ${moment(this.state.pickedDate).format('MMM-YYYY')}`}</p>
                                <p>{`Item no. : ${this.state.graphItem}, ${this.state.graphParam}`}</p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="rec-data-graph-set">
                                    <div className="rec-data-graph-trend">
                                        <span>Trend Abnormality :</span>
                                        <Button color={this.state.showCircle ? "success" : "secondary"}
                                            onClick={() => this.showCircleGraph()}
                                            disabled={this.state.disableTrend}>
                                            {this.state.showCircle ? "Show" : "Hide"}
                                        </Button>
                                        {this.state.showCircle &&
                                            <div className="rec-data-graph-trend-check">
                                                <Button color={"success"} onClick={() => this.allTrigCircle(true)}>Check All</Button>
                                                <Button color={"danger"} onClick={() => this.allTrigCircle(false)}>Uncheck All</Button>
                                                {this.state.centerData.map((points, ind) => {
                                                    var showData = []
                                                    if (ind === 0) {
                                                        showData.push(<p key={ind}>1. Over PCS Limit</p>)
                                                    } else if (ind === 1) {
                                                        showData.push(<p key={ind}>2. Over Control Limit</p>)
                                                    } else if (ind === 2) {
                                                        showData.push(<p key={ind}>2. Run 7 points continue</p>)
                                                    } else if (ind === 3) {
                                                        showData.push(<p key={ind}>3. Run Up/Down 7 points continue</p>)
                                                    } else if (ind === 4) {
                                                        showData.push(<p key={ind}>4. Incline 12/14 or 10/11 points</p>)
                                                    } else if (ind === 5) {
                                                        showData.push(<p key={ind}>5. Near Control Limit 2/3 points</p>)
                                                    } else {
                                                        showData.push(<p key={ind}>6. Cycle Pattern</p>)
                                                    }
                                                    points.map((point, indP) => {
                                                        showData.push(<Input addon type="checkbox" id={`chk-${ind}-${indP}`} key={`input-${ind}-${indP}`} onChange={(e) => this.checkTrendItem(e, ind, indP)} defaultChecked={true} />)
                                                        showData.push(<span key={`ind-${ind}-${indP}`}>{indP + 1}</span>)
                                                    })
                                                    if (showData.length === 0) {
                                                        showData = null
                                                    }
                                                    return showData
                                                })}
                                            </div>
                                        }
                                    </div>
                                    <div className="rec-data-graph-legend">
                                        <svg className="legend-spec" height="20" width="25">
                                            <path d="M0 10 H25" />
                                        </svg>
                                        <p>Spec Limit</p>
                                        <svg className="legend-control" height="20" width="25">
                                            <path d="M0 10 H25" />
                                        </svg>
                                        <p>Control Limit</p>
                                        <svg className="legend-control" height="20" width="25">
                                            <path d="M0 10 H10 M15 10 h10" />
                                        </svg>
                                        <p>X bar</p>
                                    </div>
                                    <div className="rec-data-graph-legend-dot">
                                        <svg height="15" width="15">
                                            <rect width="15" height="15" fill="rgb(255,150,150)" stroke="red" strokeWidth="1" />
                                        </svg>
                                        <span>NG data</span>
                                        <svg height="15" width="15">
                                            <polygon points="7.5,0 0,15 15,15" fill="rgb(255,200,0)" stroke="#525252" strokeWidth="1" />
                                        </svg>
                                        <span>Warning data</span>
                                        <svg height="15" width="15">
                                            <circle cx="7.5" cy="7.5" r="7" fill="rgb(80,255,0)" stroke="#525252" strokeWidth="1" />
                                        </svg>
                                        <span>Alert data</span>
                                        <svg height="15" width="15">
                                            <circle cx="7.5" cy="7.5" r="7" fill="rgb(0,70,255)" stroke="#525252" strokeWidth="1" />
                                        </svg>
                                        <span>OK data</span>
                                        <svg height="15" width="15">
                                            <circle cx="7.5" cy="7.5" r="7" fill="rgb(100,230,255)" stroke="#525252" strokeWidth="1" />
                                        </svg>
                                        <span>OK data (Min)</span>
                                    </div>
                                    <div className="rec-data-graph-slider-v">
                                        <Range
                                            vertical
                                            allowCross={false}
                                            min={Number.parseFloat(this.state.minY)}
                                            max={Number.parseFloat(this.state.maxY)}
                                            value={this.state.ySliderValue}
                                            onChange={this.ySliderChange}
                                            step={1 / (Math.pow(10, this.state.yRead))}
                                            handle={this.xSliderTooltip}
                                            tipProps={{ visible: true }}
                                        />
                                        <ComposedChart
                                            width={700}
                                            height={400}
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                bottom: 20,
                                                left: 20,
                                            }}
                                            data={this.state.graphData}
                                        >
                                            <CartesianGrid />
                                            <XAxis type="number"
                                                dataKey="x"
                                                name="Date"
                                                domain={[this.state.xSliderValue[0] - 0.5, this.state.xSliderValue[1] + 1.5]}
                                                interval={0}
                                                ticks={this.state.xTicks}
                                                allowDataOverflow
                                            />
                                            <YAxis type="number"
                                                name="Data"
                                                domain={this.state.yDomain}
                                                interval={0}
                                                ticks={this.state.yTicks}
                                                allowDataOverflow
                                            />
                                            <ZAxis type="number" range={[50]} />
                                            <Tooltip content={<this.CustomToolTipChart />} cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Data" dataKey="y" fill="#505050" line shape={<this.customDot />} />
                                            <Scatter name="Data2" dataKey="y2" fill="#505050" line shape={<this.customDotMin />} />
                                            <Line name="Upper Limit" dataKey="upper" stroke="rgba(255,0,0,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelUpper} isAnimationActive={false} />
                                            <Line name="Lower Limit" dataKey="lower" stroke="rgba(255,0,0,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelLower} isAnimationActive={false} />
                                            <Line name="UCL" dataKey="ucl" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelUCL} isAnimationActive={false} />
                                            <Line name="x Bar" dataKey="xbar" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelXbar} isAnimationActive={false} strokeDasharray="8 2" />
                                            <Line name="LCL" dataKey="lcl" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelLCL} isAnimationActive={false} />
                                            <Scatter name="circle" dataKey="cY" shape={<this.customCircle />} isAnimationActive={false} />
                                        </ComposedChart>
                                    </div>
                                    {this.state.graphRShow > 0 &&
                                        <>
                                            <p className="rec-data-graph-rchart-label">R chart</p>
                                            <div className="rec-data-graph-slider-v-r">
                                                <Range
                                                    vertical
                                                    allowCross={false}
                                                    min={0}
                                                    max={Number.parseFloat(this.state.maxR)}
                                                    value={this.state.yRSliderValue}
                                                    onChange={this.yRSliderChange}
                                                    step={1 / (Math.pow(10, this.state.yRead))}
                                                    handle={this.xSliderTooltip}
                                                    tipProps={{ visible: true }}
                                                />
                                                <ComposedChart
                                                    width={700}
                                                    height={200}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        bottom: 20,
                                                        left: 20,
                                                    }}
                                                    data={this.state.graphRData}
                                                >
                                                    <CartesianGrid />
                                                    <XAxis type="number"
                                                        dataKey="x"
                                                        name="Date"
                                                        domain={[this.state.xSliderValue[0] - 0.5, this.state.xSliderValue[1] + 1.5]}
                                                        interval={0}
                                                        ticks={this.state.xTicks}
                                                        allowDataOverflow
                                                    />
                                                    <YAxis type="number"
                                                        name="Data"
                                                        domain={this.state.yRDomain}
                                                        interval={0}
                                                        ticks={this.state.yRTicks}
                                                        allowDataOverflow
                                                    />
                                                    <ZAxis range={[50]} />
                                                    <Tooltip content={<this.CustomToolTipChart />} cursor={{ strokeDasharray: '3 3' }} />
                                                    <Scatter name="Data" dataKey="y" fill="#505050" line shape={<this.customDotR />} />
                                                    <Line name="R UCL" dataKey="upper" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelRUCL} isAnimationActive={false} />
                                                    <Line name="R Bar" dataKey="rbar" stroke="rgba(0,0,255,0.6)" dot={false} activeDot={false} strokeWidth={2} label={this.customLabelRbar} isAnimationActive={false} strokeDasharray="8 2" />
                                                </ComposedChart>
                                            </div>
                                        </>
                                    }
                                    <div className="rec-data-graph-slider-h">
                                        <Range
                                            allowCross={false}
                                            min={1}
                                            max={this.state.dayOfMonth}
                                            value={this.state.xSliderValue}
                                            onChange={this.xSliderChange}
                                            step={1}
                                            handle={this.xSliderTooltip}
                                            tipProps={{ visible: true }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                        </Modal>

                        <Modal isOpen={this.state.checkDataShow} toggle={this.showCheckData} className="rec-data-graph-modal rec-data-check-modal">
                            <ModalHeader toggle={this.showCheckhData}>
                                <p>Check Sheet Data</p>
                                <p>{`Part no. : ${this.state.currentViewNo}, Process : ${this.state.processText}`}</p>
                                <p>{`Item no. : ${this.state.graphItem}, ${this.state.graphParam}`}</p>
                            </ModalHeader>
                            <ModalBody>
                                <BootstrapTable
                                    ref={x => this.checkTable = x}
                                    keyField="list"
                                    data={this.state.tableCheckData}
                                    columns={checkcolumns}
                                    rowStyle={this.rowStyle}
                                    wrapperClasses="table-responsive"
                                />
                            </ModalBody>
                        </Modal>

                        <Modal isOpen={this.state.calendarAmountShow} toggle={this.trigShowCalendarAmount} className="rec-data-graph-modal rec-data-check-modal rec-data-amount-modal">
                            <ModalHeader toggle={this.trigShowCalendarAmount}>
                                <p>Work amount (Monthly)</p>
                                <p>{`Part no. : ${this.state.currentViewNo}, Month : ${moment(this.state.pickedDate).format('MMM-YYYY')}`}</p>
                            </ModalHeader>
                            <ModalBody>
                                <ComposedChart
                                    width={650}
                                    height={200}
                                    margin={{
                                        top: 20,
                                        right: 10,
                                        bottom: 10,
                                        left: 10,
                                    }}
                                    data={this.state.graphAmount}
                                >
                                    <CartesianGrid />
                                    <XAxis type="number"
                                        dataKey="d"
                                        name="Date"
                                        interval={0}
                                        domain={[0, this.state.dayOfMonth]}
                                    />
                                    <YAxis type="number"
                                        yAxisId="left"
                                        orientation="left"
                                        name="Amount"
                                        interval="preserveStartEnd"
                                        label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: 5 }}
                                    />
                                    <YAxis type="number"
                                        yAxisId="right"
                                        orientation="right"
                                        name="Amount"
                                        interval="preserveStartEnd"
                                        label={{ value: 'Acc.', angle: -90, position: 'insideRight' }}
                                    />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Bar dataKey="amtA" name="Shift A" yAxisId="left" barSize={50} fill="#8ECAE6" />
                                    <Bar dataKey="amtB" name="Shift B" yAxisId="left" barSize={50} fill="#219EBC" />
                                    <Line dataKey="acc" name="Acc." yAxisId="right" type="monotone" stroke="#023047" fill="#219EBC" />
                                </ComposedChart>
                                <div className="rec-data-amount-table">
                                    <BootstrapTable
                                        ref={x => this.amountTable = x}
                                        keyField="list"
                                        data={this.state.tableAmountData}
                                        columns={amountcolumns}
                                        rowStyle={this.rowStyle}
                                        rowClasses={rowAmountClasses}
                                        wrapperClasses="table-responsive"
                                    />
                                </div>
                            </ModalBody>
                        </Modal>

                        <Modal isOpen={this.state.inputEmpIdShow} toggle={this.hideInputEmpId} className="rec-data-input-empid">
                            <ModalHeader toggle={this.hideInputEmpId}>
                                <p>{this.state.inputEmpIdMsg}</p>
                            </ModalHeader>
                            <ModalBody>
                                <p>Employee ID</p>
                                <Input id="inputempid" type="text" />
                                <p>Password</p>
                                <Input id="inputemppass" type="password" />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.enterEmpId()} >Save</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.rejectCheckMonthlyFlag} toggle={this.rejectCheckMonthlyToggle} className="rec-data-input-empid">
                            <ModalHeader toggle={this.rejectCheckMonthlyToggle}>
                                <p>Reject Check monthly comment</p>
                            </ModalHeader>
                            <ModalBody>
                                <p>Comment</p>
                                <Input id="inputrejectcheckmonthly" type="text" autoComplete="off" />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.rejectCheckMonthly()} >Confirm</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.rejectApproveMonthlyFlag} toggle={this.rejectApproveMonthlyToggle} className="rec-data-input-empid">
                            <ModalHeader toggle={this.rejectApproveMonthlyToggle}>
                                <p>Reject Approve monthly comment</p>
                            </ModalHeader>
                            <ModalBody>
                                <p>Comment</p>
                                <Input id="inputrejectapprovemonthly" type="text" autoComplete="off" />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.rejectApproveMonthly()} >Confirm</Button>
                            </ModalFooter>
                        </Modal>
                    </>
                }
                <div className="progress-spinner">
                    <Modal className="modal-spinner" isOpen={this.state.isLoading} centered>
                        <ModalBody>
                            <h5>Loading data ...</h5>
                            <PacmanLoader className="pacman" color={"#DC0032"} />
                        </ModalBody>
                    </Modal>
                </div>
            </div >
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null, mapDispatchToProps)(RegisList);