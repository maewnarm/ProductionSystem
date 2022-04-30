import React, { PureComponent, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Col,
    Modal,
    ModalBody,
    Table,
    InputGroup,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
    InputGroupAddon,
    Pagination,
    PaginationLink,
    PaginationItem,
    Label,
    FormGroup,
} from 'reactstrap'
import styled from 'styled-components'
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    Cell,
    ComposedChart,
    Line,
} from 'recharts';
import { Handle, Range } from 'rc-slider'
import moment from 'moment';
import './scss/OperRatio.scss';
import 'rc-slider/assets/index.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PacmanLoader } from "react-spinners";
import { css } from "@emotion/core";
import TimeKeeper from 'react-timekeeper';
//import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';
//import DatePicker from 'react-date-picker';
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""

//const style = { width: 400, margin: 'auto' };
//const Range = createSliderWithTooltip(Slider.Range);

const FlexHandle = styled(Handle)`
  display: flex;
  justify-content: center;
`;

const Value = styled.div`
  margin: -35px 0px 18px 0px;
  padding: 0px 5px 0px 5px;
  white-space: nowrap;
  color: black;
  font-size: 16px;
  font-weight: bold;
  background: rgb(160,255,240);
  border-radius: 5px;
  border: 2px solid rgb(255, 104, 174);
`;

const Value1 = styled(Value)`
  margin: 20px 0px -37px 0px;
  padding: 0px 5px 0px 5px;
  white-space: nowrap;
  color: black;
  font-size: 16px;
  font-weight: bold;
  background: rgb(160,255,240);
  border-radius: 5px;
  border: 2px solid rgb(255, 104, 174);
`;

const override = css`
    border-color: red;
`;

var arrBar = []
var scatterpair = []
var indexold = 0
var sumindex = 0
var allIndex = 0
var SetgIndex = 0
var ChartIndex = 0
var StSelectedLength = 0
var StdMCTime = 0
var StdHandTime = 0
var color
var keytable = ""
var OEEall = [{
    losstime: 0,
    lossshort: 0,
    lossbreak: 0,
    abnormal: 0,
    lossmt: 0,
    lossht: 0,
    masteron: 0,
    autorunon: 0,
    handtime: 0,
    noworking: 0,
    breakeron: 0,
    normalcycle: 0,
    warning: 0,
}]
var PerOEEall = [{
    Perlosstime: 0,
    Perlossshort: 0,
    Perlossbreak: 0,
    Perabnormal: 0,
    Perlossmt: 0,
    Perlossht: 0,
    Permasteron: 0,
    Perautorunon: 0,
    Perhandtime: 0,
    Pernoworking: 0,
    Perbreakeron: 0,
    Pernormalcycle: 0,
    Perwarning: 0,
}]
var OEE = [{
    losstime: 0,
    lossshort: 0,
    lossbreak: 0,
    abnormal: 0,
    lossmt: 0,
    lossht: 0,
    masteron: 0,
    autorunon: 0,
    handtime: 0,
    noworking: 0,
    breakeron: 0,
    normalcycle: 0,
    warning: 0,
}]
var PerOEE = [{
    Perlosstime: 0,
    Perlossshort: 0,
    Perlossbreak: 0,
    Perabnormal: 0,
    Perlossmt: 0,
    Perlossht: 0,
    Permasteron: 0,
    Perautorunon: 0,
    Perhandtime: 0,
    Pernoworking: 0,
    Perbreakeron: 0,
    Pernormalcycle: 0,
    Perwarning: 0,
}]
var sumOEEall = 0
var sumOEE = 0
var arrFault = []
var arrFaultCounter = []
var arrFaultDura = []
var searchItemIndex = null
var LossHT = 0
var LossMT = 0
var LossHTall = 0
var LossMTall = 0
var avgHT = 0
var avgMT = 0
var avgCT = 0
var avgHTall = 0
var avgMTall = 0
var avgCTall = 0
var cntHT = 0
var cntMT = 0
var cntHTall = 0
var cntMTall = 0
var workQty = 0
var cntResults = 0
const perPage = 10
const showPage = 5

var naturalSort = function (a, b) {
    return ('' + a).localeCompare(('' + b), 'en', { numeric: true });
}

var naturalSortG = function (a, b) {
    return ('' + a.name).localeCompare(('' + b.name), 'en', { numeric: true });
}

class OperRatioChart extends PureComponent {
    state = {
        data: [],
        filterData: { name: "Mahcine Time Chart" },
        gData: [],
        Bardata: [],
        chartItem: 0,
        detailItem: 0,
        minGraph: moment("07:30:00", "HH:mm:ss.S").valueOf(),
        maxGraph: moment("19:20:00", "HH:mm:ss.S").valueOf(),
        Slidervalue: [moment("07:30:00", "HH:mm:ss.S").valueOf(), moment("19:20:00", "HH:mm:ss.S").valueOf()],
        gapTick: Math.ceil((moment("19:20:00", "HH:mm:ss.S").diff(moment("07:30:00", "HH:mm:ss.S"))) / 9),
        Datepicked: new Date(),
        updateList: false,
        DayNight: 0,
        TimeShift: "07:30:00",
        sliderUpdate: true,
        progress: 0,
        isLoading: false,
        StSelected: [],
        ListStation: {},
        StationName: [],
        StationMT: [],
        StationHT: [],
        stOEEall: [],
        stOEE: [],
        stOEEshow: [],
        perOEEshow: [],
        barPerOEE: [],
        included: true,
        ScatterData: [],
        ScatterChartData: [],
        BarOpacity: { t1: 1, t2: 1, t3: 1, t41: 1, t42: 1, t5: 1, t6: 1, t7: 1 },
        EnableLegend: false,
        ResultList: [],
        ResultTypeList: [],
        ResultLimitUpper: [],
        ResultLimitLower: [],
        ResultData: [],
        FaultList: [],
        FaultCounter: [],
        ParetoFaultData: [],
        ChartShowType: 0,
        splitButtonOpen: false,
        SearchBy: "",
        SerchText: "",
        UseSearch: false,
        LossTime: [],
        Selected: [],
        allFault: false,
        otherTypedisable: false,
        totalFault: 0,
        totalFaultRatio: 0,
        totalFaultTime: 0,
        tablelistsAmount: 0,
        pageAmount: 0,
        pageActive: 1,
        pageShow: [],
        columnShow: [],
        columnLists: [],
        selectAll: true,
        deselectAll: false,
        break1Time: "",
        break2Time: "",
        break3Time: "",
        manualBreak: false,
        Datestart: new Date(),
        Datestop: new Date(),
        Timestart: '12:34',
        Timestop: '12:34',
        ShowTimeStart: false,
        ShowTimeStop: false,
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getStation();
        //this.getList();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getStation = async () => {
        var arrStation = []
        var arrStationName = []
        var arrStationMT = []
        var arrStationHT = []
        await api.get(`/stationlist/${curSection}`)
            .then(results => {
                //console.log(result.data)
                results.data.forEach((item, ind) => {
                    arrStation.push(item.machine_index)
                    arrStationName = { ...arrStationName, [item.machine_index]: item.machine_name }
                    arrStationMT = { ...arrStationMT, ["MT_" + item.machine_index]: item.machine_mt }
                    arrStationHT = { ...arrStationHT, ["HT_" + item.machine_index]: item.machine_ht }
                    //console.log(arrStationName)
                    //console.log(arrStationHT)
                });
                this.setState({
                    ListStation: arrStation,
                    StationName: arrStationName,
                    StationMT: arrStationMT,
                    StationHT: arrStationHT,
                })
            })
            .catch(error => alert(error))
    }

    StationCheckBox = () => {
        //console.log("length:" + this.state.ListStation.length)
        //console.log(this.state.ListStation.length)
        if (this.state.ListStation.length === null || this.state.ListStation.length === undefined) {
            console.log("liststation is null")
            this.modalLoadtoggle(false);
            return (<p>Empty</p>)
        } else {
            const [Selected, SetSelected] = useState([])
            var sortSelected
            const CheckBoxClick = (select) => {
                const index = Selected.indexOf(select)
                if (index < 0) {
                    Selected.push(select);
                } else {
                    Selected.splice(index, 1);
                }
                SetSelected([...Selected]);
                //console.log("select" + Selected + "/index:" + index)
                sortSelected = [].concat(Selected)
                    .sort((a, b) => a > b ? 1 : -1)
                //console.log(sortSelected);
                //if (Selected.length != 0) {
                this.setState({
                    StSelected: sortSelected,
                    updateList: true,
                }, () => {
                    //console.log("in check:" + this.state.StSelected.length);
                    if (this.state.StSelected.length !== 0) {
                        this.modalLoadtoggle(true);
                    }
                    this.getListeachStation();
                })
                //}
                //clear fault history
                Object.keys(arrFaultCounter).forEach(key => {
                    arrFaultCounter[key] = 0
                })
            }
            return (
                <div className="station-check">
                    <div className="list-text">
                        Station List :
                    </div>
                    {this.state.ListStation.sort(naturalSort).map(item => (
                        <Button className="st-button" color="primary" onClick={() => CheckBoxClick(item)} active={Selected.includes(item)} key={item}>{item}</Button>
                    ))}
                </div>
            );
        }
    }

    CheckBoxClick = (select) => {
        var sortSelected
        /*const index = this.state.Selected.indexOf(select)
        if (index < 0) {
            this.state.Selected.push(select)
        } else {
            this.state.Selected.splice(index, 1)
        }*/
        this.setState({
            Selected: [select],
            allFault: false,
            ParetoFaultData: [],
            otherTypedisable: false,
        }, () => {
            //console.log("select" + Selected + "/index:" + index)
            sortSelected = [].concat(this.state.Selected)
                .sort((a, b) => a > b ? 1 : -1)
            //console.log(sortSelected);
            //if (Selected.length != 0) {
            this.setState({
                StSelected: sortSelected,
                updateList: true,
            }, () => {
                //console.log("in check:" + this.state.StSelected.length);
                if (this.state.StSelected.length !== 0) {
                    this.modalLoadtoggle(true);
                }
                this.getListeachStation();
            })
            //}
            //clear fault history
            Object.keys(arrFaultCounter).forEach(key => {
                arrFaultCounter[key] = 0
            })
        })
    }

    getListeachStation = () => {
        arrBar = []
        indexold = 0
        sumindex = 0
        allIndex = 0
        SetgIndex = 0
        arrFault = []
        this.setState({
            gData: [],
            FaultList: [],
            totalFaultRatio: 0
        }, () => {
            //console.log(this.state.StSelected.length)
            StSelectedLength = this.state.StSelected.length
            this.state.StSelected.forEach((st, ind1) => {
                //console.log("map:" + st + ":" + ind1);
                this.getList(st, ind1)
            });
        })

    }

    getList = async (st, stind) => {
        var dif = 0
        var durat
        var oldtime
        var dataindex = 0
        var newpair = {}
        var resultpair = {}
        scatterpair = []
        //this.setState({ isLoading: true })
        //console.log(`${moment(this.state.Datepicked, "YYYY-MM-DD").add({ days: 1 }).format("YYYY-MM-DD")}`)
        var apiURL
        //console.log("st in getlist:" + st + "/" + stind)
        if (st == null) {
            console.log("st is null")
            this.modalLoadtoggle(false)
            return null
        }

        //get result list
        var arrResult = []
        var arrResultType = []
        var arrResultUpper = []
        var arrResultLower = []
        await api.get(`/resultlist/st/${curSection}_${st}`)
            .then(results => {
                results.data.forEach((item, ind) => {
                    arrResult = { ...arrResult, [item.machine_index + "-" + item.result_index]: item.result_name }
                    arrResultType = { ...arrResultType, [item.machine_index + "-" + item.result_index]: item.result_type }
                    if (item.result_limit !== null) {
                        var upper = item.result_limit.split(";")[0]
                        var lower = item.result_limit.split(";")[1]
                        if (isNaN(upper) || upper === null || upper === undefined) {
                            upper = ""
                        }
                        if (isNaN(lower) || lower === null || lower === undefined) {
                            lower = ""
                        }
                    }
                    arrResultUpper = { ...arrResultUpper, [item.machine_index + "-" + item.result_index]: upper }
                    arrResultLower = { ...arrResultLower, [item.machine_index + "-" + item.result_index]: lower }
                })
                var arrkey = []
                Object.keys(arrResult).forEach(key => {
                    arrkey = [...arrkey, key]
                })
                arrkey.sort(naturalSort)
                //console.log(arrkey)
                var newarrResult = {}
                arrkey.forEach(key => {
                    newarrResult = { ...newarrResult, [key]: arrResult[key] }
                })
                //console.log(newarrResult)
                arrResult = newarrResult
                //console.log(arrResult)
                //console.log(arrResultType)
                this.setState({
                    ResultList: arrResult,
                    ResultTypeList: arrResultType,
                    ResultLimitUpper: arrResultUpper,
                    ResultLimitLower: arrResultLower,
                }, () => {
                    this.createShowCol()
                })
            })
            .catch(error => alert(error))

        //get faultlist
        await api.get(`/faultlist/st/${curSection}_${st}`)
            .then(results => {
                results.data.forEach((item, ind) => {
                    arrFault = { ...arrFault, [item.machine_index + "-" + item.ng_code]: item.detail_mem }
                    arrFaultCounter = { ...arrFaultCounter, [item.machine_index + "-" + item.ng_code]: 0 }
                    arrFaultDura = { ...arrFaultDura, [item.machine_index + "-" + item.ng_code]: 0 }
                })
                this.setState({
                    FaultList: arrFault,
                })
            })
            .catch(error => alert(error))

        //console.log("st not null")
        if (this.state.DayNight === 0) { //day
            apiURL = `/operationratioDay?q1=${moment(this.state.Datepicked).format("YYYY-MM-DD")}_07:30:00_19:20:00_${st}`
            oldtime = `${moment(this.state.Datepicked).format("DD/MM/YYYY")} 07:30:00`
        } else {
            apiURL = `/operationratioNight?q1=${moment(this.state.Datepicked).format("YYYY-MM-DD")}_19:30:00_23:59:59_${moment(this.state.Datepicked, "YYYY-MM-DD").add({ days: 1 }).format("YYYY-MM-DD")}_00:00:00_07:20:00_${st}`
            oldtime = `${moment(this.state.Datepicked).format("DD/MM/YYYY")} 19:30:00`
        }
        //console.log(apiURL)
        StdMCTime = this.state.StationMT["MT_" + st]
        StdHandTime = this.state.StationHT["HT_" + st]
        //console.log("ht=" + StdHandTime)
        await api.get(`${apiURL}_${curSection}`)
            .then(result => {
                this.setState({
                    data: result.data,
                    filterData: { name: this.state.StationName[st] },
                    //gData: [],
                    Bardata: [],
                    //isLoading: true,
                }, () => {
                    oldtime = moment(this.state.Datepicked).format("YYYY-MM-DD") + " 07:30:00"
                    //console.log("indexold:" + indexold + "/sumindex:" + sumindex)
                    indexold = sumindex
                    dataindex = 0
                    //const dataLength = this.state.data.length
                    //console.log("data:"+st)
                    //console.log(this.state.data)
                    if (this.state.data.length === 0) {
                        //console.log("datalength is 0")
                        this.modalLoadtoggle(false)
                        this.SetgData();
                    }
                    this.state.data.forEach((item) => {
                        //const percent = Math.floor((dataindex + 1) / dataLength * 100)
                        //this.setState({ progress: percent })
                        //console.log(this.state.progress+`${this.state.isLoading}`)
                        //dif = moment(moment(this.state.Datepicked).format("DD/MM/YYYY") + " " + item.time_mem, "DD/MM/YYYY HH:mm:ss").diff(moment(oldtime, "DD/MM/YYYY HH:mm:ss"))
                        dif = moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").diff(moment(oldtime, "YYYY-MM-DD HH:mm:ss.S"))
                        durat = moment.duration(dif).valueOf()
                        //oldtime = moment(this.state.Datepicked).format("DD/MM/YYYY") + " " + item.time_mem
                        oldtime = item.date_mem + " " + item.time_mem
                        //fdif=moment.duration.format("HH:mm:ss"),
                        sumindex = dataindex + indexold
                        var NGdetail = ""
                        var NGdetail2 = ""
                        if (item.ng_code !== null) {
                            NGdetail = this.state.FaultList[item.machine_no + "-" + item.ng_code.split(";")[0]]
                            if (NGdetail === undefined || NGdetail === "0") {
                                NGdetail = ""
                            } else {
                                //console.log(item.ng_code)
                                arrFaultCounter = { ...arrFaultCounter, [item.machine_no + "-" + item.ng_code.split(";")[0]]: arrFaultCounter[item.machine_no + "-" + item.ng_code.split(";")[0]] + 1 }
                                //console.log(arrFaultCounter)
                                /*this.setState({
                                    FaultCounter: { ...this.state.FaultCounter, [item.machine_no + "-" + item.ng_code]: this.state.FaultCounter[item.machine_no + "-" + item.ng_code] + 1 }
                                }, () => console.log(this.state.FaultCounter))*/
                            }
                            NGdetail2 = this.state.FaultList[item.machine_no + "-" + item.ng_code.split(";")[1]]
                            if (NGdetail2 !== undefined && NGdetail2 !== "0") {
                                NGdetail = `${NGdetail},${NGdetail2}`
                                arrFaultCounter = { ...arrFaultCounter, [item.machine_no + "-" + item.ng_code.split(";")[1]]: arrFaultCounter[item.machine_no + "-" + item.ng_code.split(";")[1]] + 1 }
                            }
                        }
                        if (dataindex === 0) {
                            newpair = {
                                ...newpair,
                                ["time" + sumindex]: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                                ["type" + sumindex]: item.type_mem, ["detail" + sumindex]: NGdetail, ["stno" + sumindex]: item.machine_no,
                                ["timeAt" + sumindex]: item.date_mem + " " + item.time_mem
                            }
                        }
                        else {
                            newpair = {
                                ...newpair,
                                ["time" + sumindex]: durat, ["type" + sumindex]: item.type_mem,
                                ["detail" + sumindex]: NGdetail, ["stno" + sumindex]: item.machine_no,
                                ["timeAt" + sumindex]: item.date_mem + " " + item.time_mem
                            }
                        }

                        //set result data
                        if (item.type_mem === 5 || item.type_mem === 6) {
                            resultpair = { ...resultpair, [item.machine_no + "_" + item.date_mem + "_" + item.time_mem.substring(0, 10)]: item.result_data }
                        }
                        dataindex++
                    })
                    this.setState({
                        filterData: { ...this.state.filterData, ...newpair },
                        ResultData: resultpair,
                        FaultCounter: arrFaultCounter
                    }, () => {
                        sumindex++
                        //console.log(this.state.filterData)
                        //console.log(this.state.ResultData)
                        //console.log(this.state.ResultList)
                        this.createPagination()
                        if (dataindex !== 0) {
                            this.SetgData();
                        }
                    })
                    //console.log(this.state.data.length),
                });
            })
            .catch(error => alert(error))
    }

    SetgData = () => {
        this.setState({
            gData: [...this.state.gData, this.state.filterData]
        }, () => {
            //this.state.gData.sort((a, b) => (a.name > b.name) ? 1 : -1)
            //console.log(this.state.filterData)
            //console.log("gdata:")
            //console.log(this.state.gData)
            //console.log(this.state.data)
            //console.log(moment("10/09/2020 07:30:00", "DD/MM/YYYY HH:mm:ss").valueOf())
            //console.log(moment("10/09/2020 16:30:00", "DD/MM/YYYY HH:mm:ss").valueOf())

            //create data bar

            //console.log(this.state.data.length)
            /*for (var x = 0; x < this.state.data.length ; x++) {
                console.log(this.state.filterData.)
                arrBar.push(<Bar dataKey={"time"+x} stackId="a" fill="#ff0000" />)
            }*/
            //console.log("before addbar")
            //console.log(this.state.data)
            sumOEEall = 0
            sumOEE = 0
            LossMT = 0
            LossHT = 0
            LossMTall = 0
            LossHTall = 0
            cntHT = 0
            cntMT = 0
            cntHTall = 0
            cntMTall = 0
            avgHT = 0
            avgMT = 0
            avgCT = 0
            avgHTall = 0
            avgMTall = 0
            avgCTall = 0
            Object.keys(OEEall[0]).forEach(key => {
                //console.log(key)
                OEEall[0][key] = 0
            })
            Object.keys(OEE[0]).forEach(key => {
                //console.log(key)
                OEE[0][key] = 0
            })
            var prevResultdate
            var prevResulttime
            var prevType = 0
            this.state.data.forEach((item, ind) => {
                //console.log(ind)
                //console.log(Math.floor((ind + 1) / dataLength * 100) + "%")
                //console.log("setgindex:"+SetgIndex)
                var getData = this.state.gData[SetgIndex]
                //console.log(getData["time" + ind])
                //console.log(getData)
                var timeValue = getData["time" + allIndex]
                var iniTime
                /*var NGdetail = this.state.FaultList[item.machine_no + "-" + item.ng_code]
                if (NGdetail === undefined) {
                    NGdetail = ""
                }*/
                var NGdetail = ""
                var NGdetail2 = ""
                if (item.ng_code !== null && item.type_mem === 6 && ind >= 1) {
                    var duraFault = moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").diff(moment(prevResultdate + " " + prevResulttime, "YYYY-MM-DD HH:mm:ss.S"))
                    duraFault = moment.duration(duraFault).valueOf()
                    NGdetail = this.state.FaultList[item.machine_no + "-" + item.ng_code.split(";")[0]]
                    if (NGdetail === undefined || NGdetail === "0") {
                        NGdetail = ""
                    } else {
                        //console.log(item.ng_code)
                        //console.log(arrFaultCounter)
                        /*this.setState({
                            FaultCounter: { ...this.state.FaultCounter, [item.machine_no + "-" + item.ng_code]: this.state.FaultCounter[item.machine_no + "-" + item.ng_code] + 1 }
                        }, () => console.log(this.state.FaultCounter))*/
                        arrFaultDura = { ...arrFaultDura, [item.machine_no + "-" + item.ng_code.split(";")[0]]: arrFaultDura[item.machine_no + "-" + item.ng_code.split(";")[0]] + duraFault }
                    }
                    NGdetail2 = this.state.FaultList[item.machine_no + "-" + item.ng_code.split(";")[1]]
                    if (NGdetail2 !== undefined && NGdetail2 !== "0") {
                        NGdetail = `${NGdetail},${NGdetail2}`
                        arrFaultDura = { ...arrFaultDura, [item.machine_no + "-" + item.ng_code.split(";")[1]]: arrFaultDura[item.machine_no + "-" + item.ng_code.split(";")[1]] + duraFault }
                    }
                } else {
                    prevResultdate = item.date_mem
                    prevResulttime = item.time_mem
                }
                if (ind === 0) {
                    if (this.state.DayNight === 0) {//day
                        iniTime = moment(moment(this.state.Datepicked).format("DD-MM-YYYY") + "07:30:00", "DD-MM-YYYY HH:mm:ss.S")
                        //temptime = moment.duration(moment(moment(payload[this.state.chartItem].value).diff(initTime)).format("HH:mm:ss"))
                        timeValue = moment.duration(moment(timeValue).diff(iniTime))
                        //console.log(moment(payload[this.state.chartItem].value).diff(initTime))
                        //temptime = moment()
                        //moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss").diff(moment(oldtime, "YYYY-MM-DD HH:mm:ss"))
                    } else {
                        iniTime = moment(moment(this.state.Datepicked).format("DD-MM-YYYY") + "19:30:00", "DD-MM-YYYY HH:mm:ss.S")
                        timeValue = moment.duration(moment(timeValue).diff(iniTime))
                        //console.log(moment(payload[this.state.chartItem].value).format("DD-MM-YYYY"))
                    }
                }
                //console.log(item.type_mem)
                //console.log(item.time_mem)
                //console.log(moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf())
                //console.log(timeValue)
                //console.log("in set g")
                //console.log(ind)
                if (item.type_mem === 1) {
                    arrBar.push(<Bar name="Breaker on" dataKey={"time" + allIndex} stackId="a" fill="#A4B499" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t1"]} />)
                    //console.log("time"+allIndex+"/color:off")
                    allIndex++
                    OEEall[0].breakeron = OEEall[0].breakeron + timeValue
                    if (ind !== 0) {
                        OEE[0].breakeron = OEE[0].breakeron + timeValue
                    }
                } else if (item.type_mem === 2) {
                    arrBar.push(<Bar name="Master on" dataKey={"time" + allIndex} stackId="a" fill="#A1E076" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t2"]} />)
                    //console.log("time"+allIndex+"/color:on")
                    allIndex++
                    OEEall[0].masteron = OEEall[0].masteron + timeValue
                    if (ind !== 0) {
                        OEE[0].masteron = OEE[0].masteron + timeValue
                    }
                } else if (item.type_mem === 3) {
                    arrBar.push(<Bar name="Auto run on" dataKey={"time" + allIndex} stackId="a" fill="#1CE105" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t2"]} />)
                    //console.log("time"+allIndex+"/color:on")
                    allIndex++
                    OEEall[0].autorunon = OEEall[0].autorunon + timeValue
                    if (ind !== 0) {
                        OEE[0].autorunon = OEE[0].autorunon + timeValue
                    }
                } else if (item.type_mem === 4 && timeValue > (StdHandTime * 1000) && prevType !== 6) {
                    arrBar.push(<Bar name="Non value time" dataKey={"time" + allIndex} stackId="a" fill="#FFD853" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t42"]} />)
                    //console.log("time"+allIndex+"/color:no work")
                    allIndex++
                    OEEall[0].noworking = OEEall[0].noworking + timeValue - (StdHandTime * 1000)
                    OEEall[0].handtime = OEEall[0].handtime + (StdHandTime * 1000)
                    if (ind !== 0) {
                        OEE[0].noworking = OEE[0].noworking + timeValue - (StdHandTime * 1000)
                        OEE[0].handtime = OEE[0].handtime + (StdHandTime * 1000)
                    }
                } else if (item.type_mem === 4 && timeValue <= (StdHandTime * 1000) && prevType !== 6) {
                    arrBar.push(<Bar name="H/T" dataKey={"time" + allIndex} stackId="a" fill="#0054DE" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t41"]} />)
                    //console.log("time"+allIndex+"/color:H/T")
                    allIndex++
                    OEEall[0].handtime = OEEall[0].handtime + timeValue
                    cntHTall++
                    if (ind !== 0) {
                        OEE[0].handtime = OEE[0].handtime + timeValue
                        cntHT++
                    }
                    if (timeValue > StdHandTime * 1000) {
                        LossHTall += (timeValue - (StdHandTime * 1000))
                        if (ind !== 0) {
                            LossHT += (timeValue - (StdHandTime * 1000))
                        }
                    }
                } else if (item.type_mem === 4 && prevType === 6) {
                    arrBar.push(<Bar name="Loss time" dataKey={"time" + allIndex} stackId="a" fill="#DF9D05" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t43"]} />)
                    //console.log("time"+allIndex+"/color:Normal")
                    allIndex++
                    OEEall[0].losstime = OEEall[0].losstime + timeValue
                    if (timeValue < 900 * 1000) {
                        OEEall[0].lossshort += timeValue
                    } else {
                        OEEall[0].lossbreak += timeValue
                    }
                    if (ind !== 0) {
                        OEE[0].losstime = OEE[0].losstime + timeValue
                        if (timeValue < 900 * 1000) {
                            OEE[0].lossshort += timeValue
                        } else {
                            OEE[0].lossbreak += timeValue
                        }
                    }
                    //console.log(LossMT + "=" + LossMT + "+(" + timeValue + "-" + StdMCTime * 1000 + ")")
                } else if (item.type_mem === 5) {
                    arrBar.push(<Bar name="Normal cycle" dataKey={"time" + allIndex} stackId="a" fill="#3CB8FF" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t5"]} />)
                    //console.log("time"+allIndex+"/color:Normal")
                    allIndex++
                    OEEall[0].normalcycle = OEEall[0].normalcycle + timeValue
                    cntMTall++
                    if (ind !== 0) {
                        OEE[0].normalcycle = OEE[0].normalcycle + timeValue
                        cntMT++
                    }
                    if (timeValue > StdMCTime * 1000) {
                        LossMTall += (timeValue - (StdMCTime * 1000))
                        if (ind !== 0) {
                            LossMT += (timeValue - (StdMCTime * 1000))
                        }
                    }
                    //console.log(LossMT + "=" + LossMT + "+(" + timeValue + "-" + StdMCTime * 1000 + ")")
                } else if (item.type_mem === 6) {
                    arrBar.push(<Bar name="Abnormal cycle" dataKey={"time" + allIndex} stackId="a" fill="#FF5630" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t6"]} />)
                    //console.log("time"+allIndex+"/color:ab")
                    allIndex++
                    OEEall[0].abnormal = OEEall[0].abnormal + timeValue
                    if (ind !== 0) {
                        OEE[0].abnormal = OEE[0].abnormal + timeValue
                    }
                } else if (item.type_mem === 7) {
                    arrBar.push(<Bar name="Warning occur cycle" dataKey={"time" + allIndex} stackId="a" fill="#FF8E75" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t6"]} />)
                    //console.log("time"+allIndex+"/color:ab")
                    allIndex++
                    OEEall[0].abnormal = OEEall[0].warning + timeValue
                    if (ind !== 0) {
                        OEE[0].abnormal = OEE[0].warning + timeValue
                    }
                } else {
                    console.log("not match")
                }
                scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })

                prevType = item.type_mem
                sumOEEall += timeValue
                if (ind !== 0) {
                    sumOEE += timeValue
                }
                //console.log("+")
            })
            //console.log(LossMT)
            //set Pareto Fault Chart
            var arrPareto = []
            var arrPareto2 = []
            var sumFaultCounter = 0
            var sumFaultTime = 0
            var percent = 0
            var sumpercent = 0
            Object.keys(this.state.FaultList).forEach(key => {
                //arrPareto = { ...arrPareto, [this.state.FaultList[key]]: this.state.FaultCounter[key] }
                if (this.state.FaultCounter[key] !== 0) {
                    arrPareto.push({ name: this.state.FaultList[key], times: this.state.FaultCounter[key], dura: arrFaultDura[key] })
                    sumFaultCounter += this.state.FaultCounter[key]
                    sumFaultTime += arrFaultDura[key]
                    //console.log(this.state.FaultCounter[key])
                }
            })
            //TotalFault = sumFaultCounter
            arrPareto.forEach(item => {
                //console.log(item)
                percent = Math.round(((item.times / sumFaultCounter * 100) + Number.EPSILON) * 100) / 100
                arrPareto2.push({ ...item, percent: percent })
            })
            arrPareto2.sort((a, b) => (a.times < b.times) ? 1 : -1)
            arrPareto = []
            arrPareto2.forEach(item => {
                sumpercent += item.percent
                sumpercent = Math.round((sumpercent + Number.EPSILON) * 100) / 100
                arrPareto.push({ ...item, percentStacked: sumpercent })
            })
            //console.log(arrPareto)
            const dura = moment.duration(sumFaultTime)
            var asMin = dura.asMinutes().toString().substring(0, dura.asMinutes().toString().indexOf("."))
            if (asMin === "") {
                asMin = 0
            }
            const duratime = asMin + ":" + dura.seconds() + "." + dura.milliseconds().toString().charAt(0)
            this.setState({
                ParetoFaultData: arrPareto,
                totalFault: sumFaultCounter,
                totalFaultTime: duratime,
            }, () => {
                //this.state.ParetoFaultData.sort((a, b) => (a.value < b.value) ? 1 : -1)
                //console.log(this.state.ParetoFaultData)
                this.getWorkcounter()
            })

            //SetgIndex++
            //console.log(arrBar)
            //console.log(scatterpair)
            OEEall[0].normalcycle = OEEall[0].normalcycle - LossMTall
            OEEall[0].handtime = OEEall[0].handtime - LossHTall
            OEEall[0].lossmt = LossMTall
            OEEall[0].lossht = LossHTall
            //OEEall[0].autorunon = 1000000

            OEE[0].normalcycle = OEE[0].normalcycle - LossMT
            OEE[0].handtime = OEE[0].handtime - LossHT
            OEE[0].lossmt = LossMT
            OEE[0].lossht = LossHT
            //disable loss handtime
            sumOEEall -= OEEall[0].handtime
            sumOEE -= OEE[0].handtime

            //console.log(OEE[0])
            //console.log(sumOEE)
            const sumLossall = OEEall[0].lossshort + OEEall[0].lossbreak
            const sumLoss = OEE[0].lossshort + OEE[0].lossbreak
            PerOEEall[0].Perlossmt = Number.parseFloat(OEEall[0].lossmt / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perlossht = Number.parseFloat(OEEall[0].lossht / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perlosstime = Number.parseFloat(OEEall[0].losstime / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perlossshort = Number.parseFloat(OEEall[0].lossshort / sumLossall * 100).toFixed(2)
            PerOEEall[0].Perlossbreak = Number.parseFloat(OEEall[0].lossbreak / sumLossall * 100).toFixed(2)
            PerOEEall[0].Perbreakeron = Number.parseFloat(OEEall[0].breakeron / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Permasteron = Number.parseFloat(OEEall[0].masteron / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perautorunon = Number.parseFloat(OEEall[0].autorunon / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Pernormalcycle = Number.parseFloat(OEEall[0].normalcycle / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perhandtime = Number.parseFloat(OEEall[0].handtime / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Pernoworking = Number.parseFloat(OEEall[0].noworking / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perabnormal = Number.parseFloat(OEEall[0].abnormal / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perwarning = Number.parseFloat(OEEall[0].warning / sumOEEall * 100).toFixed(2)
            avgHTall = Number.parseFloat(OEEall[0].handtime / cntHTall / 1000).toFixed(1)
            avgMTall = Number.parseFloat(OEEall[0].normalcycle / cntMTall / 1000).toFixed(1)
            avgCTall = Number.parseFloat(avgHTall) + Number.parseFloat(avgMTall)

            PerOEE[0].Perlossmt = Number.parseFloat(OEE[0].lossmt / sumOEE * 100).toFixed(2)
            PerOEE[0].Perlossht = Number.parseFloat(OEE[0].lossht / sumOEE * 100).toFixed(2)
            PerOEE[0].Perlosstime = Number.parseFloat(OEE[0].losstime / sumOEE * 100).toFixed(2)
            PerOEE[0].Perlossshort = Number.parseFloat(OEE[0].lossshort / sumLoss * 100).toFixed(2)
            PerOEE[0].Perlossbreak = Number.parseFloat(OEE[0].lossbreak / sumLoss * 100).toFixed(2)
            PerOEE[0].Perbreakeron = Number.parseFloat(OEE[0].breakeron / sumOEE * 100).toFixed(2)
            PerOEE[0].Permasteron = Number.parseFloat(OEE[0].masteron / sumOEE * 100).toFixed(2)
            PerOEE[0].Perautorunon = Number.parseFloat(OEE[0].autorunon / sumOEE * 100).toFixed(2)
            PerOEE[0].Pernormalcycle = Number.parseFloat(OEE[0].normalcycle / sumOEE * 100).toFixed(2)
            PerOEE[0].Perhandtime = Number.parseFloat(OEE[0].handtime / sumOEE * 100).toFixed(2)
            PerOEE[0].Pernoworking = Number.parseFloat(OEE[0].noworking / sumOEE * 100).toFixed(2)
            PerOEE[0].Perabnormal = Number.parseFloat(OEE[0].abnormal / sumOEE * 100).toFixed(2)
            PerOEE[0].Perwarning = Number.parseFloat(OEE[0].warning / sumOEE * 100).toFixed(2)
            avgHT = Number.parseFloat(OEE[0].handtime / cntHT / 1000).toFixed(1)
            avgMT = Number.parseFloat(OEE[0].normalcycle / cntMT / 1000).toFixed(1)
            avgCT = Number.parseFloat(avgHT) + Number.parseFloat(avgMT)

            if (isNaN(avgCT)) {
                avgCT = 0.0
            }
            if (isNaN(avgCTall)) {
                avgCTall = 0.0
            }

            //console.log(PerOEEall)
            //console.log(PerOEE)
            //console.log("per" + PerOEEall[0]["Perbreakeron"])
            this.setState({
                Bardata: arrBar,
                //isLoading: false,
                stOEEall: OEEall,
                stOEE: OEE,
                ScatterData: scatterpair,
            }, () => {
                this.includeClick(this.state.included)
                //this.renderPerOEEBar()
                setTimeout(() => {
                    this.state.gData.sort(naturalSortG)
                    //console.log(this.state.gData)
                    StSelectedLength--;
                    if (StSelectedLength === 0) {
                        this.modalLoadtoggle(false);
                    }
                    //console.log(this.state.Bardata)
                    //console.log(this.state.ScatterData)
                    /*console.log(OEEall)
                    console.log(this.state.stOEEall[0].abnormal)
                    this.state.stOEEall.map(item => {
                        console.log(item)
                        Object.keys(item).map((key, ind, value) => console.log(key + item[key]))
                    })*/
                }, 1000);
            })
        })
    }

    renderLegend = () => {
        return (
            [
                //{ value: "M/T Loss", type: 'square', color: "#CB7FFF" },
                //{ value: "H/T Loss", type: 'square', color: "#FFA3F9" },
                //{ value: "Machine off", type: 'square', color: "#545653" },
                { value: "Setup Time", type: 'square', color: "#A4B499" },
                //{ value: "Master on", type: 'square', color: "#A1E076" },
                //{ value: "Auto run on", type: 'square', color: "#1CE105" },
                { value: "M/T", type: 'square', color: "#3CB8FF" },
                { value: "H/T", type: 'square', color: "#0054DE" },
                { value: "C/T Over", type: 'square', color: "#FFD853" },
                { value: "NG Cycle Time", type: 'square', color: "#FF5630" },
                { value: "Defect Loss Time", type: 'square', color: "#DF9D05" },
                //{ value: "Warning occur cycle", type: 'square', color: "#FF8E75" },
            ]
        )
    }

    setTooltip = (index) => {
        //console.log(index+"/"+allind)
        /*this.setState({
            chartItem: index,
        });*/
        ChartIndex = index
        //console.log("it:"+index);
    }

    //Chart Tooltip
    customTooltips = ({ label, active, payload }) => {
        if (!active || payload == null || payload[ChartIndex] == null || payload.length === 0) {
            return null;
        }
        //const id = this.state.chartItem
        //console.log(payload)
        //console.log("detailitem:"+this.state.detailItem)
        var typename = payload[ChartIndex].name
        if (typename === "Normal cycle") {
            typename = "Operation Time"
        } else if (typename === "Abnormal cycle") {
            typename = "NG Cycle Time"
        } else if (typename === "Loss time") {
            typename = "Defect Loss Time"
        }
        var temp = payload[ChartIndex].dataKey
        //console.log(temp.substring(4))
        var temptime
        var initTime
        var time
        if (ChartIndex === 0) {
            if (this.state.DayNight === 0) {//day
                initTime = moment(moment(this.state.Datepicked).format("DD-MM-YYYY") + "07:30:00", "DD-MM-YYYY HH:mm:ss.S")
                //temptime = moment.duration(moment(moment(payload[this.state.chartItem].value).diff(initTime)).format("HH:mm:ss"))
                temptime = moment.duration(moment(payload[ChartIndex].value).diff(initTime))
                //console.log(moment(payload[this.state.chartItem].value).diff(initTime))
                //temptime = moment()
                //moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss").diff(moment(oldtime, "YYYY-MM-DD HH:mm:ss"))
            } else {
                initTime = moment(moment(this.state.Datepicked).format("DD-MM-YYYY") + "19:30:00", "DD-MM-YYYY HH:mm:ss.S")
                temptime = moment.duration(moment(payload[ChartIndex].value).diff(initTime))
                //console.log(moment(payload[this.state.chartItem].value).format("DD-MM-YYYY"))
            }
        } else {
            temptime = moment.duration(payload[ChartIndex].value)
        }
        time = temptime.get('hours') + ":" + temptime.get('minutes') + ":" + temptime.get('seconds') + "." + temptime.get('milliseconds').toString().charAt(0)
        return (
            <div className="custom-tooltip">
                <p className="tooltip-head">{typename}</p>
                <p className="tooltip-time">{"duration : " + time} hr.</p>
                <p className="tooltip-detail">{"detail : " + payload[ChartIndex].payload["detail" + temp.substring(4)]}</p>
            </div>
        );
    }

    customScatterTooltips = ({ label, active, payload }) => {
        //console.log(payload)
        //console.log(active)
        var typename = ""
        if (!active || payload === null || payload.length === 0) {
            //console.log("null")
            return null;
        }
        if (payload[1].value === 1) {
            typename = "Breaker On"
        } else if (payload[1].value === 2) {
            typename = "Master On"
        } else if (payload[1].value === 3) {
            typename = "Auto run On"
        } else if (payload[1].value === 4) {
            typename = "Start Cycle"
        } else if (payload[1].value === 5) {
            typename = "Cycle finish"
        } else if (payload[1].value === 6) {
            typename = "Abnormal Cycle finish"
        } else if (payload[1].value === 7) {
            typename = "Warning occured finish"
        }
        return (
            <div className="custom-tooltip">
                <p className="tooltip-head">{typename}</p>
                <p className="tooltip-time">{"time : " + moment(payload[0].value).format("HH:mm:ss.S")} hr.</p>
                <p className="tooltip-detail">{"detail: " + payload[0].payload["detail"]}</p>
            </div>
        );
    }

    onSliderChange = value => {
        //console.log(this.state.sliderUpdate)
        if (this.state.sliderUpdate) {
            //console.log("sliderchange:" + value)
            this.setState({
                minGraph: value[0],
                maxGraph: value[1],
                gapTick: Math.ceil((value[1] - value[0]) / 9),
                Slidervalue: [value[0], value[1]]
            })
        } else {
            this.setState({ sliderUpdate: true })
        }
    }

    //Slider Tooltip
    TooltipHandle = (props) => {
        const { value, dragging, index, ...rest } = props;
        return (
            /*<Tooltip
                prefixCls="rc-slider-tooltip"
                overlay={value}
                visible={dragging}
                placement="top"
                key={index}
                className="HandleTooltip"
            >
                <Handle value={value} {...rest} />
            </Tooltip>*/
            <FlexHandle key={index} value={value} {...rest}>
                {index === 0 ? <Value>{moment(value).format("DD/MM HH:mm")}</Value> : <Value1>{moment(value).format("DD/MM HH:mm")}</Value1>}
            </FlexHandle>
        );
    }

    DatepickerFn = () => {
        //console.log(moment(this.state.Datepicked).format("DD/MM/YYYY"));
        //console.log("picker:" + moment(moment(this.state.Datepicked).format("DD/MM/YYYY") + " 16:30:00", "DD/MM/YYYY HH:mm:ss").valueOf());
        //console.log("min:" + this.state.minGraph);
        if (this.state.updateList) {
            //this.modalLoadtoggle(true);
            //this.getList();
            this.setState({ updateList: false });
        }
        return (
            <DatePicker
                dateFormat="dd/MM/yyyy"
                closeOnScroll={true}
                selected={this.state.Datepicked}
                onChange={(date) => this.SetDateValue(date)}
                todayButton="Today"
            />
        );
    }

    SetDateValue = (date) => {
        if (this.state.StSelected.length !== 0) {
            this.modalLoadtoggle(true)
        }
        this.setState({
            Datepicked: date,
            Datestart: date,
            Datestop: date,
            Slidervalue: [
                moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").valueOf(),
                moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf()
            ],
            minGraph: moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").valueOf(),
            maxGraph: moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf(),
            gapTick: Math.ceil((moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).diff(moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S"))) / 9),
        }, () => {
            this.setState({ updateList: true })
            if (this.state.allFault) {
                this.GetAllFaultOnly()
            } else {
                this.getListeachStation()
            }
            //console.log("date selected")
        });
        //console.log(this.state.Slidervalue);
        //console.log(date);
        //console.log(this.state.Datepicked);
        //console.log(moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss").add({ hours: 11, minutes: 50 }).valueOf())
        //console.log("tick=" + Math.ceil((moment(moment(date).format("DD/MM/YYYY") + " 16:30:00", "DD/MM/YYYY HH:mm:ss").diff(moment(moment(date).format("DD/MM/YYYY") + " 07:30:00", "DD/MM/YYYY HH:mm:ss"))) / 9))
    }

    ButtonDayNight = (DayNights) => {
        //const [DayNights, setDayNight] = useState(null);

        //console.log(DayNights)
        var time1
        if (DayNights === 0) {
            time1 = "07:30:00"
        } else {
            time1 = "19:30:00"
        }
        var date = this.state.Datepicked
        this.setState({
            DayNight: DayNights,
            TimeShift: time1,
            Slidervalue: [
                moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss.S").valueOf(),
                moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf()
            ],
            minGraph: moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss.S").valueOf(),
            maxGraph: moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf(),
            gapTick: Math.ceil((moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).diff(moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss.S"))) / 9),
            sliderUpdate: false,
        }, () => {
            this.setState({
                updateList: true
            }, () => {
                if (this.state.StSelected.length !== 0) {
                    this.modalLoadtoggle(true)
                }
                if (this.state.allFault) {
                    this.GetAllFaultOnly()
                } else {
                    this.getListeachStation()
                }
                this.setBreakTime()
            })
        })
        //console.log(moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss").valueOf() + "+" + moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss").add({ hours: 11, minutes: 50 }).valueOf())
    }

    modalLoadtoggle = (flag) => {
        //console.log("modal:" + flag)
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

    includeClick = (flag) => {
        this.setState({
            included: flag
        }, () => {
            if (flag) {
                this.setState({
                    stOEEshow: this.state.stOEEall,
                    perOEEshow: PerOEEall,
                }, () => {
                    //console.log(this.state.perOEEshow)
                    //this.renderPerOEEBar()
                    this.setBreakTime()
                })
            } else {
                this.setState({
                    stOEEshow: this.state.stOEE,
                    perOEEshow: PerOEE,
                }, () => {
                    //console.log(this.state.perOEEshow)
                    //this.renderPerOEEBar()
                    this.setBreakTime()
                })
            }
            //console.log(this.state.perOEEshow)
            //console.log(PerOEEall)
        })
    }

    renderPerOEEBar = () => {
        var arrPerOEEBar = [
            /*<Bar dataKey="Pernormalcycle" stackId="a" fill="#3CB8FF" stroke="navy" strokeWidth={2} key={0} onMouseOver={() => this.setTooltip(0)} />,
            <Bar dataKey="Perhandtime" stackId="a" fill="#0054DE" stroke="navy" strokeWidth={2} key={1} onMouseOver={() => this.setTooltip(1)} />,
            <Bar dataKey="Pernoworking" stackId="a" fill="#FFD853" stroke="crimson" strokeWidth={2} key={2} onMouseOver={() => this.setTooltip(2)} />,
            <Bar dataKey="Perabnormal" stackId="a" fill="#FF5630" stroke="crimson" strokeWidth={2} key={3} onMouseOver={() => this.setTooltip(3)} />,
            <Bar dataKey="Perwarning" stackId="a" fill="#FF8E75" stroke="crimson" strokeWidth={2} key={4} onMouseOver={() => this.setTooltip(4)} />,
            <Bar dataKey="Perautorunon" stackId="a" fill="#1CE105" stroke="crimson" strokeWidth={2} key={5} onMouseOver={() => this.setTooltip(5)} />,
            <Bar dataKey="Permasteron" stackId="a" fill="#A1E076" stroke="crimson" strokeWidth={2} key={6} onMouseOver={() => this.setTooltip(6)} />,
            <Bar dataKey="Perbreakeron" stackId="a" fill="#A4B499" stroke="crimson" strokeWidth={2} key={7} onMouseOver={() => this.setTooltip(7)} />,
            <Bar dataKey="Perlosstime" stackId="a" fill="#DF9D05" stroke="crimson" strokeWidth={2} key={8} onMouseOver={() => this.setTooltip(8)} />,
            <Bar dataKey="Perlossht" stackId="a" fill="#FFA3F9" stroke="crimson" strokeWidth={2} key={9} onMouseOver={() => this.setTooltip(9)} />,
            <Bar dataKey="Perlossmt" stackId="a" fill="#CB7FFF" stroke="crimson" strokeWidth={2} key={10} onMouseOver={() => this.setTooltip(10)} />,*/

            //modify
            <Bar dataKey="Pernormalcycle" stackId="a" fill="#3CB8FF" stroke="navy" strokeWidth={2} key={0} onMouseOver={() => this.setTooltip(0)} />,
            //<Bar dataKey="Perhandtime" stackId="a" fill="#0054DE" stroke="navy" strokeWidth={2} key={1} onMouseOver={() => this.setTooltip(1)} />,
            <Bar dataKey="Perbreakeron" stackId="a" fill="#A4B499" stroke="crimson" strokeWidth={2} key={7} onMouseOver={() => this.setTooltip(1)} />,
            <Bar dataKey="Pernoworking" stackId="a" fill="#FFD853" stroke="crimson" strokeWidth={2} key={2} onMouseOver={() => this.setTooltip(2)} />,
            //<Bar dataKey="Perwarning" stackId="a" fill="#FF8E75" stroke="crimson" strokeWidth={2} key={4} onMouseOver={() => this.setTooltip(4)} />,
            //<Bar dataKey="Perautorunon" stackId="a" fill="#1CE105" stroke="crimson" strokeWidth={2} key={5} onMouseOver={() => this.setTooltip(5)} />,
            //<Bar dataKey="Permasteron" stackId="a" fill="#A1E076" stroke="crimson" strokeWidth={2} key={6} onMouseOver={() => this.setTooltip(6)} />,
            <Bar dataKey="Perlossmt" stackId="a" fill="#CB7FFF" stroke="crimson" strokeWidth={2} key={10} onMouseOver={() => this.setTooltip(3)} />,
            <Bar dataKey="Perabnormal" stackId="a" fill="#FF5630" stroke="crimson" strokeWidth={2} key={3} onMouseOver={() => this.setTooltip(4)} />,
            <Bar dataKey="Perlosstime" stackId="a" fill="#DF9D05" stroke="crimson" strokeWidth={2} key={8} onMouseOver={() => this.setTooltip(5)} />,
            //<Bar dataKey="Perlossht" stackId="a" fill="#FFA3F9" stroke="crimson" strokeWidth={2} key={9} onMouseOver={() => this.setTooltip(9)} />,
        ]
        //console.log(this.state.perOEEshow)
        if (this.state.perOEEshow.length !== 0 && !isNaN(this.state.perOEEshow[0]["Pernormalcycle"])) {
            this.setState({ barPerOEE: arrPerOEEBar })
        } else {
            //console.log("oee null")
            this.setState({ barPerOEE: [] })
        }
    }

    customOEETooltips = ({ label, active, payload }) => {
        if (!active || payload == null || payload[ChartIndex] === null || payload.length === 0) {
            return null;
        }
        if (payload[ChartIndex] === undefined) {
            return null;
        }
        var keyOEE
        var textOEE
        keyOEE = payload[ChartIndex].name
        switch (keyOEE) {
            case 'Perlossmt':
                keyOEE = "lossmt"
                textOEE = "M/T Loss"
                break
            case 'Perlossht':
                keyOEE = "lossht"
                textOEE = "H/T Loss"
                break
            case 'Perlosstime':
                keyOEE = "losstime"
                textOEE = "Loss Time"
                break
            case 'Perbreakeron':
                keyOEE = "breakeron"
                textOEE = "Setup Time"
                break
            case 'Permasteron':
                keyOEE = "masteron"
                textOEE = "Master On"
                break
            case 'Perautorunon':
                keyOEE = "autorunon"
                textOEE = "Auto Run On"
                break
            case 'Pernormalcycle':
                keyOEE = "normalcycle"
                textOEE = "Operation Time"
                break
            case 'Perhandtime':
                keyOEE = "handtime"
                textOEE = "H/T (Hand time)"
                break
            case 'Pernoworking':
                keyOEE = "noworking"
                textOEE = "C/T Over"
                break
            case 'Perabnormal':
                keyOEE = "abnormal"
                textOEE = "Defect Loss"
                break
            case 'Perwarning':
                keyOEE = "warning"
                textOEE = "Warning Occur Cycle"
                break
            default:
                keyOEE = "key not match";
                textOEE = "not match"
        }
        var time
        var temptime = moment.duration(this.state.stOEEshow[0][keyOEE])
        time = temptime.get('hours') + ":" + temptime.get('minutes') + ":" + temptime.get('seconds') + "." + temptime.get('milliseconds').toString().charAt(0)
        return (
            <div className="custom-tooltip">
                <p className="tooltip-head">{textOEE}</p>
                <p className="tooltip-time">{"duration : " + time} hr.</p>
                <p className="tooltip-detail">{"percent : " + payload[ChartIndex].value}%</p>
            </div>
        );
    }

    BarLegendMouseEnter = (item) => {
        if (!this.state.EnableLegend) {
            return null
        }
        var temparr
        var keysrch
        //console.log(item.value)
        if (item.value === "Master off") {
            keysrch = "t1"
        } else if (item.value === "Master on") {
            keysrch = "t2"
        } else if (item.value === "Normal cycle") {
            keysrch = "t5"
        } else if (item.value === "H/T") {
            keysrch = "t41"
        } else if (item.value === "Non value time") {
            keysrch = "t42"
        } else if (item.value === "Abnormal cycle") {
            keysrch = "t6"
        }
        //console.log(keysrch)
        Object.keys(this.state.BarOpacity).forEach((key, ind) => {
            //console.log(key)
            if (key === keysrch) {
                temparr = { ...temparr, [key]: 1.0 }
            } else {
                temparr = { ...temparr, [key]: 0.3 }
            }
        })
        //console.log(temparr)
        this.setState({
            BarOpacity: temparr,
        }, () => {
            //console.log(this.state.BarOpacity)
            this.reSetBarData()
        })
    }

    BarLegendMouseLeave = (item) => {
        //console.log("leave")
        if (!this.state.EnableLegend) {
            return null
        }
        this.setState(
            {
                BarOpacity: { t1: 1, t2: 1, t3: 1, t41: 1, t42: 1, t5: 1, t6: 1, t7: 1 }
            }, () => {
                //console.log(this.state.BarOpacity)
                this.reSetBarData()
            })
    }

    reSetBarData = () => {
        var n
        var dk
        var stid
        var fil
        var ky
        var opacityKey
        var newarrBar = []
        this.state.Bardata.forEach((item) => {
            //console.log("data:"+item.props.data)
            n = item.props.name
            dk = item.props.dataKey
            stid = item.props.stackId
            fil = item.props.fill
            ky = item.key
            if (n === "Master off") {
                opacityKey = "t1"
            } else if (n === "Master on") {
                opacityKey = "t2"
            } else if (n === "Normal cycle") {
                opacityKey = "t5"
            } else if (n === "H/T") {
                opacityKey = "t41"
            } else if (n === "Non value time") {
                opacityKey = "t42"
            } else if (n === "Abnormal cycle") {
                opacityKey = "t6"
            }
            //console.log(opacityKey)
            newarrBar.push(<Bar name={n} dataKey={dk} stackId={stid} fill={fil} key={ky} onMouseOver={() => this.setTooltip(item.props.data)} opacity={this.state.BarOpacity[opacityKey]} />)
        })
        this.setState({ Bardata: newarrBar }, () => { console.log(this.state.Bardata) })
    }

    ButtonEnableLegend = () => {
        this.setState({
            EnableLegend: !this.state.EnableLegend
        })
    }

    customFaultParetoTooltips = ({ label, active, payload }) => {
        //console.log(payload)
        //console.log(ChartIndex)
        if (!active || payload == null || payload.length === 0) {
            return null;
        }
        var textFault = payload[0].payload["name"]
        var times = payload[0].payload["times"]
        var percent = payload[0].payload["percent"]
        var ratiowork = Math.round(((times / workQty * 100) + Number.EPSILON) * 100) / 100
        const dura = moment.duration(payload[0].payload["dura"])
        const duratime = dura.asMinutes().toString().substring(0, dura.asMinutes().toString().indexOf(".")) + ":" + dura.seconds() + "." + dura.milliseconds().toString().charAt(0)
        if (ratiowork === Infinity) {
            ratiowork = "- "
        }
        return (
            <div className="custom-tooltip">
                <p className="tooltip-head">{textFault}</p>
                <p className="tooltip-time">{"Amount : " + times + " times"}</p>
                <p className="tooltip-detail">{"Ratio (Fault) : " + percent + "%"}</p>
                <p className="tooltip-detail">{"Ratio (Work amount) : " + ratiowork + "%"}</p>
                <p className="tooltip-detail-end">{"Loss time : " + duratime + "minutes"}</p>
            </div>
        );
    }

    ButtonSelectType = (sel) => {
        this.setState({
            ChartShowType: sel
        })
    }

    toggleSplitButton = () => {
        this.setState({ splitButtonOpen: !this.state.splitButtonOpen })
    }

    setSearchBy = (sender) => {
        //console.log(sender.currentTarget.textContent)
        const searchItem = sender.currentTarget.textContent
        this.setState({ SearchBy: searchItem })
        Object.keys(this.state.ResultList).forEach((key, i) => {
            if (this.state.ResultList[key] === searchItem) {
                searchItemIndex = i
            }
        })
        //console.log(searchItemIndex)
    }

    setSearchByNone = () => {
        this.setState({
            SearchBy: "",
            searchText: "",
            UseSearch: false,
        })
        document.getElementById("txt-search").value = ""
        searchItemIndex = null
    }

    SearchByButton = () => {
        if (searchItemIndex === null) {
            return null
        }
        const srchtext = document.getElementById("txt-search").value
        this.setState({
            searchText: srchtext,
            UseSearch: true,
        }, () => {
            /*Object.keys(this.state.ResultData).map(key => {
                console.log(this.state.ResultData[key].split(";")[searchItemIndex])
                console.log(this.state.searchText)
                console.log(this.state.ResultData[key].split(";")[searchItemIndex].includes(this.state.searchText))
            })*/
        })
    }

    QtyChange = (workQty1) => {
        //workQty = document.getElementById("wqty").value
        workQty = workQty1
        var qtyRatio = Math.round(((this.state.totalFault / workQty1 * 100) + Number.EPSILON) * 100) / 100
        if (qtyRatio === Infinity) {
            qtyRatio = "-"
        }
        this.setState({
            totalFaultRatio: qtyRatio
        })
        //console.log(workQty)
    }

    GetAllFaultOnly = () => {
        this.modalLoadtoggle(true)
        this.setState({
            Selected: [],
            allFault: true,
            otherTypedisable: true,
        }, () => {
            var apiURL = ""
            if (this.state.DayNight === 0) { //day
                apiURL = `/operationratioFaultDay?q1=${moment(this.state.Datepicked).format("YYYY-MM-DD")}_07:30:00_19:20:00`
                //oldtime = `${moment(this.state.Datepicked).format("DD/MM/YYYY")} 07:30:00`
            } else {
                apiURL = `/operationratioFaultNight?q1=${moment(this.state.Datepicked).format("YYYY-MM-DD")}_19:30:00_23:59:59_${moment(this.state.Datepicked, "YYYY-MM-DD").add({ days: 1 }).format("YYYY-MM-DD")}_00:00:00_07:20:00`
                //oldtime = `${moment(this.state.Datepicked).format("DD/MM/YYYY")} 19:30:00`
            }
            //get data same normal but type_mem <> 5 and order by machine_no,id then
            //find type_mem = 6 and it's id - 1 but machine_no must be same then
            //collect difference time and mode to memory then
            //sort times or time mode
            //add sort by count or time button
            var arrFaultallCounter = []
            var arrFaultallDura = []
            api.get(`/faultlist/${curSection}`)
                .then(results => {
                    arrFault = []
                    results.data.forEach((item, ind) => {
                        arrFault = { ...arrFault, [item.machine_index + "-" + item.ng_code]: item.detail_mem }
                        arrFaultallCounter = { ...arrFaultallCounter, [item.machine_index + "-" + item.ng_code]: 0 }
                        arrFaultallDura = { ...arrFaultallDura, [item.machine_index + "-" + item.ng_code]: 0 }
                    })
                    this.setState({
                        FaultList: arrFault,
                    }, () => {
                        api.get(`${apiURL}_${curSection}`)
                            .then(results => {
                                var prevResultmcno
                                var prevResultdate
                                var prevResulttime
                                var arrFaultall = []
                                var sumFaultCounter = 0
                                var sumFaultTime = 0
                                results.data.forEach((result, ind) => {
                                    if (result.type_mem === 6 && ind >= 1 && result.machine_no === prevResultmcno) {
                                        //console.log(prevResulttime)
                                        //console.log(result.time_mem)
                                        var duraFault = moment(result.date_mem + " " + result.time_mem, "YYYY-MM-DD HH:mm:ss.S").diff(moment(prevResultdate + " " + prevResulttime, "YYYY-MM-DD HH:mm:ss.S"))
                                        duraFault = moment.duration(duraFault).valueOf()
                                        //console.log(duraFault)
                                        //console.log(result.ng_code)
                                        var NGdetail = ""
                                        var NGdetail2 = ""
                                        if (result.ng_code !== null) {
                                            NGdetail = this.state.FaultList[result.machine_no + "-" + result.ng_code.split(";")[0]]
                                            if (NGdetail === undefined || NGdetail === "0") {
                                                NGdetail = ""
                                            } else {
                                                //console.log(item.ng_code)
                                                arrFaultallCounter = { ...arrFaultallCounter, [result.machine_no + "-" + result.ng_code.split(";")[0]]: arrFaultallCounter[result.machine_no + "-" + result.ng_code.split(";")[0]] + 1 }
                                                arrFaultallDura = { ...arrFaultallDura, [result.machine_no + "-" + result.ng_code.split(";")[0]]: arrFaultallDura[result.machine_no + "-" + result.ng_code.split(";")[0]] + duraFault }
                                                sumFaultCounter += 1
                                                sumFaultTime += duraFault
                                            }
                                            NGdetail2 = this.state.FaultList[result.machine_no + "-" + result.ng_code.split(";")[1]]
                                            if (NGdetail2 !== undefined && NGdetail2 !== "0") {
                                                NGdetail = `${NGdetail},${NGdetail2}`
                                                arrFaultallCounter = { ...arrFaultallCounter, [result.machine_no + "-" + result.ng_code.split(";")[1]]: arrFaultallCounter[result.machine_no + "-" + result.ng_code.split(";")[1]] + 1 }
                                                arrFaultallDura = { ...arrFaultallDura, [result.machine_no + "-" + result.ng_code.split(";")[1]]: arrFaultallDura[result.machine_no + "-" + result.ng_code.split(";")[1]] + duraFault }
                                                sumFaultCounter += 1
                                                sumFaultTime += duraFault
                                            }
                                            //console.log(arrFaultallCounter[result.machine_no + "-" + result.ng_code.split(";")[0]])
                                        }
                                        //const faultTime = `${duraFault.get('hours')}:${duraFault.get('minutes')}:${duraFault.get('seconds')}.${duraFault.get('milliseconds').toString().charAt(0)}`
                                        //console.log(faultTime)
                                    } else {
                                        prevResultdate = result.date_mem
                                        prevResulttime = result.time_mem
                                        prevResultmcno = result.machine_no
                                    }
                                })
                                //console.log(arrFaultallCounter)
                                //console.log(arrFaultallDura)
                                Object.keys(arrFaultallCounter).forEach((key, value) => {
                                    if (arrFaultallCounter[key] !== 0) {
                                        const percent = Math.round(((arrFaultallCounter[key] / sumFaultCounter * 100) + Number.EPSILON) * 100) / 100
                                        arrFaultall = [...arrFaultall, { name: this.state.FaultList[key], times: arrFaultallCounter[key], dura: arrFaultallDura[key], percent: percent }]
                                    }
                                })
                                arrFaultall.sort((a, b) => (a.times < b.times) ? 1 : -1)
                                var sumpercent = 0
                                arrFaultall.forEach((item, ind) => {
                                    sumpercent += item.percent
                                    arrFaultall[ind] = { ...arrFaultall[ind], percentStacked: sumpercent }
                                })
                                //console.log(arrFaultall)
                                const dura = moment.duration(sumFaultTime)
                                var asMin = dura.asMinutes().toString().substring(0, dura.asMinutes().toString().indexOf("."))
                                console.log(asMin)
                                if (asMin === "") {
                                    asMin = 0
                                }
                                const duratime = asMin + ":" + dura.seconds() + "." + dura.milliseconds().toString().charAt(0)
                                this.setState({
                                    ParetoFaultData: arrFaultall,
                                    totalFault: sumFaultCounter,
                                    totalFaultTime: duratime,
                                }, () => {
                                    this.modalLoadtoggle(false)
                                })
                            })
                            .catch(error => alert(error))
                    })
                })
                .catch(error => alert(error))
        })
    }

    createPagination = () => {
        var cnt = 0
        Object.keys(this.state.ResultData).forEach((key, ind) => {
            var checkres = this.state.ResultData[key].split(";")[searchItemIndex]
            if ((this.state.UseSearch && checkres.includes(this.state.searchText)) || (!this.state.UseSearch)) {
                cnt++
            }
        })
        const pgamount = Math.ceil(cnt / perPage)
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
        //console.log(pg)
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

    getWorkcounter = async () => {
        const today = moment(this.state.Datepicked).format("YYYY-MM-DD")
        //time = moment().format("HH:mm:ss")
        //const prevday = moment(this.state.Datepicked).subtract(1, 'days').format("YYYY-MM-DD")
        const nextday = moment(this.state.Datepicked).add(1, 'days').format("YYYY-MM-DD")
        var Total = 0
        var urlget
        var urlgetcount
        var urlgetcountday
        //console.log(moment().valueOf())
        //console.log(moment(`${today} 07:30:00`, "YYYY-MM-DD HH:mm:ss").valueOf())
        const shift = this.state.DayNight
        if (shift === 0) { //day
            urlget = `/workdistinct?q=day_ST6_${today}_07:30:00_19:20:00`
            urlgetcount = `/workcount?q=day_ST6_${today}_07:30:00_19:20:00`
        } else if (shift === 1) { //night
            urlget = `/workdistinct?q=night_ST6_${today}_${nextday}_19:20:00_07:30:00`
            urlgetcount = `/workcount?q=night_ST6_${today}_${nextday}_19:20:00_07:30:00`
            urlgetcountday = `/workcount?q=day_ST6_${today}_07:30:00_19:20:00`
        }
        //console.log(urlget)
        //console.log(urlgetcount)
        //console.log(prevday)
        if (urlget === null) {
            alert("urlget is empty")
            return null
        }
        await api.get(`${urlget}_${curSection}`)
            .then(lists => {
                //console.log(lists.data)
                if (lists.data.length !== 0) {
                    lists.data.forEach((list, ind) => {
                        //console.log(list[0])
                        //console.log(`${urlgetcount}_${list[0]}`)
                        api.get(`${urlgetcount}_${list[0]}_${curSection}`)
                            .then(cntlists => {
                                //console.log(cntlists.data["work_counter__max"])
                                if (shift === 1) {
                                    api.get(`${urlgetcountday}_${list[0]}_${curSection}`)
                                        .then(cntdaylists => {
                                            Total += cntlists.data["work_counter__max"] - cntdaylists.data["work_counter__max"]
                                            //console.log(Total)
                                            this.QtyChange(Total)
                                        })
                                        .catch(error => alert(error))
                                } else {
                                    Total += cntlists.data["work_counter__max"]
                                    //console.log(Total)
                                    this.QtyChange(Total)
                                }
                            })
                            .catch(error => {
                                alert(error)
                            })
                    })
                }

            })
            .catch(error => {
                alert(error)
            })
    }

    createShowCol = () => {
        var arrColLists = []
        var arrShowCol = []
        Object.keys(this.state.ResultList).forEach((key, ind) => {
            //console.log(this.state.ResultList[key])
            arrColLists = [...arrColLists, this.state.ResultList[key]]
            arrShowCol = [...arrShowCol, true]
        })
        this.setState({
            columnLists: arrColLists,
            columnShow: arrShowCol
        })
    }

    ButtonShowCol = (ColIndex) => {
        const curSta = this.state.columnShow[ColIndex]
        var countShow = 0
        var flag = true
        var flagDe = true
        const newarrColShow = this.state.columnShow.map((show, ind) => {
            var res
            if (ind === ColIndex) {
                res = !curSta
            } else {
                res = show
            }
            return res
        })
        newarrColShow.forEach((item) => {
            if (item) {
                countShow++
            }
        })
        if (countShow === newarrColShow.length) {
            flag = true
            flagDe = false
        } else if (countShow === 0) {
            flag = false
            flagDe = true
        } else {
            flag = false
            flagDe = false
        }
        //console.log(flag)
        //console.log(flagDe)
        this.setState({
            columnShow: newarrColShow,
            selectAll: flag,
            deselectAll: flagDe,
        })
        //console.log(newarrColShow)
    }

    ButtonShowColAll = (flag) => {
        var arrShowCol = this.state.columnShow.fill(flag)
        //console.log(arrShowCol)
        this.setState({
            columnShow: arrShowCol,
            selectAll: flag,
            deselectAll: !flag,
        })
    }

    yAxisScatter = (tickitem) => {
        //console.log(tickitem)
        var lb = ""
        switch (tickitem) {
            case 1:
                lb = "Breaker on"
                break
            case 2:
                lb = "Master on"
                break
            case 3:
                lb = "Auto run on"
                break
            case 4:
                lb = "Start cycle"
                break
            case 5:
                lb = "End cycle"
                break
            case 6:
                lb = "Abnormal"
                break
            case 7:
                lb = "Warning"
                break
            default:
                lb = ""
        }
        return lb
    }

    setManualBreak = () => {
        this.setState({
            manualBreak: !this.state.manualBreak
        }, () => {
            this.setBreakTime()
        })
    }

    setBreakTime = () => {
        var breakTime = [{}, {}, {}, {}]
        const date = moment(this.state.Datepicked).format("YYYY-MM-DD")
        const set1 = document.getElementById('set1')
        const set2 = document.getElementById('set2')
        const set3 = document.getElementById('set3')
        const set4 = document.getElementById('set4')
        const set5 = document.getElementById('set5')
        const set6 = document.getElementById('set6')
        const set7 = document.getElementById('set7')
        if (set1 === null || set2 === null || set3 === null || set4 === null || set5 === null || set6 === null || set7 === null) {
            return null
        }
        //morning
        if (set1.checked) {
            breakTime[0] = {
                start: moment(date + " 09:30:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 09:40:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        } else if (set2.checked) {
            breakTime[0] = {
                start: moment(date + " 09:40:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 09:50:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        }
        //lunch
        if (set3.checked) {
            breakTime[1] = {
                start: moment(date + " 11:15:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 12:15:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        } else if (set4.checked) {
            breakTime[1] = {
                start: moment(date + " 11:30:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 12:30:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        } else if (set5.checked) {
            breakTime[1] = {
                start: moment(date + " 11:45:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 12:45:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        }
        //afternoon
        if (set6.checked) {
            breakTime[2] = {
                start: moment(date + " 14:30:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 14:40:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        } else if (set7.checked) {
            breakTime[2] = {
                start: moment(date + " 14:40:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(date + " 14:50:00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        }

        const mDatestart = moment(this.state.Datestart).format("YYYY-MM-DD")
        const mDatestop = moment(this.state.Datestop).format("YYYY-MM-DD")
        const mTimestart = this.state.Timestart
        const mTimestop = this.state.Timestop
        //console.log(`${mDatestart}/${mDatestop}/${mTimestart}/${mTimestop}`)
        if (this.state.manualBreak) {
            breakTime[3] = {
                start: moment(mDatestart + " " + mTimestart + ":00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                stop: moment(mDatestop + " " + mTimestop + ":00.0", "YYYY-MM-DD HH:mm:ss.S").valueOf()
            }
        }
        //console.log(moment(breakTime[1]["stop"] + moment.duration(12, 'h').asMilliseconds()).format("YYYY-MM-DD HH:mm:ss"))
        if (this.state.DayNight === 1) { //night
            breakTime.forEach((time, tind) => {
                if (Object.keys(time).length > 0 && tind !== 3) {
                    breakTime[tind]["start"] = breakTime[tind]["start"] + moment.duration(12, 'h').asMilliseconds()
                    breakTime[tind]["stop"] = breakTime[tind]["stop"] + moment.duration(12, 'h').asMilliseconds()
                    //console.log(moment(breakTime[tind]["start"]).format("YYYY-MM-DD HH-mm-ss"))
                    //console.log(moment(breakTime[tind]["stop"]).format("YYYY-MM-DD HH-mm-ss"))
                }
            })
        }
        //console.log(breakTime)

        var prevType = 0
        var prevTime = 0
        var ignoreTime = [{
            losstime: 0,
            lossshort: 0,
            lossbreak: 0,
            abnormal: 0,
            lossmt: 0,
            lossht: 0,
            masteron: 0,
            autorunon: 0,
            handtime: 0,
            noworking: 0,
            breakeron: 0,
            normalcycle: 0,
            warning: 0,
            notmatch: 0,
        }]
        this.state.data.forEach((item, ind) => {
            var getData = this.state.gData[SetgIndex]
            var timeValue = getData["time" + ind]
            var iniTime
            if (ind === 0) {
                if (this.state.DayNight === 0) {//day
                    iniTime = moment(moment(this.state.Datepicked).format("DD-MM-YYYY") + "07:30:00", "DD-MM-YYYY HH:mm:ss.S")
                    //temptime = moment.duration(moment(moment(payload[this.state.chartItem].value).diff(initTime)).format("HH:mm:ss"))
                    timeValue = moment.duration(moment(timeValue).diff(iniTime))
                    //console.log(moment(payload[this.state.chartItem].value).diff(initTime))
                    //temptime = moment()
                    //moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss").diff(moment(oldtime, "YYYY-MM-DD HH:mm:ss"))
                } else {
                    iniTime = moment(moment(this.state.Datepicked).format("DD-MM-YYYY") + "19:30:00", "DD-MM-YYYY HH:mm:ss.S")
                    timeValue = moment.duration(moment(timeValue).diff(iniTime))
                    //console.log(moment(payload[this.state.chartItem].value).format("DD-MM-YYYY"))
                }
            }
            //console.log(item.time_mem)
            //console.log(moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf())

            //console.log(breakTime)
            var calignoreTime = 0
            const curTime = moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf()
            breakTime.forEach((time, tind) => {
                if (Object.keys(time).length > 0) {
                    //console.log(time)
                    calignoreTime = 0
                    if (curTime <= time["start"] || prevTime >= time["stop"]) {
                        //not cal
                    } else if (curTime < time["stop"] && prevTime < time["start"]) {
                        calignoreTime = curTime - time["start"]
                    } else if (curTime >= time["stop"] && prevTime < time["start"]) {
                        calignoreTime = time["stop"] - time["start"]
                    } else if (curTime < time["stop"] && prevTime >= time["start"]) {
                        calignoreTime = timeValue
                    } else if (curTime >= time["stop"] && prevTime >= time["start"]) {
                        calignoreTime = time["stop"] - prevTime
                    }
                    //console.log(calignoreTime)
                    switch (item.type_mem) {
                        case 1:
                            ignoreTime[0].breakeron += calignoreTime
                            break
                        case 2:
                            ignoreTime[0].masteron += calignoreTime
                            break
                        case 3:
                            ignoreTime[0].autorunon += calignoreTime
                            break
                        case 4:
                            if (timeValue > (StdHandTime * 1000) && prevType !== 6) {
                                if (calignoreTime > timeValue - (StdHandTime * 1000)) {
                                    ignoreTime[0].noworking += timeValue - (StdHandTime * 1000)
                                    ignoreTime[0].handtime += calignoreTime - (timeValue - (StdHandTime * 1000))
                                } else {
                                    ignoreTime[0].noworking += calignoreTime
                                }
                            } else if (timeValue <= (StdHandTime * 1000) && prevType !== 6) {
                                ignoreTime[0].handtime += calignoreTime
                            } else if (prevType === 6) {
                                ignoreTime[0].losstime += calignoreTime
                                if (timeValue < 900 * 1000) {
                                    ignoreTime[0].lossshort += calignoreTime
                                } else {
                                    ignoreTime[0].lossbreak += calignoreTime
                                }
                            }
                            break
                        case 5:
                            ignoreTime[0].normalcycle += calignoreTime
                            break
                        case 6:
                            ignoreTime[0].abnormal += calignoreTime
                            break
                        case 7:
                            ignoreTime[0].abnormal += calignoreTime
                            break
                        default:
                            ignoreTime[0].notmatch += calignoreTime
                    }
                }
            })
            prevType = item.type_mem
            prevTime = moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf()
        })
        var igOEEall = [{
            losstime: 0,
            lossshort: 0,
            lossbreak: 0,
            abnormal: 0,
            lossmt: 0,
            lossht: 0,
            masteron: 0,
            autorunon: 0,
            handtime: 0,
            noworking: 0,
            breakeron: 0,
            normalcycle: 0,
            warning: 0,
        }]
        var igPerOEEall = [{
            Perlosstime: 0,
            Perlossshort: 0,
            Perlossbreak: 0,
            Perabnormal: 0,
            Perlossmt: 0,
            Perlossht: 0,
            Permasteron: 0,
            Perautorunon: 0,
            Perhandtime: 0,
            Pernoworking: 0,
            Perbreakeron: 0,
            Pernormalcycle: 0,
            Perwarning: 0,
        }]
        var igOEE = [{
            losstime: 0,
            lossshort: 0,
            lossbreak: 0,
            abnormal: 0,
            lossmt: 0,
            lossht: 0,
            masteron: 0,
            autorunon: 0,
            handtime: 0,
            noworking: 0,
            breakeron: 0,
            normalcycle: 0,
            warning: 0,
        }]
        var igPerOEE = [{
            Perlosstime: 0,
            Perlossshort: 0,
            Perlossbreak: 0,
            Perabnormal: 0,
            Perlossmt: 0,
            Perlossht: 0,
            Permasteron: 0,
            Perautorunon: 0,
            Perhandtime: 0,
            Pernoworking: 0,
            Perbreakeron: 0,
            Pernormalcycle: 0,
            Perwarning: 0,
        }]
        var sumignoreTime = 0
        Object.keys(ignoreTime[0]).forEach((key) => {
            //console.log(ignoreTime[0][key])
            if (key !== "handtime") { //disable handtime
                sumignoreTime += ignoreTime[0][key]
            }
        })
        //console.log(ignoreTime[0])
        //console.log(sumignoreTime)
        const igsumOEEall = sumOEEall - sumignoreTime
        const igsumOEE = sumOEE - sumignoreTime
        igOEEall[0].losstime = OEEall[0].losstime - ignoreTime[0].losstime
        igOEEall[0].lossshort = OEEall[0].lossshort - ignoreTime[0].lossshort
        igOEEall[0].lossbreak = OEEall[0].lossbreak - ignoreTime[0].lossbreak
        igOEEall[0].abnormal = OEEall[0].abnormal - ignoreTime[0].abnormal
        igOEEall[0].lossmt = OEEall[0].lossmt - ignoreTime[0].lossmt
        igOEEall[0].lossht = OEEall[0].lossht - ignoreTime[0].lossht
        igOEEall[0].masteron = OEEall[0].masteron - ignoreTime[0].masteron
        igOEEall[0].autorunon = OEEall[0].autorunon - ignoreTime[0].autorunon
        igOEEall[0].handtime = OEEall[0].handtime - ignoreTime[0].handtime
        igOEEall[0].noworking = OEEall[0].noworking - ignoreTime[0].noworking
        igOEEall[0].breakeron = OEEall[0].breakeron - ignoreTime[0].breakeron
        igOEEall[0].normalcycle = OEEall[0].normalcycle - ignoreTime[0].normalcycle
        igOEEall[0].warning = OEEall[0].warning - ignoreTime[0].warning
        //
        igOEE[0].losstime = OEE[0].losstime - ignoreTime[0].losstime
        igOEE[0].lossshort = OEE[0].lossshort - ignoreTime[0].lossshort
        igOEE[0].lossbreak = OEE[0].lossbreak - ignoreTime[0].lossbreak
        igOEE[0].abnormal = OEE[0].abnormal - ignoreTime[0].abnormal
        igOEE[0].lossmt = OEE[0].lossmt - ignoreTime[0].lossmt
        igOEE[0].lossht = OEE[0].lossht - ignoreTime[0].lossht
        igOEE[0].masteron = OEE[0].masteron - ignoreTime[0].masteron
        igOEE[0].autorunon = OEE[0].autorunon - ignoreTime[0].autorunon
        igOEE[0].handtime = OEE[0].handtime - ignoreTime[0].handtime
        igOEE[0].noworking = OEE[0].noworking - ignoreTime[0].noworking
        igOEE[0].breakeron = OEE[0].breakeron - ignoreTime[0].breakeron
        igOEE[0].normalcycle = OEE[0].normalcycle - ignoreTime[0].normalcycle
        igOEE[0].warning = OEE[0].warning - ignoreTime[0].warning

        const igsumLossall = igOEEall[0].lossshort + igOEEall[0].lossbreak
        const igsumLoss = igOEE[0].lossshort + igOEE[0].lossbreak
        igPerOEEall[0].Perlossmt = Number.parseFloat(igOEEall[0].lossmt / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perlossht = Number.parseFloat(igOEEall[0].lossht / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perlosstime = Number.parseFloat(igOEEall[0].losstime / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perlossshort = Number.parseFloat(igOEEall[0].lossshort / igsumLossall * 100).toFixed(2)
        igPerOEEall[0].Perlossbreak = Number.parseFloat(igOEEall[0].lossbreak / igsumLossall * 100).toFixed(2)
        igPerOEEall[0].Perbreakeron = Number.parseFloat(igOEEall[0].breakeron / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Permasteron = Number.parseFloat(igOEEall[0].masteron / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perautorunon = Number.parseFloat(igOEEall[0].autorunon / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Pernormalcycle = Number.parseFloat(igOEEall[0].normalcycle / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perhandtime = Number.parseFloat(igOEEall[0].handtime / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Pernoworking = Number.parseFloat(igOEEall[0].noworking / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perabnormal = Number.parseFloat(igOEEall[0].abnormal / igsumOEEall * 100).toFixed(2)
        igPerOEEall[0].Perwarning = Number.parseFloat(igOEEall[0].warning / igsumOEEall * 100).toFixed(2)
        avgHTall = Number.parseFloat(igOEEall[0].handtime / cntHTall / 1000).toFixed(1)
        avgMTall = Number.parseFloat(igOEEall[0].normalcycle / cntMTall / 1000).toFixed(1)
        avgCTall = Number.parseFloat(avgHTall) + Number.parseFloat(avgMTall)

        igPerOEE[0].Perlossmt = Number.parseFloat(igOEE[0].lossmt / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perlossht = Number.parseFloat(igOEE[0].lossht / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perlosstime = Number.parseFloat(igOEE[0].losstime / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perlossshort = Number.parseFloat(igOEE[0].lossshort / igsumLoss * 100).toFixed(2)
        igPerOEE[0].Perlossbreak = Number.parseFloat(igOEE[0].lossbreak / igsumLoss * 100).toFixed(2)
        igPerOEE[0].Perbreakeron = Number.parseFloat(igOEE[0].breakeron / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Permasteron = Number.parseFloat(igOEE[0].masteron / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perautorunon = Number.parseFloat(igOEE[0].autorunon / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Pernormalcycle = Number.parseFloat(igOEE[0].normalcycle / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perhandtime = Number.parseFloat(igOEE[0].handtime / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Pernoworking = Number.parseFloat(igOEE[0].noworking / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perabnormal = Number.parseFloat(igOEE[0].abnormal / igsumOEE * 100).toFixed(2)
        igPerOEE[0].Perwarning = Number.parseFloat(igOEE[0].warning / igsumOEE * 100).toFixed(2)
        avgHT = Number.parseFloat(igOEE[0].handtime / cntHT / 1000).toFixed(1)
        avgMT = Number.parseFloat(igOEE[0].normalcycle / cntMT / 1000).toFixed(1)
        avgCT = Number.parseFloat(avgHT) + Number.parseFloat(avgMT)

        if (isNaN(avgCT)) {
            avgCT = 0.0
        }
        if (isNaN(avgCTall)) {
            avgCTall = 0.0
        }

        const flag = this.state.included

        /*if (flag) {
            console.log(ignoreTime[0])
            console.log(OEEall[0])
            console.log(igOEEall[0])
        } else {
            console.log(ignoreTime[0])
            console.log(OEE[0])
            console.log(igOEE[0])
        }*/

        if (flag) {
            this.setState({
                stOEEshow: igOEEall,
                perOEEshow: igPerOEEall,
            }, () => {
                //console.log(this.state.perOEEshow)
                this.renderPerOEEBar()
            })
        } else {
            this.setState({
                stOEEshow: igOEE,
                perOEEshow: igPerOEE,
            }, () => {
                //console.log(this.state.perOEEshow)
                this.renderPerOEEBar()
            })
        }
    }

    SetShowTime = (flag, index) => {
        if (index === 1) {
            this.setState({
                ShowTimeStart: flag
            })
        } else {
            this.setState({
                ShowTimeStop: flag
            })
        }
    }

    DateRangeChange = (date, index) => {
        if (index === 1) { //start
            this.setState({
                Datestart: date
            }, () => {
                this.setBreakTime()
            })
        } else {
            this.setState({
                Datestop: date
            }, () => {
                this.setBreakTime()
            })
        }
        //console.log(moment(date).format("YYYY-MM-DD"))
    }

    TimeRangeChange = (time, index) => {
        if (index === 1) {
            this.setState({
                Timestart: time
            }, () => {
                this.setBreakTime()
            })
        } else {
            this.setState({
                Timestop: time
            }, () => {
                this.setBreakTime()
            })
        }
        //console.log(time)
    }

    render() {
        //const { isLoading } = this.state
        return (
            <>
                {/**Button Head block and Loading Modal*/}
                <div className="title">
                    <h1 className="title-head">Initial Stage Control Visualize</h1>
                    <ButtonGroup className="btn-type">
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(0)} active={this.state.ChartShowType === 0} disabled={this.state.otherTypedisable}>Time Chart</Button>
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(1)} active={this.state.ChartShowType === 1} disabled={this.state.otherTypedisable}>Time Ratio</Button>
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(2)} active={this.state.ChartShowType === 2}>Fault Chart</Button>
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(3)} active={this.state.ChartShowType === 3} disabled={this.state.otherTypedisable}>Quality Traceability</Button>
                    </ButtonGroup>
                </div>
                <Col>
                    {(this.state.ListStation.length !== null && this.state.ListStation.length !== undefined) && <div className="station-check">
                        <div className="list-text">
                            Station List :
                        </div>
                        {this.state.ListStation.sort(naturalSort).map(item => (
                            <Button className="st-button" color="primary" onClick={() => this.CheckBoxClick(item)} active={this.state.Selected.includes(item)} key={item}>{item}</Button>
                        ))}
                        {this.state.ChartShowType === 2 && <Button className="st-button" color="primary" onClick={() => this.GetAllFaultOnly()} active={this.state.allFault}>All</Button>}
                    </div>}
                </Col>
                {/*Button Day/Night */}
                <Col>
                    <div className="d-flex justify-content-center">
                        <ButtonGroup>
                            <Button className="btn-day" onClick={() => this.ButtonDayNight(0)} active={this.state.DayNight === 0}>Day</Button>
                            <Button className="btn-night" onClick={() => this.ButtonDayNight(1)} active={this.state.DayNight === 1}>Night</Button>
                        </ButtonGroup>
                        <div id="datetag">Date :</div>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            closeOnScroll={true}
                            selected={this.state.Datepicked}
                            onChange={(date) => this.SetDateValue(date)}
                            todayButton="Today"
                        />
                        {this.state.ChartShowType === 0 && <div id="datetag">Data Hightlight :</div>}
                        {this.state.ChartShowType === 0 && <Button className="btn-enable-legend" color="primary" onClick={() => this.ButtonEnableLegend()} active={this.state.EnableLegend}>{this.state.EnableLegend ? "Enable" : "Disable"}</Button>}
                        {(this.state.EnableLegend && this.state.ChartShowType === 0) && <div id="hover-tips">{'(mouse on legend item)'}</div>}
                    </div>
                </Col>
                {/**Button select Break Time */}
                {this.state.ChartShowType === 1 &&
                    <div>
                        <div className="btn-break-time">
                            <div className="mor-brk">
                                <FormGroup>
                                    <legend>Morning Break</legend>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="morning" id="set1" onClick={() => this.setBreakTime()} />{' '}
                                9:30 - 9:40
                            </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="morning" id="set2" onClick={() => this.setBreakTime()} />{' '}
                                9:40 - 9:50
                            </Label>
                                    </FormGroup>
                                </FormGroup>
                            </div>
                            <div className="lun-brk">
                                <FormGroup>
                                    <legend>Lunch Break</legend>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="lunch" id="set3" onClick={() => this.setBreakTime()} />{' '}
                                11:15 - 12:15
                            </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="lunch" id="set4" onClick={() => this.setBreakTime()} />{' '}
                                11:30 - 12:30
                            </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="lunch" id="set5" onClick={() => this.setBreakTime()} />{' '}
                                11:45 - 12:45
                            </Label>
                                    </FormGroup>
                                </FormGroup>
                            </div>
                            <div className="aft-brk">
                                <FormGroup>
                                    <legend>Afternoon Break</legend>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="afternoon" id="set6" onClick={() => this.setBreakTime()} />{' '}
                                14:30 - 14:40
                            </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="radio" name="afternoon" id="set7" onClick={() => this.setBreakTime()} />{' '}
                                14:40 - 14:50
                            </Label>
                                    </FormGroup>
                                </FormGroup>
                            </div>
                        </div>
                        <div className="head-time">
                            <Input addon type="checkbox" className="manual-check" onClick={() => this.setManualBreak()} value={this.state.manualBreak} />
                            <span>Manual Break Time</span>
                        </div>
                        {this.state.manualBreak &&
                            <div className="datetime-picker">
                                <div className="datetime-picker-sub">
                                    <DatePicker
                                        dateFormat="dd/MM/yyyy"
                                        closeOnScroll={true}
                                        selected={this.state.Datestart}
                                        onChange={(date) => this.DateRangeChange(date, 1)}
                                        todayButton="Today"
                                        className="break-datepicker"
                                    />
                                    <span className="time-text">{this.state.Timestart}</span>
                                    {this.state.ShowTimeStart &&
                                        <TimeKeeper
                                            time={this.state.Timestart}
                                            onChange={(time) => this.TimeRangeChange(time.formatted24, 1)}
                                            onDoneClick={() => this.SetShowTime(false, 1)}
                                            switchToMinuteOnHourSelect
                                            hour24Mode
                                            closeOnMinuteSelect
                                        />
                                    }
                                    {!this.state.ShowTimeStart &&
                                        <Button className="time-show" color="info" onClick={() => this.SetShowTime(true, 1)}>Show</Button>
                                    }
                                </div>
                                <div className="datetime-picker-sub">
                                    <DatePicker
                                        dateFormat="dd/MM/yyyy"
                                        closeOnScroll={true}
                                        selected={this.state.Datestop}
                                        onChange={(date) => this.DateRangeChange(date, 2)}
                                        todayButton="Today"
                                        className="break-datepicker"
                                    />
                                    <span className="time-text">{this.state.Timestop}</span>
                                    {this.state.ShowTimeStop &&
                                        <TimeKeeper
                                            time={this.state.Timestop}
                                            onChange={(time) => this.TimeRangeChange(time.formatted24, 2)}
                                            onDoneClick={() => this.SetShowTime(false, 2)}
                                            switchToMinuteOnHourSelect
                                            hour24Mode
                                            closeOnMinuteSelect
                                        />
                                    }
                                    {!this.state.ShowTimeStop &&
                                        <Button className="time-show" color="info" onClick={() => this.SetShowTime(true, 2)}>Show</Button>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                }

                <div className="progress-spinner">
                    <Modal className="modal-spinner" isOpen={this.state.isLoading} centered>
                        <ModalBody>
                            <h5>Loading data ...</h5>
                            <PacmanLoader className="pacman" css={override} color={"#DC0032"} />
                        </ModalBody>
                    </Modal>
                </div>

                {/**Bar time chart */}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 0) && <h1 className="title-mc-time-ele">กราฟเวลาปฏิบัติงาน (Operation Time Chart)</h1>
                }
                {(this.state.gData.length > 0 && this.state.ChartShowType === 0) && <ResponsiveContainer width="80%" height={this.state.gData.length * 300}>
                    <BarChart
                        layout="vertical"
                        width={1000}
                        data={this.state.gData}
                        margin={{
                            top: 20, right: 45, left: 0, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number"
                            interval={0}
                            ticks={[
                                this.state.minGraph,
                                this.state.minGraph + (this.state.gapTick * 1),
                                this.state.minGraph + (this.state.gapTick * 2),
                                this.state.minGraph + (this.state.gapTick * 3),
                                this.state.minGraph + (this.state.gapTick * 4),
                                this.state.minGraph + (this.state.gapTick * 5),
                                this.state.minGraph + (this.state.gapTick * 6),
                                this.state.minGraph + (this.state.gapTick * 7),
                                this.state.minGraph + (this.state.gapTick * 8),
                                this.state.maxGraph
                            ]}
                            tickFormatter={(unixTime) => moment(unixTime).format("HH:mm:ss")}
                            //domain={[moment("14:30:00", "HH:mm:ss").valueOf(), moment("14:42:00", "HH:mm:ss").valueOf()]}
                            domain={[this.state.minGraph, this.state.maxGraph]}
                            allowDataOverflow
                        />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip cursor={false} content={<this.customTooltips />} />
                        <Legend payload={this.renderLegend()} verticalAlign="top" align="right" onMouseEnter={this.BarLegendMouseEnter} onMouseLeave={this.BarLegendMouseLeave} />
                        {this.state.Bardata}
                    </BarChart>
                </ResponsiveContainer>
                }
                {/**Scatter time chart */}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 0) && <ResponsiveContainer width="80%" height={300}>
                    <ScatterChart
                        width={1000}
                        margin={{ top: 20, right: 45, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid />
                        <XAxis type="number"
                            dataKey={'x'}
                            name="Time"
                            interval={0}
                            ticks={[
                                this.state.minGraph,
                                this.state.minGraph + (this.state.gapTick * 1),
                                this.state.minGraph + (this.state.gapTick * 2),
                                this.state.minGraph + (this.state.gapTick * 3),
                                this.state.minGraph + (this.state.gapTick * 4),
                                this.state.minGraph + (this.state.gapTick * 5),
                                this.state.minGraph + (this.state.gapTick * 6),
                                this.state.minGraph + (this.state.gapTick * 7),
                                this.state.minGraph + (this.state.gapTick * 8),
                                this.state.maxGraph
                            ]}
                            tickFormatter={(unixTime) => moment(unixTime).format("HH:mm:ss")}
                            domain={[this.state.minGraph, this.state.maxGraph]}
                            allowDataOverflow
                        />
                        <YAxis
                            type="number"
                            dataKey={'y'}
                            name="Type"
                            interval={0}
                            ticks={[1, 2, 3, 4, 5, 6, 7]}
                            tickFormatter={this.yAxisScatter}
                            domain={[0.5, 7.5]}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<this.customScatterTooltips />} />
                        <Scatter name="A school" data={this.state.ScatterData} >
                            {
                                this.state.ScatterData.map((item, index) => {
                                    if (item.y === 1) {
                                        color = '#A4B499'
                                    } else if (item.y === 2) {
                                        color = '#A1E076'
                                    } else if (item.y === 3) {
                                        color = '#4FC200'
                                    } else if (item.y === 4) {
                                        color = '#3CB8FF'
                                    } else if (item.y === 5) {
                                        color = '#64FFFD'
                                    } else if (item.y === 6) {
                                        color = '#FF0000'
                                    } else if (item.y === 7) {
                                        color = '#FF5630'
                                    }
                                    return <Cell key={index} fill={color} Detail={item.detail} />
                                })
                            }
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
                }
                {/**Range slider */}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 0) && <div className="rangeslider">
                    <Range
                        allowCross={false}
                        min={moment(moment(this.state.Datepicked).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").valueOf()}
                        max={moment(moment(this.state.Datepicked).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf()}
                        value={this.state.Slidervalue}
                        onChange={this.onSliderChange}
                        step={60000}
                        handle={this.TooltipHandle}
                        tipProps={{ visible: true }}
                    />
                </div>
                }

                {/**Time Element block */}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 1) && <div className="oee-element">
                    <h1 className="title-mc-time-ele">กราฟอัตราส่วนการปฏิบัติงาน (Operation Time ratio)</h1>
                    <div className="oee-inc-btn">
                        <div className="list-text">
                            include 1st item ? :
                        </div>
                        <Button className="inc-btn" color="primary" onClick={() => this.includeClick(true)} active={this.state.included}>include</Button>
                        <Button className="inc-btn" color="primary" onClick={() => this.includeClick(false)} active={!this.state.included}>not include</Button>
                    </div>
                    <div className="oee-percent-item">
                        <div>
                            <BarChart
                                width={300}
                                height={720}
                                data={this.state.perOEEshow}
                                margin={{ top: 50, right: 10, bottom: 0, left: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis label="Time Chart" tick={false} />
                                <YAxis domain={[0, 100]} ticks={[25, 50, 75, 100]} label={{ value: "Percent (%)", angle: -90, position: "insideLeft", dy: 50 }} unit="%" />
                                <Tooltip cursor={false} content={<this.customOEETooltips />} />
                                <Legend verticalAlign="bottom" align="left" payload={this.renderLegend()} />
                                {this.state.barPerOEE}
                            </BarChart>
                        </div>
                        {/**Time element table */}
                        <div className="time-table">
                            <Table striped hover responsive>
                                <thead>
                                    <tr>
                                        <th id="oee-col1">Item</th>
                                        <th id="oee-col2">Time</th>
                                        <th id="oee-col3">Ratio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(this.state.perOEEshow.length !== 0) && this.state.stOEEshow.map(item => (
                                        Object.keys(item).map((key, ind) => {
                                            if (key !== "masteron" && key !== "autorunon" && key !== "warning" && key !== "lossht" && key !== "handtime") {
                                                if (key === "lossmt") {
                                                    keytable = "M/T Loss"
                                                } else if (key === "lossht") {
                                                    keytable = "H/T Loss"
                                                } else if (key === "losstime") {
                                                    keytable = "Loss Time"
                                                } else if (key === "breakeron") {
                                                    keytable = "Setup Time"
                                                } else if (key === "masteron") {
                                                    keytable = "Master On"
                                                } else if (key === "autorunon") {
                                                    keytable = "Auto run On"
                                                } else if (key === "normalcycle") {
                                                    keytable = "Operation Time"
                                                } else if (key === "handtime") {
                                                    keytable = "H/T (Hand time)"
                                                } else if (key === "noworking") {
                                                    keytable = "C/T Over"
                                                } else if (key === "abnormal") {
                                                    keytable = "Defect Loss"
                                                } else if (key === "warning") {
                                                    keytable = "Warning occur cycle"
                                                } else if (key === "lossshort") {
                                                    keytable = "  - Short Stop Loss (< 15 min.)"
                                                } else if (key === "lossbreak") {
                                                    keytable = "  - Breakdown Loss (>= 15 min.)"
                                                } else {
                                                    keytable = "not match"
                                                }
                                                if (key === "lossshort" || key === "lossbreak") {
                                                    return (<tr className="oee-table-text-sub" key={ind}>
                                                        <td>{keytable}</td>
                                                        <td>{moment.duration(item[key]).get('hours')}:{moment.duration(item[key]).get('minutes')}:{moment.duration(item[key]).get('seconds')}.{moment.duration(item[key]).get('milliseconds') / 100}</td>
                                                        {isNaN(this.state.perOEEshow[0]["Per" + key]) ? <td>0.00%</td> : <td>{this.state.perOEEshow[0]["Per" + key]}%</td>}
                                                    </tr>)
                                                } else {
                                                    return (<tr className="oee-table-text" key={ind}>
                                                        <td>{keytable}</td>
                                                        <td>{moment.duration(item[key]).get('hours')}:{moment.duration(item[key]).get('minutes')}:{moment.duration(item[key]).get('seconds')}.{moment.duration(item[key]).get('milliseconds') / 100}</td>
                                                        {isNaN(this.state.perOEEshow[0]["Per" + key]) ? <td>0.00%</td> : <td>{this.state.perOEEshow[0]["Per" + key]}%</td>}
                                                    </tr>)
                                                }
                                            } else {
                                                return null
                                            }
                                        })
                                    ))}
                                </tbody>
                            </Table>
                            <div className="avg-item">
                                {/*<div className="avg-left">
                                    <p>{`Average H/T : `}{this.state.included ? avgHTall : avgHT}{` s.`}</p>
                                    <p>{`Average M/T : `}{this.state.included ? avgMTall : avgMT}{` s.`}</p>
                                    </div>*/}
                                <div className="avg-right">
                                    <p>{`Average C/T : `}{this.state.included ? avgCTall : avgCT}{` s.`}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }

                {/*Fault pareto chart block */}
                {((this.state.gData.length > 0 && this.state.ChartShowType === 2) || this.state.allFault) && <div className="fault-chart">
                    <h1 className="title-mc-time-ele">กราฟจัดเรียงลำดับความผิดปกติ (Fault Pareto Chart)</h1>
                    <p className="total-fault">{`จำนวนความผิดปกติทั้งหมด (Total Fault occur) : ${this.state.totalFault} ครั้ง (times) = ${this.state.totalFaultRatio}%`}</p>
                    <p className="total-fault">{`เวลาความผิดปกติทั้งหมด (Total Fault time) : ${this.state.totalFaultTime} นาที (minutes)`}</p>
                    {/*<div className="work-qty-input">
                        <p className="work-qty-label">จำนวนงาน (Work Qty.): </p>
                        <Input placeholder="จำนวนงานที่ผลิต ..." className="input-work-qty" id="wqty" onChange={() => this.QtyChange()} autoComplete="off" />
                    </div>*/}
                    <div className="fault-pareto">
                        <ComposedChart
                            width={1000}
                            height={500}
                            data={this.state.ParetoFaultData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" interval={0} />
                            <YAxis yAxisId="left" label={{ value: "จำนวนครั้ง / Frequency (Times)", angle: -90, position: "insideLeft", dy: 140 }} />
                            <YAxis yAxisId="right" label={{ value: "อัตราส่วน / Percent (%)", angle: -90, position: "right", dy: 100 }} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} orientation="right" unit="%" />
                            <Tooltip cursor={false} content={<this.customFaultParetoTooltips />} />
                            <Bar yAxisId="left" dataKey="times" barSize={100} fill="#F51A1A" label={{ fill: 'black', fontSize: "20px", position: 'insideTop', dy: 10 }} />
                            <Line yAxisId="right" type="monotone" dataKey="percentStacked" stroke="#000000" strokeWidth={3} unit="%" />
                        </ComposedChart>
                    </div>
                </div>
                }

                {/*Quality Traceability block*/}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 3) && <div className="fault-chart">
                    <h1 className="title-mc-time-ele">ตารางตรวจสอบย้อนกลับคุณภาพ / Quality Traceability Table</h1>
                    <div className="table-search">
                        <InputGroup>
                            <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} toggle={this.toggleSplitButton}>
                                <Button outline>{this.state.SearchBy === "" ? "Search by ..." : this.state.SearchBy}</Button>
                                <DropdownToggle split outline />
                                <DropdownMenu className="qtrace-drop-menu"
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
                                    <DropdownItem onClick={this.setSearchByNone} key={-1}>None</DropdownItem>
                                    {Object.keys(this.state.ResultList).map((key, ind) => (
                                        <DropdownItem onClick={this.setSearchBy} key={ind}>{this.state.ResultList[key]}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Input placeholder="search text" id="txt-search" autoComplete="off" />
                            <InputGroupAddon addonType="append"><Button color="primary" onClick={this.SearchByButton}>Search</Button></InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="select-column">
                        <div className="select-btn">
                            <Button className="btn-show-col" color="primary" onClick={() => this.ButtonShowColAll(true)} active={this.state.selectAll}>Select all</Button>
                            <Button className="btn-show-col" color="primary" onClick={() => this.ButtonShowColAll(false)} active={this.state.deselectAll}>Deselect all</Button>
                            {this.state.columnLists.map((list, ind) => {
                                return (
                                    <Button className="btn-show-col" color="primary" key={ind} onClick={() => this.ButtonShowCol(ind)} active={this.state.columnShow[ind]}>{list}</Button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="table-page">
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
                    <div className="trace-table">
                        <Table striped hover responsive bordered>
                            <thead>
                                <tr>
                                    <th className="trace-col-1">Work index</th>
                                    {Object.keys(this.state.ResultList).map((key, ind) => {
                                        if (this.state.columnShow[ind]) {
                                            return (
                                                <th key={ind} className="trace-col">{this.state.ResultList[key]}</th>
                                            )
                                        } else {
                                            return null
                                        }
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(this.state.ResultData).map((key, ind) => {
                                    if (ind === 0) {
                                        cntResults = 0
                                    }
                                    var checkres = this.state.ResultData[key].split(";")[searchItemIndex]
                                    if ((this.state.UseSearch && checkres.includes(this.state.searchText)) || (!this.state.UseSearch)) {
                                        //console.log(this.state.ResultTypeList)
                                        cntResults++
                                        if (cntResults <= perPage * this.state.pageActive && cntResults > perPage * (this.state.pageActive - 1)) {
                                            return (
                                                <tr key={ind}>
                                                    <th scope="row">{key}</th>
                                                    {Object.keys(this.state.ResultList).map((key1, i) => {
                                                        if (this.state.columnShow[i]) {
                                                            var res = this.state.ResultData[key].split(";")[i]
                                                            //console.log(this.state.ResultTypeList[key1])
                                                            if (this.state.ResultTypeList[key1] === "ON Detection") {
                                                                //console.log("ok")
                                                                if (res === "1") {
                                                                    return <td key={i} className="ok-cell">{"ON"}</td>
                                                                } else {
                                                                    return <td key={i} className="ng-cell">{"OFF"}</td>
                                                                }
                                                            } else if (this.state.ResultTypeList[key1] === "OFF Detection") {
                                                                //console.log("ng")
                                                                if (res === "0") {
                                                                    return <td key={i} className="ok-cell">{"OFF"}</td>
                                                                } else {
                                                                    return <td key={i} className="ng-cell">{"ON"}</td>
                                                                }
                                                            } else {
                                                                //console.log("else")
                                                                var upper = parseFloat(this.state.ResultLimitUpper[key1])
                                                                var lower = parseFloat(this.state.ResultLimitLower[key1])
                                                                //console.log(`${upper}/${lower}`)
                                                                if (isNaN(upper)) {
                                                                    upper = ""
                                                                }
                                                                if (isNaN(lower)) {
                                                                    lower = ""
                                                                }
                                                                if (upper === "" && lower === "") {
                                                                    return <td key={i}>{res}</td>
                                                                } else if (upper === "" && lower !== "") { //min
                                                                    if (res >= lower) {
                                                                        return <td key={i} className="ok-cell">{res}</td>
                                                                    } else {
                                                                        return <td key={i} className="ng-cell">{res}</td>
                                                                    }
                                                                } else if (upper !== "" && lower === "") { //max
                                                                    if (res <= upper) {
                                                                        return <td key={i} className="ok-cell">{res}</td>
                                                                    } else {
                                                                        return <td key={i} className="ng-cell">{res}</td>
                                                                    }
                                                                } else {
                                                                    if (res >= lower && res <= upper) { //range
                                                                        return <td key={i} className="ok-cell">{res}</td>
                                                                    } else {
                                                                        return <td key={i} className="ng-cell">{res}</td>
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            return null
                                                        }
                                                    })}
                                                </tr>
                                            )
                                        } else {
                                            return null
                                        }
                                    } else {
                                        return null
                                    }
                                })}
                            </tbody>
                        </Table>
                    </div>
                </div>
                }
            </>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null,mapDispatchToProps)(OperRatioChart)