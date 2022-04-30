import React, { PureComponent } from 'react';
import {
    Button,
    Col,
    Row,
    InputGroup,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
    Modal,
    ModalBody,
    ButtonGroup,
} from 'reactstrap'
import axios from 'axios';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ComposedChart,
    Line,
    LabelList,
    ResponsiveContainer,
} from 'recharts';
import moment from 'moment';
import './scss/mOperRatio.scss';
import 'rc-slider/assets/index.css';
import "react-datepicker/dist/react-datepicker.css";
import { PacmanLoader } from "react-spinners";
import { css } from "@emotion/core";
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""

const override = css`
    border-color: red;
`;

var MonthList = {
    January: 1,
    Febuary: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
}


var arrNonEdit = []
var arrBlank = []


var successRow = []
var selectRow

var arrItem = []
var arrItemIndex = []
//var UpdateItemind = 0
var UpdatedData = {}
//var CreateNewData = false
var arrKeyItem = {}
//var Calflag = false
var arrOperation = []
//var itemindexCounter = 0
//var createCounter = 0
var arrNonsumitem = []


class OperRatioChart extends PureComponent {
    state = {
        splitButtonOpen: false,
        selectedMonth: "",
        OperationData: [],
        OperationTableData: [],
        NonEditableRow: [],
        splitLineButtonOpen: false,
        LineListCT: [],
        LineListLimit: [],
        selectedLine: "",
        LineCT: null,
        LineLimit: null,
        LineClass: "",
        MonthClass: "",
        YearClass: "year-input",
        isLoading: true,
        updatedLine: "",
        updatedMonth: "",
        LoadingMsg: "Get Line lists",
        ShiftSelected: 0,
        ShiftClass: "btn-type-sel-update",
        SelectedRow: []
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getLineLists();
        //this.getItemLists();
        this.ForceUpdateHandler = this.ForceUpdateHandler.bind(this);
        //this.getList();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    rowStyle2 = (row, rowIndex) => {
        const style = {};
        //console.log(arrNonEdit)
        if (arrNonEdit.includes(row.id)) {
            if (arrBlank.includes(row.id)) { //blank row
                style.backgroundColor = "#ffffff"
            } else { //non edit row
                style.backgroundColor = "#B8B8B8"
                style.fontWeight = 'bold'
                style.borderColor = '#000000'
            }
        } else { //editable row
            //console.log(row.id)
            style.backgroundColor = "#F9FF29"
            style.borderColor = '#000000'
            style.fontSize = '13px'
        }
        //console.log(style)
        return style
    }

    getLineLists = async () => {
        var arrLineCT = {}
        var arrLineLimit = {}
        /*this.setState({
            isLoading: true,
            LoadingMsg: "Get Line lists"
        })*/
        await api.get(`/mline/${curSection}`)
            .then(results => {
                results.data.forEach((result, ind) => {
                    arrLineCT = { ...arrLineCT, [result.line_name]: result.line_ct }
                    arrLineLimit = { ...arrLineLimit, [result.line_name]: result.line_limit }
                })
                this.setState({
                    LineListCT: arrLineCT,
                    LineListLimit: arrLineLimit
                }, () => {
                    console.log(this.state.LineListCT)
                    this.setState({
                        isLoading: false
                    })
                })
            })
            .catch(error => alert(error))
    }

    //get after select line
    getItemLists = async () => {
        arrItem = []
        arrNonEdit = []
        arrBlank = []
        const linename = this.state.selectedLine
        await api.get(`/moperation/${curSection}_${linename}`)
            .then(results => {
                results.data.forEach((result, ind) => {
                    arrItemIndex.push(result.item_index)
                    arrItem.push({ name: result.item_name, unit: result.unit_name, item: result.item_index, id: result.row_index })
                    if (!result.editable_item) {
                        arrNonEdit.push(result.row_index)
                        if (result.item_index === null) {
                            arrBlank.push(result.row_index)
                        }
                    }
                    if (result.unit_name === "%") {
                        arrNonsumitem.push(result.item_index)
                    }
                })
                this.setState({
                    NonEditableRow: arrNonEdit
                }, () => {
                    //console.log(this.state.NonEditableRow)
                    this.setState({
                        isLoading: false
                    })
                })
            })
            .catch(error => alert(error))
    }

    //create data
    CreateDataRow = () => {
        //create data row
        this.createarrItemIndex()
            .then(() => {
                //console.log("after map arritemindex")
                //this.getarrKeyItem()
            })
    }

    createarrItemIndex = async () => {
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        const shift = this.state.ShiftSelected
        //console.log(arrItemIndex)
        if (shift !== 0) {
            await api.get(`/mdata/${curSection}_${linename}_${year}_${month}_${shift}`)
                .then(results => {
                    if (results.data.length === 0) {
                        arrItemIndex.forEach((item) => {
                            if (item !== null) {
                                //console.log("arritemindex:" + item)
                                //itemindexCounter++
                                //console.log(itemindexCounter)
                                this.CheckData(item)
                            }
                        })
                    } else {
                        var createItem = arrItemIndex.map(x => x)
                        results.data.forEach((item, ind) => {
                            //console.log(item["item_index"])
                            const itemindex = createItem.indexOf(item["item_index"])
                            //console.log(itemindex)
                            createItem.splice(itemindex, 1)
                        })
                        //console.log(createItem)
                        createItem.forEach((item) => {
                            if (item !== null) {
                                //console.log(`create item: ${item}`)
                                this.CheckData(item)
                            }
                        })
                    }
                })
                .catch(error => {
                    alert("get arrKeyItem error")
                    console.log(error)
                    return null
                })
        }
        /*arrItemIndex.forEach((item) => {
            if (item !== null) {
                //console.log("arritemindex:" + item)
                itemindexCounter++
                //console.log(itemindexCounter)
                this.CheckData(item)
            }
        })*/
        //console.log("after for each")
    }

    //get data button click
    getDataButton = () => {
        //console.log("get data")
        this.setState({
            isLoading: true,
            LoadingMsg: "Get Data"
        }, () => {
            if (this.state.ShiftSelected === 0) {
                this.getAllDataLists()
                    .then(() => {
                        this.setState({
                            isLoading: false,
                            updatedLine: this.state.selectedLine,
                            updatedMonth: this.state.selectedMonth,
                        })
                    })
            } else {
                this.getDataLists()
                    .then(() => {
                        this.setState({
                            isLoading: false,
                            updatedLine: this.state.selectedLine,
                            updatedMonth: this.state.selectedMonth,
                            NonEditableRow: arrNonEdit
                        })
                    })
            }
        })
    }

    getDataLists = async () => {
        var emptyFlag = false
        //console.log("1st")
        //console.log(arrItem)
        arrItem.forEach((item, ind) => {
            //console.log("in loop")
            for (var x = 1; x <= 31; x++) {
                arrItem[ind] = { ...arrItem[ind], ["day" + x]: null }
            }
        })
        //console.log("2nd")
        //console.log(arrItem)
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        const shift = this.state.ShiftSelected
        //console.log(year + "/" + this.state.selectedMonth + "/" + this.state.selectedLine)
        if (year === "" || year.length !== 4) {
            //console.log("year empty")
            this.setState({ YearClass: "blank-year" })
            emptyFlag = true
        } else {
            this.setState({ YearClass: "updated-year" })
        }
        if (this.state.selectedMonth === "") {
            //console.log("month empty")
            this.setState({ MonthClass: "blank-list-btn" })
            emptyFlag = true
        } else {
            this.setState({ MonthClass: "selected-list-btn" })
        }
        if (linename === "") {
            //console.log("line empty")
            this.setState({ LineClass: "blank-list-btn" })
            emptyFlag = true
        } else {
            this.setState({ LineClass: "selected-list-btn" })
        }
        if (emptyFlag) {
            return null
        }
        this.setState({ ShiftClass: "btn-type-sel-update" })
        arrKeyItem = {}
        arrOperation = []
        var ratiolimit = this.state.LineLimit
        var dataRatio = {}
        var dataSetup = {}
        var dataSudden = {}
        var dataDefect = {}
        var dataRepair = {}
        var dataInactive = {}
        var sumday = 0
        var count = 0
        var defectQty = []
        var productQty = []
        var defectRatio = []
        //itemindexCounter = 0
        //createCounter = 0
        this.CreateDataRow()
        //console.log(`${linename}_${year}_${month}`)
        await api.get(`/mdata/${curSection}_${linename}_${year}_${month}_${shift}`)
            .then(results => {
                results.data.forEach((result, index) => {
                    //console.log(result)
                    arrItem.forEach((item, ind) => {
                        if (result["item_index"] === item["item"]) {
                            //console.log(result["item_index"] + "/" + item["item"])
                            sumday = 0
                            for (var y = 1; y <= 31; y++) {
                                if (result["data_item"] !== null) {
                                    var res = result["data_item"].split(";")[y - 1]
                                    arrItem[ind] = { ...arrItem[ind], ["day" + y]: res }
                                    if (res !== null && res !== "") {
                                        sumday += parseFloat(res)
                                    }
                                    if (item["name"] === "Operation Ratio") {
                                        dataRatio = { ...dataRatio, [y]: res }
                                    } else if (item["name"] === "Set-up time & Quality check total (%)") {
                                        dataSetup = { ...dataSetup, [y]: res }
                                    } else if (item["name"] === "Sudden broken down (%)") {
                                        dataSudden = { ...dataSudden, [y]: res }
                                    } else if (item["name"] === "Proceed defect loss time (%)") {
                                        dataDefect = { ...dataDefect, [y]: res }
                                    } else if (item["name"] === "Repair parts loading loss time (%)") {
                                        dataRepair = { ...dataRepair, [y]: res }
                                    } else if (item["name"] === "In-active time total (%)") {
                                        dataInactive = { ...dataInactive, [y]: res }
                                    }

                                    if (item["name"] === "Scrap QTY") {
                                        //console.log(res)
                                        defectQty.push(parseFloat(res))
                                    } else if (item["name"] === "Product QTY") {
                                        productQty.push(parseFloat(res))
                                    }

                                    //count
                                    if (ind === 0) {
                                        var checkNet = res
                                        //console.log(checkNet)
                                        if (checkNet !== "" && checkNet !== "0") {
                                            count++
                                        }
                                    }
                                }
                            }
                            //console.log(count)
                            //console.log(sumday)
                            var sumResult = 0
                            if (count !== 0) {
                                if (arrItem[ind]["unit"] === "%") {
                                    //sumResult = Math.round(((sumday / count) + Number.EPSILON) * 10) / 10
                                    sumResult = 0
                                } else {
                                    sumResult = sumday
                                }
                            }
                            arrItem[ind] = { ...arrItem[ind], sum: sumResult, selected: result.selected_data }

                            if (result["selected_data"]) {
                                //console.log(ind)
                                if (!successRow.includes(ind + 1)) {
                                    successRow.push(ind + 1)
                                }
                            }
                        }
                    })
                    //arrKeyItem = { ...arrKeyItem, [result.item_index]: result.id }
                })
                //console.log(successRow)
                //calculate sum percent
                //console.log(arrItem)
                arrItem[0] = { ...arrItem[0], sum: [Math.round(((arrItem[3]["sum"] / arrItem[4]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
                arrItem[10] = { ...arrItem[10], sum: [Math.round(((arrItem[9]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
                arrItem[19] = { ...arrItem[19], sum: [Math.round(((arrItem[18]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
                arrItem[46] = { ...arrItem[46], sum: [Math.round(((arrItem[45]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
                arrItem[48] = { ...arrItem[48], sum: [Math.round(((arrItem[47]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
                arrItem[50] = { ...arrItem[50], sum: [Math.round(((arrItem[49]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
                //console.log(dataRatio)
                for (var i = 1; i <= 31; i++) {
                    var defectpercent = Math.round(((defectQty[i - 1] / productQty[i - 1] * 100) + Number.EPSILON) * 10) / 10
                    if (isNaN(defectpercent) || defectpercent === Infinity) {
                        defectpercent = "-"
                    }
                    defectRatio.push(defectpercent)
                    arrOperation = [...arrOperation, {
                        day: i,
                        limit: ratiolimit,
                        ratio: dataRatio[i],
                        setup: dataSetup[i],
                        sudden: dataSudden[i],
                        defect: dataDefect[i],
                        repair: dataRepair[i],
                        inactive: dataInactive[i],
                        defectratio: defectpercent,
                    }]
                }
                //console.log(arrOperation)
                //console.log(arrKeyItem)
                //console.log(arrItem)

                this.setState({
                    OperationTableData: arrItem,
                    OperationData: arrOperation,
                    LineClass: "selected-list-btn",
                    MonthClass: "selected-list-btn",
                    YearClass: "updated-year",
                    SelectedRow: successRow,
                }, () => {
                    //console.log(this.state.OperationTableData)
                    this.ForceUpdateHandler()
                })
            })
            .catch(error => {
                alert("get data error")
                console.log(error)
                return null
            })
    }

    getAllDataLists = async () => {
        //console.log("get all data")
        var emptyFlag = false
        arrItem.forEach((item, ind) => {
            for (var x = 1; x <= 31; x++) {
                arrItem[ind] = { ...arrItem[ind], ["day" + x]: null }
            }
        })
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        //console.log(year + "/" + this.state.selectedMonth + "/" + this.state.selectedLine)
        if (year === "" || year.length !== 4) {
            //console.log("year empty")
            this.setState({ YearClass: "blank-year" })
            emptyFlag = true
        } else {
            this.setState({ YearClass: "updated-year" })
        }
        if (this.state.selectedMonth === "") {
            //console.log("month empty")
            this.setState({ MonthClass: "blank-list-btn" })
            emptyFlag = true
        } else {
            this.setState({ MonthClass: "selected-list-btn" })
        }
        if (linename === "") {
            //console.log("line empty")
            this.setState({ LineClass: "blank-list-btn" })
            emptyFlag = true
        } else {
            this.setState({ LineClass: "selected-list-btn" })
        }
        if (emptyFlag) {
            return null
        }
        this.setState({ ShiftClass: "btn-type-sel-update" })
        arrKeyItem = {}
        arrOperation = []
        var ratiolimit = this.state.LineLimit
        var dataRatio = {}
        var dataSetup = {}
        var dataSudden = {}
        var dataDefect = {}
        var dataRepair = {}
        var dataInactive = {}
        var sumday = 0
        var count = 0
        //itemindexCounter = 0
        //createCounter = 0
        this.CreateDataRow()
        //console.log(`${linename}_${year}_${month}`)
        var resultday = []
        var resultnight = []
        //day
        await api.get(`/mdata/${curSection}_${linename}_${year}_${month}_1`)
            .then(results => {
                resultday = results.data
            })
            .catch(error => {
                alert("get data day error")
                console.log(error)
                return null
            })
        //night
        await api.get(`/mdata/${curSection}_${linename}_${year}_${month}_2`)
            .then(results => {
                resultnight = results.data
            })
            .catch(error => {
                alert("get data day error")
                console.log(error)
                return null
            })
        //console.log(arrNonsumitem)
        var resultsum = []
        //console.log("result")
        //console.log(resultday)
        //console.log(resultnight)
        var datasum = []
        var dDay
        var dNight
        var d = ""
        if (resultday.length === 0) {
            for (var i = 0; i < resultnight.length; i++) {
                if (!arrNonsumitem.includes(i + 1)) {
                    for (var j = 1; j <= 31; j++) {
                        if (resultnight[i]["data_item"] !== null && resultnight[i]["data_item"] !== undefined) {
                            dNight = parseFloat(resultnight[i]["data_item"].split(";")[j - 1])
                        } else {
                            dNight = 0
                        }
                        if (isNaN(dNight) || dNight === undefined || dNight === null) {
                            d = 0
                        } else {
                            d += dNight
                        }
                        datasum = [...datasum, d]
                    }
                } else {
                    datasum = []
                }
                resultsum = [...resultsum, datasum.join(";")]
            }
        } else if (resultnight.length === 0) {
            for (i = 0; i < resultday.length; i++) {
                if (!arrNonsumitem.includes(i + 1)) {
                    for (j = 1; j <= 31; j++) {
                        if (resultday[i]["data_item"] !== null && resultday[i]["data_item"] !== undefined) {
                            dDay = parseFloat(resultday[i]["data_item"].split(";")[j - 1])
                        } else {
                            dDay = 0
                        }
                        if (isNaN(dDay) || dDay === undefined || dDay === null) {
                            d = 0
                        } else {
                            d = dDay
                        }
                        datasum = [...datasum, d]
                    }
                } else {
                    datasum = []
                }
                resultsum = [...resultsum, datasum.join(";")]
            }
        } else {
            if (resultday.length === resultnight.length) {
                for (i = 0; i < resultday.length; i++) {
                    if (!arrNonsumitem.includes(i + 1)) {
                        for (j = 1; j <= 31; j++) {
                            if (resultday[i]["data_item"] !== null && resultday[i]["data_item"] !== undefined) {
                                dDay = parseFloat(resultday[i]["data_item"].split(";")[j - 1])
                            } else {
                                dDay = 0
                            }
                            if (resultnight[i]["data_item"] !== null && resultnight[i]["data_item"] !== undefined) {
                                dNight = parseFloat(resultnight[i]["data_item"].split(";")[j - 1])
                            } else {
                                dNight = 0
                            }
                            if (isNaN(dDay) || dDay === undefined || dDay === null) {
                                d = 0
                            } else {
                                d = dDay
                            }
                            if (isNaN(dNight) || dNight === undefined || dNight === null) {
                                //d = d
                            } else {
                                d += dNight
                            }
                            /*if (isNaN(d) || d === undefined || d === null) {
                                d = ""
                            }*/
                            datasum = [...datasum, d]
                        }
                    } else {
                        datasum = []
                    }
                    resultsum = [...resultsum, datasum.join(";")]
                }
            } else {
                alert("data day and night shift not matching")
                return null
            }
            //console.log("result sum")
            //console.log(resultsum)
        }
        var allRatio = []
        var allSetup = []
        var allSudden = []
        var allProceed = []
        var allRepair = []
        var allInactive = []
        for (var k = 1; k <= 31; k++) {
            var dat = 0
            //ratio
            if (resultsum[3 - 1] === undefined) {
                dat = "0"
            } else {
                dat = Math.round(((parseFloat(resultsum[3 - 1].split(";")[k - 1]) / parseFloat(resultsum[4 - 1].split(";")[k - 1]) * 100) + Number.EPSILON) * 10) / 10
                if (dat === Infinity || isNaN(dat)) {
                    dat = "0"
                }
            }
            allRatio = [...allRatio, dat]

            //setup
            if (resultsum[8 - 1] === undefined) {
                dat = "0"
            } else {
                dat = Math.round(((parseFloat(resultsum[8 - 1].split(";")[k - 1]) / parseFloat(resultsum[2 - 1].split(";")[k - 1]) * 100) + Number.EPSILON) * 10) / 10
                if (dat === Infinity || isNaN(dat)) {
                    dat = "0"
                }
            }
            allSetup = [...allSetup, dat]

            //sudden
            if (resultsum[17 - 1] === undefined) {
                dat = "0"
            } else {
                dat = Math.round(((parseFloat(resultsum[17 - 1].split(";")[k - 1]) / parseFloat(resultsum[2 - 1].split(";")[k - 1]) * 100) + Number.EPSILON) * 10) / 10
                if (dat === Infinity || isNaN(dat)) {
                    dat = "0"
                }
            }
            allSudden = [...allSudden, dat]

            //proceed
            if (resultsum[44 - 1] === undefined) {
                dat = "0"
            } else {
                dat = Math.round(((parseFloat(resultsum[44 - 1].split(";")[k - 1]) / parseFloat(resultsum[2 - 1].split(";")[k - 1]) * 100) + Number.EPSILON) * 10) / 10
                if (dat === Infinity || isNaN(dat)) {
                    dat = "0"
                }
            }
            allProceed = [...allProceed, dat]

            //repair
            if (resultsum[46 - 1] === undefined) {
                dat = "0"
            } else {
                dat = Math.round(((parseFloat(resultsum[46 - 1].split(";")[k - 1]) / parseFloat(resultsum[2 - 1].split(";")[k - 1]) * 100) + Number.EPSILON) * 10) / 10
                if (dat === Infinity || isNaN(dat)) {
                    dat = "0"
                }
            }
            allRepair = [...allRepair, dat]

            //inactive
            if (resultsum[48 - 1] === undefined) {
                dat = "0"
            } else {
                dat = Math.round(((parseFloat(resultsum[48 - 1].split(";")[k - 1]) / parseFloat(resultsum[2 - 1].split(";")[k - 1]) * 100) + Number.EPSILON) * 10) / 10
                if (dat === Infinity || isNaN(dat)) {
                    dat = "0"
                }
            }
            allInactive = [...allInactive, dat]
        }
        /*console.log(allRatio)
        console.log(allSetup)
        console.log(allSudden)
        console.log(allProceed)
        console.log(allRepair)
        console.log(allInactive)*/
        resultsum[0] = allRatio.join(";")
        resultsum[8] = allSetup.join(";")
        resultsum[17] = allSudden.join(";")
        resultsum[44] = allProceed.join(";")
        resultsum[46] = allRepair.join(";")
        resultsum[48] = allInactive.join(";")

        //console.log("after put data")
        //console.log(resultsum)
        //console.log(arrItem)
        //cal sum column data
        var newarrnonEdit = []
        var productQty = []
        var defectQty = []
        var defectRatio = []
        arrItem.forEach((item, ind) => {
            if (item["item"] !== null) {
                //console.log(ind)
                sumday = 0
                for (var k = 1; k <= 31; k++) {
                    if (resultsum[item["item"] - 1] === undefined) {
                        break
                    }
                    var res = resultsum[item["item"] - 1].split(";")[k - 1]
                    arrItem[ind][`day${k}`] = res
                    if (res !== null && res !== "" && res !== "0") {
                        sumday += parseFloat(res)
                    }

                    if (item["name"] === "Operation Ratio") {
                        dataRatio = { ...dataRatio, [k]: res }
                    } else if (item["name"] === "Set-up time & Quality check total (%)") {
                        dataSetup = { ...dataSetup, [k]: res }
                    } else if (item["name"] === "Sudden broken down (%)") {
                        dataSudden = { ...dataSudden, [k]: res }
                    } else if (item["name"] === "Proceed defect loss time (%)") {
                        dataDefect = { ...dataDefect, [k]: res }
                    } else if (item["name"] === "Repair parts loading loss time (%)") {
                        dataRepair = { ...dataRepair, [k]: res }
                    } else if (item["name"] === "In-active time total (%)") {
                        dataInactive = { ...dataInactive, [k]: res }
                    }

                    if (item["name"] === "Scrap QTY") {
                        //console.log(res)
                        defectQty.push(parseFloat(res))
                    } else if (item["name"] === "Product QTY") {
                        productQty.push(parseFloat(res))
                    }

                    if (ind === 0) {
                        if (res !== null && res !== "" && res !== "0") {
                            count++
                        }
                    }
                }
                var sumAll = 0
                if (count !== 0) {
                    if (item["unit"] === "%") {
                        //sumAll = Math.round(((sumday / count) + Number.EPSILON) * 10) / 10
                        sumAll = 0
                    } else {
                        sumAll = sumday
                    }
                }
                arrItem[ind]["sum"] = sumAll
            }
            newarrnonEdit.push(ind + 1)
        })
        arrItem[0] = { ...arrItem[0], sum: [Math.round(((arrItem[3]["sum"] / arrItem[4]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
        arrItem[10] = { ...arrItem[10], sum: [Math.round(((arrItem[9]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
        arrItem[19] = { ...arrItem[19], sum: [Math.round(((arrItem[18]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
        arrItem[46] = { ...arrItem[46], sum: [Math.round(((arrItem[45]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
        arrItem[48] = { ...arrItem[48], sum: [Math.round(((arrItem[47]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }
        arrItem[50] = { ...arrItem[50], sum: [Math.round(((arrItem[49]["sum"] / arrItem[1]["sum"] * 100) + Number.EPSILON) * 10) / 10] }

        //console.log(defectQty)
        for (var l = 1; l <= 31; l++) {
            //console.log(defectQty[l-1])
            var defectpercent = Math.round(((defectQty[l - 1] / productQty[l - 1] * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(defectpercent) || defectpercent === Infinity) {
                defectpercent = "-"
            }
            defectRatio.push(defectpercent)
            arrOperation = [...arrOperation, {
                day: l,
                limit: ratiolimit,
                ratio: dataRatio[l],
                setup: dataSetup[l],
                sudden: dataSudden[l],
                defect: dataDefect[l],
                repair: dataRepair[l],
                inactive: dataInactive[l],
                defectratio: defectpercent
            }]
        }
        //console.log(arrItem)
        //console.log(defectRatio)
        //console.log(arrOperation)
        //console.log(newarrnonEdit)
        const setarrItem = arrItem.map((row) => {
            return row
        })
        //console.log(setarrItem)
        this.setState({
            OperationTableData: []
        }, () => {
            this.setState({
                OperationTableData: setarrItem,
                OperationData: arrOperation,
                NonEditableRow: newarrnonEdit
            })
        })
    }

    CheckData = async (itemind) => {
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        const shift = this.state.ShiftSelected
        //console.log(UpdateItemind)
        //var finalData = this.BuildData()
        //console.log(finalData)
        //console.log(`${linename}_${year}_${month}_${itemind}`)
        await api.get(`/mdata/check/${curSection}_${linename}_${year}_${month}_${itemind}_${shift}`)
            .then(results => {
                //console.log(results.data)
                if (results.data.length === 0) {
                    //CreateNewData = true
                    this.CreateData(itemind)
                } //else {
                //CreateNewData = false
                //this.UpdateData(finalData)
                //this.getarrKeyItem()
                //}
                //console.log(CreateNewData)
                //console.log("calcualte")
                //this.getDataLists()
                //this.CalculateData()
            })
            .catch(error => {
                alert("check data error")
                //console.log(error)
                return null
            })
    }

    BuildData = () => {
        //console.log(UpdateItemind)
        //console.log(Calflag)
        var concatData = []
        for (var x = 1; x <= 31; x++) {
            concatData = [...concatData, UpdatedData["day" + x]]
        }
        var fData = concatData.join(";")
        //console.log(concatData)
        //console.log(fData)
        return fData
    }

    CreateData = async (itemind) => {
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        const shift = this.state.ShiftSelected
        await api.post('/mdata/create/', {
            section: curSection,
            year_data: year,
            month_data: month,
            item_index: itemind,
            data_item: null,
            line_name: linename,
            shift_index: shift,
        })
            .then(results => {
                //console.log("create completed")
                //this.getarrKeyItem()
                /*createCounter++
                if (createCounter === itemindexCounter) {
                    this.getarrKeyItem()
                }*/
            })
            .catch(error => {
                alert("update data error")
                console.log(error)
                return null
            })
    }

    getarrKeyItem = async () => {
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        const shift = this.state.ShiftSelected
        await api.get(`/mdata/${curSection}_${linename}_${year}_${month}_${shift}`)
            .then(results => {
                results.data.forEach((result, ind) => {
                    arrKeyItem = { ...arrKeyItem, [result.item_index]: result.id }
                })
                //console.log(arrKeyItem)
            })
            .catch(error => {
                alert("get arrKeyItem error")
                console.log(error)
                return null
            })
    }

    UpdateData = async (finData, itemind) => {
        //console.log("arr in update")
        //console.log(arrKeyItem)
        //console.log(itemind)
        //console.log(finData)
        var keyUpdateItemind = arrKeyItem[itemind]
        //console.log(keyUpdateItemind)
        await api.patch('/mdata/' + keyUpdateItemind + "/update/", {
            data_item: finData
        })
            .then(results => {
                console.log("update completed")
                //this.CalculateData()
            })
            .catch(error => {
                alert("update data error")
                console.log(error)
                return null
            })
    }

    CalculateData = async () => {
        //console.log(this.state.OperationTableData)
        var tableData = this.state.OperationTableData
        const ct = this.state.LineCT
        var arrPossible = []
        var arrRatio = []
        var arrSumQTY = []
        var arrSumDowntime = []
        var arrSumDowntimePer = []
        var arrSetupTime = []
        var arrSetupTimePer = []
        var arrSudden = []
        var arrSuddenPer = []
        var arrProceedPer = []
        var arrRepairPer = []
        var arrInactive = []
        var arrInactivePer = []
        //arrOperation = []
        for (var x = 1; x <= 31; x++) {
            var OperTime = tableData[1]["day" + x]
            var Maxtime = tableData[1]["day" + x] * 60
            var PosQty = Math.round(Maxtime / ct)
            var scrapQty = tableData[5]["day" + x]
            var goodQty = tableData[6]["day" + x]
            if (scrapQty === "" || scrapQty === null) {
                scrapQty = 0
            }
            if (goodQty === "" || goodQty === null) {
                goodQty = 0
            }
            var SumQty = parseInt(scrapQty) + parseInt(goodQty)
            var Ratio = Math.round(((SumQty / PosQty * 100) + Number.EPSILON) * 10) / 10
            //Possible max
            arrPossible = [...arrPossible, PosQty]
            if (isNaN(Ratio) || Ratio === Infinity) {
                Ratio = 0
            }
            if (isNaN(SumQty)) {
                SumQty = 0
            }
            arrRatio = [...arrRatio, Ratio]
            arrSumQTY = [...arrSumQTY, SumQty]

            //Sum Setup time
            var Setup = 0
            var dat = 0
            for (var i = 11; i <= 15; i++) {
                dat = tableData[i]["day" + x]
                //console.log(dat)
                if (dat !== null && dat !== "") {
                    Setup += parseFloat(tableData[i]["day" + x])
                }
            }
            if (isNaN(Setup)) {
                Setup = ""
            }
            var SetupPer = Math.round(((Setup / OperTime * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(SetupPer) || SetupPer === Infinity) {
                SetupPer = ""
            }
            arrSetupTime = [...arrSetupTime, Setup]
            arrSetupTimePer = [...arrSetupTimePer, SetupPer]

            var Daily = parseFloat(tableData[16]["day" + x])
            if (isNaN(Daily)) {
                Daily = ""
            }
            var Supply = parseFloat(tableData[17]["day" + x])
            if (isNaN(Supply)) {
                Supply = ""
            }

            //Sum Sudden broken
            var Sudden = 0
            for (var j = 20; j <= 44; j++) {
                dat = tableData[j]["day" + x]
                if (dat !== null && dat !== "") {
                    Sudden += parseFloat(dat)
                }
            }
            if (isNaN(Sudden)) {
                Sudden = ""
            }
            var SuddenPer = Math.round(((Sudden / OperTime * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(SuddenPer) || SuddenPer === Infinity) {
                SuddenPer = ""
            }
            arrSudden = [...arrSudden, Sudden]
            arrSuddenPer = [...arrSuddenPer, SuddenPer]

            //Cal Proceed percent
            var Proceed = parseFloat(tableData[45]["day" + x])
            if (isNaN(Proceed)) {
                Proceed = ""
            }
            var ProceedPer = Math.round(((Proceed / OperTime * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(ProceedPer) || ProceedPer === Infinity) {
                ProceedPer = ""
            }
            arrProceedPer = [...arrProceedPer, ProceedPer]

            //Cal Repair percent
            var Repair = parseFloat(tableData[47]["day" + x])
            if (isNaN(Repair)) {
                Repair = ""
            }
            var RepairPer = Math.round(((Repair / OperTime * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(RepairPer) || RepairPer === Infinity) {
                RepairPer = ""
            }
            arrRepairPer = [...arrRepairPer, RepairPer]

            //Cal in-active time
            var Inactive = 0
            for (var k = 51; k <= 56; k++) {
                dat = tableData[k]["day" + x]
                if (dat !== null && dat !== "") {
                    Inactive += parseFloat(dat)
                }
            }
            if (isNaN(Inactive)) {
                Inactive = ""
            }
            var InactivePer = Math.round(((Inactive / OperTime * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(InactivePer) || InactivePer === Infinity) {
                InactivePer = ""
            }
            arrInactive = [...arrInactive, Inactive]
            arrInactivePer = [...arrInactivePer, InactivePer]

            //Cal Downtime
            var Downtime = Number(Setup) + Number(Daily) + Number(Supply) + Number(Sudden) + Number(Proceed) + Number(Repair) + Number(Inactive)
            if (isNaN(Downtime)) {
                Downtime = ""
            }
            var DowntimePer = Math.round(((Downtime / OperTime * 100) + Number.EPSILON) * 10) / 10
            if (isNaN(DowntimePer) || DowntimePer === Infinity) {
                DowntimePer = ""
            }
            arrSumDowntime = [...arrSumDowntime, Downtime]
            arrSumDowntimePer = [...arrSumDowntimePer, DowntimePer]
        }
        const RowKeyArray = {
            1: arrRatio,
            3: arrSumQTY,
            4: arrPossible,
            8: arrSetupTime,
            9: arrSetupTimePer,
            17: arrSudden,
            18: arrSuddenPer,
            45: arrProceedPer,
            47: arrRepairPer,
            48: arrInactive,
            49: arrInactivePer,
            7: arrSumDowntime,
        }
        const RowArray = [1, 3, 4, 8, 9, 17, 18, 45, 47, 48, 49, 7]
        this.UpdateTableData(RowKeyArray, RowArray)
    }

    UpdateTableData = (rowkeyarray, rowarray) => {
        /*var newArr = []
        data.forEach((item,ind) => {
            newArr = this.state.OperationTableData
            newArr[itemind]["day"+ind]=item
        })
        console.log(newArr[itemind])
        this.setState({
            OperationTableData: newArr
        },() => {
            console.log("after set")
            console.log(this.state.OperationTableData)
            
        })*/
        //console.log(data[0])
        var arrnew = {}
        const newArr = this.state.OperationTableData.map((row) => {
            if (rowarray.includes(row.item)) {
                arrnew = row
                const data = rowkeyarray[row.item]
                data.forEach((item, ind) => {
                    arrnew = { ...arrnew, [`day${ind + 1}`]: item }
                    //console.log(arrnew)
                })
                return arrnew
            }
            return row
        })
        //console.log(newArr)
        this.setState({
            OperationTableData: newArr
        }, () => {
            //console.log(this.state.OperationTableData)
        })

        //update graph data
        //var arrgraphnew = []
        var rowgraphnew = {}
        //console.log(this.state.OperationData)
        const newGraphArr = this.state.OperationData.map((row, ind) => {
            rowgraphnew = row
            //console.log(row)
            rowgraphnew = {
                ...rowgraphnew,
                ratio: rowkeyarray["1"][ind],
                setup: rowkeyarray["9"][ind],
                sudden: rowkeyarray["18"][ind],
                defect: rowkeyarray["45"][ind],
                repair: rowkeyarray["47"][ind],
                inactive: rowkeyarray["49"][ind],
            }
            return rowgraphnew
        })
        //console.log(this.state.OperationData)
        //console.log(newGraphArr)
        this.setState({
            OperationData: newGraphArr
        }, () => {
            //console.log(this.state.OperationData)
        })
    }

    SaveDataButton = async () => {
        //console.log(this.state.OperationTableData)
        const year = document.getElementById('year').value
        const month = moment().month(this.state.selectedMonth).format("MM")
        const linename = this.state.selectedLine
        const shift = this.state.ShiftSelected
        this.getarrKeyItem()
            .then(() => {
                if (this.state.OperationTableData.length === 0) {
                    console.log("is null")
                    return null
                }
                this.setState({
                    isLoading: true,
                    LoadingMsg: "Saving Data"
                }, () => {
                    this.state.OperationTableData.forEach((row, ind) => {
                        if (row.item !== null) {
                            var keyUpdateItemind = arrKeyItem[row.item]
                            var finData = null
                            var data = []
                            for (var i = 1; i <= 31; i++) {
                                data = [...data, (row[`day${i}`])]
                            }
                            finData = data.join(";")
                            //console.log(finData)
                            //console.log(keyUpdateItemind)
                            var selected = "False"
                            if (row[`selected`]) {
                                selected = "True"
                            }
                            api.patch('/mdata/' + keyUpdateItemind + "/update/", {
                                data_item: finData,
                                selected_data: selected
                            })
                                .then(results => {
                                    //update selected of other shift

                                })
                                .catch(error => {
                                    console.log("update data error")
                                    console.log(error)
                                    return null
                                })
                            var shiftupdate
                            if (shift === 1) {
                                shiftupdate = 2
                            } else {
                                shiftupdate = 1
                            }
                            api.put(`/mdata/updateselect/${curSection}_${year}_${month}_${row[`item`]}_${linename}_${shiftupdate}_${selected}`, {
                                selected_data: selected
                            })
                                .then(results1 => {
                                    console.log("update completed")
                                    //this.CalculateData()
                                    if (ind === this.state.OperationTableData.length - 1) {
                                        setTimeout(() => {
                                            this.setState({
                                                isLoading: false
                                            })
                                        }, 500)
                                    }
                                })
                                .catch(error => {
                                    //alert("update data error")
                                    console.log(error)
                                    return null
                                })
                        }
                    })
                })
            })
    }

    BuildCalData = (arrData, m) => {
        var concatCalData = arrData.join(";")
        /*arrData.map(val => {
            if (m === "possible") {
                value = Math.round(val)
            } else if (m === "ratio") {
                value = val
            } else if (m === "sum") {
                value = val
            }
            concatCalData = [...concatCalData, value]
        })*/
        return concatCalData.join(";")
    }

    toggleSplitButton = () => {
        this.setState({ splitButtonOpen: !this.state.splitButtonOpen })
    }

    toggleSplitLineButton = () => {
        this.setState({ splitLineButtonOpen: !this.state.splitLineButtonOpen })
    }

    selectMonth = (sender) => {
        //console.log(sender.currentTarget.textContent)
        const month = sender.currentTarget.textContent
        this.setState({
            selectedMonth: month
        }, () => {
            this.MonthListChange()
            //this.CreateDataRow()
        })

    }

    selectLine = (sender) => {
        const line = sender.currentTarget.textContent
        this.setState({
            selectedLine: line,
            LineCT: this.state.LineListCT[line],
            LineLimit: this.state.LineListLimit[line],
            isLoading: true,
            LoadingMsg: "Get List items"
        }, () => {
            this.LineListChange()
            this.getItemLists()
        })
    }

    renderLegend = () => {
        return (
            [
                { value: "Operation Ratio", type: 'square', color: "#46CEE9" },
                { value: "M/C Stop Loss", type: 'square', color: "#EEA00E" },
                { value: "Rework Loss", type: 'square', color: "#DC96FF" },
                { value: "Defect Loss", type: 'square', color: "#FF532C" },
                { value: "Setup time Loss", type: 'square', color: "#FFFD6C" },
                { value: "In-active Loss", type: 'square', color: "#8D8D8D" },
                { value: "Target", type: 'line', color: "#FF0000" },
            ]
        )
    }

    DayHead = () => {
        var arrDay = []
        for (var x = 1; x <= 31; x++) {
            arrDay.push(<th id={"day-col"} key={x}>{x}</th>)
        }
        return arrDay
    }

    ForceUpdateHandler() {
        this.forceUpdate();
    }

    LineListChange = () => {
        this.setState({
            LineClass: "changed-list-btn"
        })
    }

    MonthListChange = () => {
        this.setState({
            MonthClass: "changed-list-btn"
        })
    }

    YearChange = () => {
        this.setState({
            YearClass: "changed-year"
        })
    }

    customTooltips = ({ label, active, payload }) => {
        if (!active || payload == null || payload.length === 0) {
            return null;
        }
        //console.log(payload)
        return (
            <div className="custom-tooltip">
                <p className="tooltip-head">{"Day : " + payload[0].payload["day"]}</p>
                <p className="tooltip-time1">{"Target : " + payload[0].payload["limit"] + " %"}.</p>
                <p className="tooltip-time">{"Operation Ratio : " + payload[0].payload["ratio"] + " %"}.</p>
                <p className="tooltip-time">{"Defect Ratio : " + payload[0].payload["defectratio"] + " %"}.</p>
                <p className="tooltip-time">{"Setup time Loss : " + payload[0].payload["setup"] + " %"}.</p>
                <p className="tooltip-time">{"M/C Stop Loss: " + payload[0].payload["sudden"] + " %"}.</p>
                <p className="tooltip-time">{"Defect Loss : " + payload[0].payload["defect"] + " %"}.</p>
                <p className="tooltip-time">{"Rework Loss : " + payload[0].payload["repair"] + " %"}.</p>
                <p className="tooltip-time">{"In-active Loss : " + payload[0].payload["inactive"] + " %"}.</p>
                <p className="tooltip-detail"></p>
            </div>
        );
    }

    modalLoadtoggle = (flag) => {
        console.log("modal:" + flag)
        if (flag) {
            this.setState({
                isLoading: flag,
            }, () => {
                /*setTimeout(() => {
                    this.getList()
                }, 1000);*/
            })
        } else {
            this.setState({ isLoading: flag })
        }
    }

    ButtonSelectShift = (shiftind) => {
        //console.log("shift select")
        this.setState({
            ShiftSelected: shiftind,
            ShiftClass: "btn-type-sel-noupdate"
        })
    }

    SelectHandle = (columnIndex, row, rowIndex) => {
        const rowi = row.id
        if (this.state.ShiftSelected !== 0 && columnIndex === 0) {
            if (arrNonEdit.includes(row.id)) {
                return false
            } else {
                var tmpData = this.state.OperationTableData
                if (successRow.includes(rowi)) {
                    successRow.splice(successRow.indexOf(rowi), 1)
                    tmpData[rowIndex]["selected"] = false
                } else {
                    successRow.push(rowi)
                    tmpData[rowIndex]["selected"] = true
                }
                this.setState({
                    OperationTableData: tmpData
                })
                //console.log(this.state.OperationTableData)
                const sucRow = successRow.map(x => x)
                console.log(sucRow)
                this.setState({
                    SelectedRow: sucRow
                })
            }
        } else {
            return false
        }
    }

    render() {
        var columns1 = [{
            dataField: 'id',
            text: '',
            headerStyle: (colum, colIndex) => {
                return { width: '280px', textAlign: 'center' }
            },
            classes: 'all-cell',
            hidden: true,
        }, {
            dataField: 'name',
            text: '',
            headerStyle: (colum, colIndex) => {
                return { width: '280px', textAlign: 'center' }
            },
            style: {
                fontWeight: 'bold',
            },
            classes: 'all-cell',
            editable: false,
            events: {
                onClick: (e, column, columnIndex, row, rowIndex) => {
                    this.SelectHandle(columnIndex, row, rowIndex)
                }
            }
        }, {
            dataField: 'unit',
            text: '',
            align: 'center',
            headerStyle: (colum, colIndex) => {
                return { width: '40px', textAlign: 'center' }
            },
            style: {
                fontSize: '12px',
                padding: '18px 3px',
                fontWeight: 'bold'
            },
            classes: 'all-cell',
            editable: false,
        }];
        for (var x = 1; x <= 31; x++) {
            columns1.push({
                dataField: 'day' + x,
                text: `${x}`,
                headerStyle: (colum, colIndex) => {
                    return { width: '28px', textAlign: 'center', padding: '0 0' }
                },
                style: {
                    fontSize: '11px',
                    padding: '18px 0px',
                },
                editorClasses: 'day-edit',
                align: 'center',
                classes: 'all-cell',
            })
        }
        columns1.push({
            dataField: 'sum',
            text: 'Sum',
            headerStyle: (colum, colIndex) => {
                return { width: '50px', textAlign: 'center', padding: '0 0', margin: '0px 0px' }
            },
            style: {
                fontSize: '12px',
                padding: '18px 0px',
            },
            editorClasses: 'day-edit',
            align: 'center',
            classes: 'all-cell',
            editable: false,
        })
        const columns = columns1

        selectRow = {
            mode: 'checkbox',
            clickToEdit: true,
            bgColor: "#A0FF26",
            hideSelectColumn: true,
            selected: this.state.SelectedRow,
        }

        return (
            <>
                <div>
                    <h1 className="title-head">Opeartion ratio (Manual)</h1>
                    <h1 className="title-head">{"Line : " + this.state.updatedLine + " / Month : " + this.state.updatedMonth}</h1>
                </div>
                <div className="head">
                    <div className="left-item">
                        <Col>
                            <Row className="line-box">
                                <p className="month-label">Line : </p>
                                <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitLineButtonOpen} toggle={this.toggleSplitLineButton}>
                                    <Button outline className={this.state.LineClass} onChange={() => this.LineListChange()}>{this.state.selectedLine === "" ? "Select Line ..." : this.state.selectedLine}</Button>
                                    <DropdownToggle split outline />
                                    <DropdownMenu
                                        modifiers={{
                                            setMaxHeight: {
                                                enabled: true,
                                                order: 890,
                                                fn: (data) => {
                                                    return {
                                                        ...data,
                                                        styles: {
                                                            ...data.styles,
                                                            overflow: 'auto',
                                                            maxHeight: '200px',
                                                        },
                                                    };
                                                },
                                            },
                                        }}
                                    >
                                        {Object.keys(this.state.LineListCT).map((key, ind) => (
                                            <DropdownItem onClick={this.selectLine} key={ind}>{key}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </InputGroupButtonDropdown>
                            </Row>
                            <Row className="month-box">
                                <p className="month-label">Month : </p>
                                <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} toggle={this.toggleSplitButton}>
                                    <Button outline className={this.state.MonthClass}>{this.state.selectedMonth === "" ? "Select Month ..." : this.state.selectedMonth}</Button>
                                    <DropdownToggle split outline />
                                    <DropdownMenu
                                        modifiers={{
                                            setMaxHeight: {
                                                enabled: true,
                                                order: 890,
                                                fn: (data) => {
                                                    return {
                                                        ...data,
                                                        styles: {
                                                            ...data.styles,
                                                            overflow: 'auto',
                                                            maxHeight: '200px',
                                                        },
                                                    };
                                                },
                                            },
                                        }}
                                    >
                                        {Object.keys(MonthList).map((key, ind) => (
                                            <DropdownItem onClick={this.selectMonth} key={ind}>{key}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </InputGroupButtonDropdown>
                            </Row>
                            <InputGroup className="year-input-group">
                                <p className="year-label">Year : </p>
                                <Input placeholder="Input year ..." className={this.state.YearClass} id="year" onChange={() => this.YearChange()} autoComplete="off" />
                            </InputGroup>
                            <InputGroup className="ct-input-group">
                                <p className="ct-label">{"C/T : "}</p>
                                <p className="ct-show">{this.state.LineCT}</p>
                                {this.state.selectedLine !== "" && <p className="sec-label">{"sec."}</p>}
                            </InputGroup>
                            <InputGroup className="ct-input-group">
                                <p className="target-label">{"OA Target : "}</p>
                                <p className="ct-show">{this.state.LineLimit}</p>
                                {this.state.selectedLine !== "" && <p className="sec-label">{"%"}</p>}
                            </InputGroup>
                            <ButtonGroup className="btn-type-m">
                                <Button className={this.state.ShiftClass} onClick={() => this.ButtonSelectShift(0)} active={this.state.ShiftSelected === 0}>All</Button>
                                <Button className={this.state.ShiftClass} onClick={() => this.ButtonSelectShift(1)} active={this.state.ShiftSelected === 1}>A</Button>
                                <Button className={this.state.ShiftClass} onClick={() => this.ButtonSelectShift(2)} active={this.state.ShiftSelected === 2}>B</Button>
                            </ButtonGroup>
                            <Button type="button" className="get-data-btn" color="primary" onClick={() => this.getDataButton()}>Get Data</Button>
                            <Button type="button" className="save-data-btn" color="success" onClick={() => this.SaveDataButton()} disabled={(this.state.ShiftSelected === 0 || this.state.ShiftClass === "btn-type-sel-noupdate")}>Save Data</Button>
                        </Col>
                    </div>
                    <div className="graph-operation">
                        <ResponsiveContainer width="100%" height={720}>
                            <ComposedChart
                                data={this.state.OperationData}
                                margin={{ top: 50, right: 10, bottom: 0, left: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" tick={false} />
                                <YAxis domain={[0, 100]} ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} unit="%" />
                                <Tooltip cursor={false} content={<this.customTooltips />} />
                                <Legend verticalAlign="top" align="right" height={60} payload={this.renderLegend()} />
                                <Bar name="Operation Ratio" dataKey={"ratio"} stackId="a" fill="#46CEE9" unit="%" stroke="black" strokeWidth={1} >
                                    <LabelList dataKey="ratio" position="center" />
                                </Bar>
                                <Bar name="Set-up Loss" dataKey={"setup"} stackId="a" fill="#FFFD6C" unit="%" stroke="black" strokeWidth={1} >
                                    <LabelList dataKey="setup" position="center" />
                                </Bar>
                                <Bar name="Sudden broken Loss" dataKey={"sudden"} stackId="a" fill="#EEA00E" unit="%" stroke="black" strokeWidth={1} >
                                    <LabelList dataKey="sudden" position="center" />
                                </Bar>
                                <Bar name="Defect Loss" dataKey={"defect"} stackId="a" fill="#FF532C" unit="%" stroke="black" strokeWidth={1} >
                                    <LabelList dataKey="defect" position="center" />
                                </Bar>
                                <Bar name="Repair Loss" dataKey={"repair"} stackId="a" fill="#DC96FF" unit="%" stroke="black" strokeWidth={1} >
                                    <LabelList dataKey="repair" position="center" />
                                </Bar>
                                <Bar name="In-active Loss" dataKey={"inactive"} stackId="a" fill="#8D8D8D" unit="%" stroke="black" strokeWidth={1} >
                                    <LabelList dataKey="inactive" position="center" />
                                </Bar>
                                <Line name="Limit" type="monotone" dot={false} dataKey={"limit"} stroke="#ff0000" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="table">
                    <BootstrapTable
                        ref="table"
                        keyField="id"
                        data={this.state.OperationTableData}
                        columns={columns}
                        rowStyle={this.rowStyle2}
                        selectRow={selectRow}
                        cellEdit={cellEditFactory({
                            mode: 'click',
                            blurToSave: true,
                            nonEditableRows: () => this.state.NonEditableRow,
                            afterSaveCell: (oldValue, newValue, row, column, done) => {
                                this.setState({
                                    isLoading: false
                                }, () => {
                                    //console.log(oldValue)
                                    //console.log(newValue)
                                    //console.log(row)
                                    //UpdateItemind = row.item
                                    //console.log(row.item)
                                    UpdatedData = row
                                    //console.log(this.state.OperationTableData)
                                    //Calflag = true
                                    //this.CheckData()
                                    this.CalculateData()
                                    /*var buildData = this.BuildData()
                                    this.UpdateData(buildData, row.item)
                                        .then(() => {
                                            this.CalculateData()
                                                .then(() => {
                                                    this.getDataButton()
                                                })
                                        })*/
                                    //re render
                                    //setTimeout(() => this.getDataToggle(), 1000)
                                })
                            },
                        })}
                        wrapperClasses="table-responsive"
                    />
                </div>
                {/*Modal Loading*/}
                <div className="progress-spinner">
                    <Modal className="modal-spinner" isOpen={this.state.isLoading} centered>
                        <ModalBody>
                            <h5>{`${this.state.LoadingMsg} ...`}</h5>
                            <PacmanLoader className="pacman" css={override} color={"#DC0032"} />
                        </ModalBody>
                    </Modal>
                </div>
            </>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null, mapDispatchToProps)(OperRatioChart)