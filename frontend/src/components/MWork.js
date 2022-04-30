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
    lossmt: 0,
    lossht: 0,
    breakeron: 0,
    masteron: 0,
    autorunon: 0,
    normalcycle: 0,
    handtime: 0,
    noworking: 0,
    abnormal: 0,
    warning: 0,
}]
var PerOEEall = [{
    Perlossmt: 0,
    Perlossht: 0,
    Perbreakeron: 0,
    Permasteron: 0,
    Perautorunon: 0,
    Pernormalcycle: 0,
    Perhandtime: 0,
    Pernoworking: 0,
    Perabnormal: 0,
    Perwarning: 0,
}]
var OEE = [{
    lossmt: 0,
    lossht: 0,
    breakeron: 0,
    masteron: 0,
    autorunon: 0,
    normalcycle: 0,
    handtime: 0,
    noworking: 0,
    abnormal: 0,
    warning: 0,
}]
var PerOEE = [{
    Perlossmt: 0,
    Perlossht: 0,
    Perbreakeron: 0,
    Permasteron: 0,
    Perautorunon: 0,
    Pernormalcycle: 0,
    Perhandtime: 0,
    Pernoworking: 0,
    Perabnormal: 0,
    Perwarning: 0,
}]
var sumOEEall = 0
var sumOEE = 0
var arrFault = []
var arrFaultCounter = []
var searchItemIndex = null
var LossHT = 0
var LossMT = 0

var naturalSort = function (a, b) {
    return ('' + a).localeCompare(('' + b), 'en', { numeric: true });
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
            return null
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

    getListeachStation = () => {
        arrBar = []
        indexold = 0
        sumindex = 0
        allIndex = 0
        SetgIndex = 0
        arrFault = []
        this.setState({
            gData: [],
            FaultList: []
        }, () => {
            //console.log(this.state.StSelected.length)
            StSelectedLength = this.state.StSelected.length
            this.state.StSelected.forEach((st, ind1) => {
                //console.log("map:" + st + ":" + ind1);
                this.getList(st, ind1);
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
        var NGdetail = ""
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
        await api.get(`/resultlist/st/${curSection}_${st}`)
            .then(results => {
                results.data.forEach((item, ind) => {
                    arrResult = { ...arrResult, [item.machine_index + "-" + item.result_index]: item.result_name }
                    arrResultType = { ...arrResultType, [item.machine_index + "-" + item.result_index]: item.result_type }
                })
                //console.log(arrResult)
                //console.log(arrResultType)
                this.setState({
                    ResultList: arrResult,
                    ResultTypeList: arrResultType,
                })
            })
            .catch(error => alert(error))

        //get faultlist
        await api.get(`/faultlist/st/${curSection}_${st}`)
            .then(results => {
                results.data.forEach((item, ind) => {
                    arrFault = { ...arrFault, [item.machine_index + "-" + item.ng_code]: item.detail_mem }
                    arrFaultCounter = { ...arrFaultCounter, [item.machine_index + "-" + item.ng_code]: 0 }
                })
                this.setState({
                    FaultList: arrFault,
                })
            })
            .catch(error => alert(error))

        //console.log("st not null")
        if (this.state.DayNight === 0) { //day
            apiURL = `/operationratioDay?q1=${moment(this.state.Datepicked).format("YYYY-MM-DD")}_07:30:00_19:20:00_${st}`
            oldtime = moment(this.state.Datepicked).format("DD/MM/YYYY") + " 07:30:00"
        } else {
            apiURL = `/operationratioNight?q1=${moment(this.state.Datepicked).format("YYYY-MM-DD")}_19:30:00_23:59:59_${moment(this.state.Datepicked, "YYYY-MM-DD").add({ days: 1 }).format("YYYY-MM-DD")}_00:00:00_07:20:00_${st}`
            oldtime = moment(this.state.Datepicked).format("DD/MM/YYYY") + " 19:30:00"
        }
        console.log(apiURL)
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
                        console.log("datalength is 0")
                        this.modalLoadtoggle(false)
                        this.SetgData();
                    }
                    this.state.data.forEach(item => {
                        //const percent = Math.floor((dataindex + 1) / dataLength * 100)
                        //this.setState({ progress: percent })
                        //console.log(this.state.progress+`${this.state.isLoading}`)
                        //dif = moment(moment(this.state.Datepicked).format("DD/MM/YYYY") + " " + item.time_mem, "DD/MM/YYYY HH:mm:ss").diff(moment(oldtime, "DD/MM/YYYY HH:mm:ss"))
                        dif = moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").diff(moment(oldtime, "YYYY-MM-DD HH:mm:ss.S"))
                        durat = moment.duration(dif).valueOf()
                        //oldtime = moment(this.state.Datepicked).format("DD/MM/YYYY") + " " + item.time_mem
                        oldtime = item.date_mem + " " + item.time_mem
                        //fdif=moment.duration.format("HH:mm:ss"),
                        sumindex = dataindex + indexold;
                        NGdetail = this.state.FaultList[item.machine_no + "-" + item.ng_code]
                        if (NGdetail === undefined) {
                            NGdetail = ""
                        } else {
                            //console.log(item.ng_code)
                            arrFaultCounter = { ...arrFaultCounter, [item.machine_no + "-" + item.ng_code]: arrFaultCounter[item.machine_no + "-" + item.ng_code] + 1 }
                            //console.log(arrFaultCounter)
                            /*this.setState({
                                FaultCounter: { ...this.state.FaultCounter, [item.machine_no + "-" + item.ng_code]: this.state.FaultCounter[item.machine_no + "-" + item.ng_code] + 1 }
                            }, () => console.log(this.state.FaultCounter))*/
                        }
                        if (dataindex === 0) {
                            newpair = {
                                ...newpair,
                                ["time" + sumindex]: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(),
                                ["type" + sumindex]: item.type_mem, ["detail" + sumindex]: NGdetail, ["stno" + sumindex]: item.machine_no
                            }
                            /*this.setState({
                                filterData: [...this.state.filterData, {
                                    name: "A",
                                    ind: dataindex,
                                    ["time"+dataindex]: moment(item.time_mem,"HH:mm:ss").valueOf(),
                                    type: item.type_mem,
                                }]
                            })*/
                        }
                        else {
                            newpair = {
                                ...newpair,
                                ["time" + sumindex]: durat, ["type" + sumindex]: item.type_mem,
                                ["detail" + sumindex]: NGdetail, ["stno" + sumindex]: item.machine_no
                            }
                            /*this.setState({
                                filterData: [...this.state.filterData, {
                                    name: "A",
                                    ind: dataindex,
                                    ["time"+dataindex]: durat,
                                    type: item.type_mem,
                                }]
                            })*/
                        }

                        //set result data
                        if (item.type_mem === 5 || item.type_mem === 6) {
                            resultpair = { ...resultpair, [item.machine_no + "_" + item.date_mem + "_" + item.time_mem + "_" + dataindex]: item.result_data }
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
            Object.keys(OEEall[0]).forEach(key => {
                //console.log(key)
                OEEall[0][key] = 0
            })
            Object.keys(OEE[0]).forEach(key => {
                //console.log(key)
                OEE[0][key] = 0
            })
            this.state.data.forEach((item, ind) => {
                //console.log(ind)
                //console.log(Math.floor((ind + 1) / dataLength * 100) + "%")
                //console.log("setgindex:"+SetgIndex)
                var getData = this.state.gData[SetgIndex]
                //console.log(getData["time" + ind])
                //console.log(getData)
                var timeValue = getData["time" + allIndex]
                var iniTime
                var NGdetail = this.state.FaultList[item.machine_no + "-" + item.ng_code]
                if (NGdetail === undefined) {
                    NGdetail = ""
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
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 2) {
                    arrBar.push(<Bar name="Master on" dataKey={"time" + allIndex} stackId="a" fill="#A1E076" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t2"]} />)
                    //console.log("time"+allIndex+"/color:on")
                    allIndex++
                    OEEall[0].masteron = OEEall[0].masteron + timeValue
                    if (ind !== 0) {
                        OEE[0].masteron = OEE[0].masteron + timeValue
                    }
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 3) {
                    arrBar.push(<Bar name="Auto run on" dataKey={"time" + allIndex} stackId="a" fill="#1CE105" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t2"]} />)
                    //console.log("time"+allIndex+"/color:on")
                    allIndex++
                    OEEall[0].masteron = OEEall[0].autorunon + timeValue
                    if (ind !== 0) {
                        OEE[0].masteron = OEE[0].autorunon + timeValue
                    }
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 4 && timeValue > (StdHandTime * 1000)) {
                    arrBar.push(<Bar name="No working" dataKey={"time" + allIndex} stackId="a" fill="#FFD853" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t42"]} />)
                    //console.log("time"+allIndex+"/color:no work")
                    allIndex++
                    OEEall[0].noworking = OEEall[0].noworking + timeValue
                    if (ind !== 0) {
                        OEE[0].noworking = OEE[0].noworking + timeValue
                    }
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 4 && timeValue <= (StdHandTime * 1000)) {
                    arrBar.push(<Bar name="H/T" dataKey={"time" + allIndex} stackId="a" fill="#0054DE" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t41"]} />)
                    //console.log("time"+allIndex+"/color:H/T")
                    allIndex++
                    OEEall[0].handtime = OEEall[0].handtime + timeValue
                    if (ind !== 0) {
                        OEE[0].handtime = OEE[0].handtime + timeValue
                    }
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 5) {
                    arrBar.push(<Bar name="Normal cycle" dataKey={"time" + allIndex} stackId="a" fill="#3CB8FF" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t5"]} />)
                    //console.log("time"+allIndex+"/color:Normal")
                    allIndex++
                    OEEall[0].normalcycle = OEEall[0].normalcycle + timeValue
                    if (ind !== 0) {
                        OEE[0].normalcycle = OEE[0].normalcycle + timeValue
                    }
                    if (timeValue > StdMCTime * 1000) {
                        LossMT += (timeValue - (StdMCTime * 1000))
                    }
                    //console.log(LossMT + "=" + LossMT + "+(" + timeValue + "-" + StdMCTime * 1000 + ")")
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 6) {
                    arrBar.push(<Bar name="Abnormal cycle" dataKey={"time" + allIndex} stackId="a" fill="#FF5630" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t6"]} />)
                    //console.log("time"+allIndex+"/color:ab")
                    allIndex++
                    OEEall[0].abnormal = OEEall[0].abnormal + timeValue
                    if (ind !== 0) {
                        OEE[0].abnormal = OEE[0].abnormal + timeValue
                    }
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else if (item.type_mem === 7) {
                    arrBar.push(<Bar name="Warning occur cycle" dataKey={"time" + allIndex} stackId="a" fill="#FF8E75" key={allIndex} onMouseOver={() => this.setTooltip(ind)} opacity={this.state.BarOpacity["t6"]} />)
                    //console.log("time"+allIndex+"/color:ab")
                    allIndex++
                    OEEall[0].abnormal = OEEall[0].warning + timeValue
                    if (ind !== 0) {
                        OEE[0].abnormal = OEE[0].warning + timeValue
                    }
                    scatterpair.push({ x: moment(item.date_mem + " " + item.time_mem, "YYYY-MM-DD HH:mm:ss.S").valueOf(), y: item.type_mem, detail: NGdetail })
                } else {
                    console.log("not match")
                }
                sumOEEall += timeValue
                if (ind !== 0) {
                    sumOEE += timeValue
                }
                //console.log("+")
            })
            console.log(LossMT)
            //set Pareto Fault Chart
            var arrPareto = []
            var arrPareto2 = []
            var sumFaultCounter = 0
            var percent = 0
            var sumpercent = 0
            Object.keys(this.state.FaultList).forEach(key => {
                //arrPareto = { ...arrPareto, [this.state.FaultList[key]]: this.state.FaultCounter[key] }
                arrPareto.push({ name: this.state.FaultList[key], times: this.state.FaultCounter[key] })
                sumFaultCounter += this.state.FaultCounter[key]
            })
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
            this.setState({
                ParetoFaultData: arrPareto
            }, () => {
                //this.state.ParetoFaultData.sort((a, b) => (a.value < b.value) ? 1 : -1)
                //console.log(this.state.ParetoFaultData)
            })

            SetgIndex++
            //console.log(arrBar)
            //console.log(sumOEE)
            //console.log(scatterpair)
            OEEall[0].normalcycle = OEEall[0].normalcycle - LossMT
            OEEall[0].handtime = OEEall[0].handtime - LossHT
            OEEall[0].lossmt = LossMT
            OEEall[0].lossht = LossHT
            //OEEall[0].autorunon = 1000000

            OEE[0].normalcycle = OEE[0].normalcycle - LossMT
            OEE[0].handtime = OEE[0].handtime - LossHT
            OEE[0].lossmt = LossMT
            OEE[0].lossht = LossHT

            PerOEEall[0].Perlossmt = Number.parseFloat(OEEall[0].lossmt / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perlossht = Number.parseFloat(OEEall[0].lossht / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perbreakeron = Number.parseFloat(OEEall[0].breakeron / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Permasteron = Number.parseFloat(OEEall[0].masteron / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perautorunon = Number.parseFloat(OEEall[0].autorunon / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Pernormalcycle = Number.parseFloat(OEEall[0].normalcycle / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perhandtime = Number.parseFloat(OEEall[0].handtime / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Pernoworking = Number.parseFloat(OEEall[0].noworking / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perabnormal = Number.parseFloat(OEEall[0].abnormal / sumOEEall * 100).toFixed(2)
            PerOEEall[0].Perwarning = Number.parseFloat(OEEall[0].warning / sumOEEall * 100).toFixed(2)

            PerOEE[0].Perlossmt = Number.parseFloat(OEE[0].lossmt / sumOEE * 100).toFixed(2)
            PerOEE[0].Perlossht = Number.parseFloat(OEE[0].lossht / sumOEE * 100).toFixed(2)
            PerOEE[0].Perbreakeron = Number.parseFloat(OEE[0].breakeron / sumOEE * 100).toFixed(2)
            PerOEE[0].Permasteron = Number.parseFloat(OEE[0].masteron / sumOEE * 100).toFixed(2)
            PerOEE[0].Perautorunon = Number.parseFloat(OEE[0].autorunon / sumOEE * 100).toFixed(2)
            PerOEE[0].Pernormalcycle = Number.parseFloat(OEE[0].normalcycle / sumOEE * 100).toFixed(2)
            PerOEE[0].Perhandtime = Number.parseFloat(OEE[0].handtime / sumOEE * 100).toFixed(2)
            PerOEE[0].Pernoworking = Number.parseFloat(OEE[0].noworking / sumOEE * 100).toFixed(2)
            PerOEE[0].Perabnormal = Number.parseFloat(OEE[0].abnormal / sumOEE * 100).toFixed(2)
            PerOEE[0].Perwarning = Number.parseFloat(OEE[0].warning / sumOEE * 100).toFixed(2)
            //console.log("per" + PerOEEall[0]["Perbreakeron"])
            this.setState({
                Bardata: arrBar,
                //isLoading: false,
                stOEEall: OEEall,
                stOEE: OEE,
                ScatterData: scatterpair,
            }, () => {
                this.includeClick(this.state.included);
                this.renderPerOEEBar();
                setTimeout(() => {
                    this.state.gData.sort((a, b) => (a.name > b.name) ? 1 : -1)
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

    RetBarData = () => {
        //console.log("ret bar data")
        //console.log(this.state.Bardata)
        return (
            <p>ret</p>
        );
    }

    renderLegend = () => {
        return (
            [
                { value: "M/T Loss", type: 'square', color: "#CB7FFF" },
                { value: "H/T Loss", type: 'square', color: "#FFA3F9" },
                { value: "Machine off", type: 'square', color: "#545653" },
                { value: "Breaker on", type: 'square', color: "#A4B499" },
                { value: "Master on", type: 'square', color: "#A1E076" },
                { value: "Auto run on", type: 'square', color: "#1CE105" },
                { value: "Normal cycle", type: 'square', color: "#3CB8FF" },
                { value: "H/T", type: 'square', color: "#0054DE" },
                { value: "No working", type: 'square', color: "#FFD853" },
                { value: "Abnormal cycle", type: 'square', color: "#FF5630" },
                { value: "Warning occur cycle", type: 'square', color: "#FF8E75" },
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
        //console.log("detailitem:"+this.state.detailItem)
        var temp = payload[ChartIndex].dataKey
        //console.log(payload[this.state.chartItem].payload["detail"+temp.substring(4)])
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
                <p className="tooltip-head">{payload[ChartIndex].name}</p>
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
        this.modalLoadtoggle(true);
        this.setState({
            Datepicked: date,
            Slidervalue: [
                moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").valueOf(),
                moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf()
            ],
            minGraph: moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").valueOf(),
            maxGraph: moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).valueOf(),
            gapTick: Math.ceil((moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S").add({ hours: 11, minutes: 50 }).diff(moment(moment(date).format("DD/MM/YYYY") + " " + this.state.TimeShift, "DD/MM/YYYY HH:mm:ss.S"))) / 9),
        }, () => {
            this.setState({ updateList: true });
            this.getListeachStation();
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
        })
        this.setState({ updateList: true }, () => {
            if (this.state.StSelected.length !== 0) {
                this.modalLoadtoggle(true)
            }
            this.getListeachStation()
        })
        //console.log(moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss").valueOf() + "+" + moment(moment(date).format("DD/MM/YYYY") + " " + time1, "DD/MM/YYYY HH:mm:ss").add({ hours: 11, minutes: 50 }).valueOf())
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

    includeClick = (flag) => {
        this.setState({
            included: flag
        }, () => {
            if (flag) {
                this.setState({
                    stOEEshow: this.state.stOEEall,
                    perOEEshow: PerOEEall,
                })
            } else {
                this.setState({
                    stOEEshow: this.state.stOEE,
                    perOEEshow: PerOEE,
                })
            }
            //console.log(this.state.perOEEshow)
            //console.log(PerOEEall)
        })
    }

    renderPerOEEBar = () => {
        var arrPerOEEBar = [
            <Bar dataKey="Pernormalcycle" stackId="a" fill="#3CB8FF" stroke="lightgreen" strokeWidth={2} key={1} onMouseOver={() => this.setTooltip(0)} />,
            <Bar dataKey="Perhandtime" stackId="a" fill="#0054DE" stroke="lightgreen" strokeWidth={2} key={2} onMouseOver={() => this.setTooltip(1)} />,
            <Bar dataKey="Pernoworking" stackId="a" fill="#FFD853" stroke="crimson" strokeWidth={2} key={3} onMouseOver={() => this.setTooltip(2)} />,
            <Bar dataKey="Perabnormal" stackId="a" fill="#FF5630" stroke="crimson" strokeWidth={2} key={4} onMouseOver={() => this.setTooltip(3)} />,
            <Bar dataKey="Perwarning" stackId="a" fill="#FF8E75" stroke="crimson" strokeWidth={2} key={5} onMouseOver={() => this.setTooltip(4)} />,
            <Bar dataKey="Perautorunon" stackId="a" fill="#1CE105" stroke="crimson" strokeWidth={2} key={6} onMouseOver={() => this.setTooltip(5)} />,
            <Bar dataKey="Permasteron" stackId="a" fill="#A1E076" stroke="crimson" strokeWidth={2} key={7} onMouseOver={() => this.setTooltip(6)} />,
            <Bar dataKey="Perbreakeron" stackId="a" fill="#A4B499" stroke="crimson" strokeWidth={2} key={8} onMouseOver={() => this.setTooltip(7)} />,
            <Bar dataKey="Perlossht" stackId="a" fill="#FFA3F9" stroke="crimson" strokeWidth={2} key={9} onMouseOver={() => this.setTooltip(8)} />,
            <Bar dataKey="Perlossmt" stackId="a" fill="#CB7FFF" stroke="crimson" strokeWidth={2} key={10} onMouseOver={() => this.setTooltip(9)} />,
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
            case 'Perbreakeron':
                keyOEE = "breakeron"
                textOEE = "Breaker on"
                break
            case 'Permasteron':
                keyOEE = "masteron"
                textOEE = "Master on"
                break
            case 'Perautorunon':
                keyOEE = "autorunon"
                textOEE = "Auto run on"
                break
            case 'Pernormalcycle':
                keyOEE = "normalcycle"
                textOEE = "Normal Cycle"
                break
            case 'Perhandtime':
                keyOEE = "handtime"
                textOEE = "H/T (Hand time)"
                break
            case 'Pernoworking':
                keyOEE = "noworking"
                textOEE = "No working"
                break
            case 'Perabnormal':
                keyOEE = "abnormal"
                textOEE = "Abnormal cycle"
                break
            case 'Perwarning':
                keyOEE = "warning"
                textOEE = "Warning occur cycle"
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
        } else if (item.value === "No working") {
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
            } else if (n === "No working") {
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
        if (!active || payload == null || payload[ChartIndex] === null || payload.length === 0) {
            return null;
        }
        if (payload[ChartIndex] === undefined) {
            return null;
        }
        //console.log(payload)
        var textFault = payload[0].payload["name"]
        var times = payload[0].payload["times"]
        var percent = payload[0].payload["percent"]
        return (
            <div className="custom-tooltip">
                <p className="tooltip-head">{textFault}</p>
                <p className="tooltip-time">{"Amount : " + times + " times"}</p>
                <p className="tooltip-detail">{"Ratio : " + percent + "%"}</p>
            </div>
        );
    }

    ButtonSelectType = (sel) => {
        this.setState({ ChartShowType: sel })
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

    render() {
        //const { isLoading } = this.state
        return (
            <>
                {/**Button Head block */}
                <div className="title">
                    <h1 className="title-head">Work input (Manual)</h1>
                    <ButtonGroup className="btn-type">
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(0)} active={this.state.ChartShowType === 0}>Time Chart</Button>
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(1)} active={this.state.ChartShowType === 1}>Time Elements</Button>
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(2)} active={this.state.ChartShowType === 2}>Fault Chart</Button>
                        <Button className="btn-type-sel" onClick={() => this.ButtonSelectType(3)} active={this.state.ChartShowType === 3}>Quality Traceability</Button>
                    </ButtonGroup>
                </div>
                <Col>
                    <this.StationCheckBox />
                </Col>
                <Col>
                    <div className="d-flex justify-content-center">
                        <ButtonGroup>
                            <Button className="btn-day" onClick={() => this.ButtonDayNight(0)} active={this.state.DayNight === 0}>Day</Button>
                            <Button className="btn-night" onClick={() => this.ButtonDayNight(1)} active={this.state.DayNight === 1}>Night</Button>
                        </ButtonGroup>
                        <div id="datetag">Date :</div>
                        <this.DatepickerFn />
                        {this.state.ChartShowType === 0 && <div id="datetag">Data Hightlight :</div>}
                        {this.state.ChartShowType === 0 && <Button className="btn-enable-legend" color="primary" onClick={() => this.ButtonEnableLegend()} active={this.state.EnableLegend}>{this.state.EnableLegend ? "Enable" : "Disable"}</Button>}
                        {(this.state.EnableLegend && this.state.ChartShowType === 0) && <div id="hover-tips">{'(mouse on legend item)'}</div>}
                    </div>
                </Col>
                <div className="progress-spinner">
                    <Modal className="modal-spinner" isOpen={this.state.isLoading} toggle={() => this.modalLoadtoggle(false)} centered>
                        <ModalBody>
                            <h5>Loading data ...</h5>
                            <PacmanLoader className="pacman" css={override} color={"#DC0032"} />
                        </ModalBody>
                    </Modal>
                </div>

                {/**Bar time chart */}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 0) && <h1 className="title-mc-time-ele">Machine Operating Time Chart</h1>
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
                            tickFormatter={(unixTime) => moment(unixTime).format("HH:mm:ss.S")}
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
                            tickFormatter={(unixTime) => moment(unixTime).format("HH:mm:ss.S")}
                            domain={[this.state.minGraph, this.state.maxGraph]}
                            allowDataOverflow
                        />
                        <YAxis
                            type="number"
                            dataKey={'y'}
                            name="Type"
                            interval={0}
                            ticks={[1, 2, 3, 4, 5, 6, 7]}
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
                    <h1 className="title-mc-time-ele">Machine Time elements</h1>
                    <div className="oee-inc-btn">
                        <div className="list-text">
                            include 1st item ? :
                        </div>
                        <Button className="inc-btn" color="primary" onClick={() => this.includeClick(true)} active={this.state.included}>include</Button>
                        <Button className="inc-btn" color="primary" onClick={() => this.includeClick(false)} active={!this.state.included}>not include</Button>
                    </div>
                    <div className="oee-percent-item">
                        <BarChart
                            width={300}
                            height={720}
                            data={this.state.perOEEshow}
                            margin={{ top: 50, right: 10, bottom: 0, left: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis label="Time Chart" tick={false} />
                            <YAxis domain={[0, 100]} ticks={[25, 50, 75, 100]} label={{ value: "Percent (%)", angle: -90, position: "insideLeft" }} unit="%" />
                            <Tooltip cursor={false} content={<this.customOEETooltips />} />
                            <Legend verticalAlign="bottom" align="left" payload={this.renderLegend()} />
                            {this.state.barPerOEE}
                        </BarChart>
                        {/**Time element table */}
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
                                        if (key === "lossmt") {
                                            keytable = "M/T Loss"
                                        } else if (key === "lossht") {
                                            keytable = "H/T Loss"
                                        } else if (key === "breakeron") {
                                            keytable = "Breaker On"
                                        } else if (key === "masteron") {
                                            keytable = "Master On"
                                        } else if (key === "autorunon") {
                                            keytable = "Auto run On"
                                        } else if (key === "normalcycle") {
                                            keytable = "Normal cycle"
                                        } else if (key === "handtime") {
                                            keytable = "H/T (Hand time)"
                                        } else if (key === "noworking") {
                                            keytable = "No working"
                                        } else if (key === "abnormal") {
                                            keytable = "Abnormal cycle"
                                        } else if (key === "warning") {
                                            keytable = "Warning occur cycle"
                                        } else {
                                            keytable = "not match"
                                        }
                                        return (<tr key={ind}>
                                            <td>{keytable}</td>
                                            <td>{moment.duration(item[key]).get('hours')}:{moment.duration(item[key]).get('minutes')}:{moment.duration(item[key]).get('seconds')}</td>
                                            {isNaN(this.state.perOEEshow[0]["Per" + key]) ? <td>0.00%</td> : <td>{this.state.perOEEshow[0]["Per" + key]}%</td>}
                                        </tr>)
                                    })
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
                }

                {/*Fault pareto chart block */}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 2) && <div className="fault-chart">
                    <h1 className="title-mc-time-ele">Fault Pareto Chart</h1>
                    <div className="fault-pareto">
                        <ComposedChart
                            width={1000}
                            height={500}
                            data={this.state.ParetoFaultData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" interval={0} />
                            <YAxis yAxisId="left" label={{ value: "Frequency (Times)", angle: -90, position: "insideLeft" }} />
                            <YAxis yAxisId="right" label={{ value: "Percent (%)", angle: -90, position: "right" }} ticks={[20, 40, 60, 80, 100]} orientation="right" unit="%" />
                            <Tooltip cursor={false} content={<this.customFaultParetoTooltips />} />
                            <Bar yAxisId="left" dataKey="times" barSize={100} fill="#3CB8FF" label={{ fill: 'black', fontSize: 20, position: 'insideTop' }} />
                            <Line yAxisId="right" type="monotone" dataKey="percentStacked" stroke="#ff7300" unit="%" />
                        </ComposedChart>
                    </div>
                </div>
                }

                {/*Quality Traceability block*/}
                {(this.state.gData.length > 0 && this.state.ChartShowType === 3) && <div className="fault-chart">
                    <h1 className="title-mc-time-ele">Quality Traceability Table</h1>
                    <div className="table-search">
                        <InputGroup>
                            <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.splitButtonOpen} toggle={this.toggleSplitButton}>
                                <Button outline>{this.state.SearchBy === "" ? "Search by ..." : this.state.SearchBy}</Button>
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
                                    <DropdownItem onClick={this.setSearchByNone} key={-1}>None</DropdownItem>
                                    {Object.keys(this.state.ResultList).map((key, ind) => (
                                        <DropdownItem onClick={this.setSearchBy} key={ind}>{this.state.ResultList[key]}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Input placeholder="search text" id="txt-search" />
                            <InputGroupAddon addonType="append"><Button color="primary" onClick={this.SearchByButton}>Search</Button></InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="trace-table">
                        <Table striped hover responsive bordered>
                            <thead>
                                <tr>
                                    <th className="trace-col-1">Work index</th>
                                    {Object.keys(this.state.ResultList).map((key, ind) => (
                                        <th key={ind} className="trace-col">{this.state.ResultList[key]}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(this.state.ResultData).forEach((key, ind) => {
                                    var checkres = this.state.ResultData[key].split(";")[searchItemIndex]
                                    if ((this.state.UseSearch && checkres.includes(this.state.searchText)) || (!this.state.UseSearch)) {
                                        return (
                                            <tr key={ind}>
                                                <th scope="row">{key}</th>
                                                {Object.keys(this.state.ResultList).map((key1, i) => {
                                                    var res = this.state.ResultData[key].split(";")[i]

                                                    if (this.state.ResultTypeList[key1] === "OK Detection") {
                                                        if (res === "1") {
                                                            return <td key={i} className="ok-cell">{"OK"}</td>
                                                        } else {
                                                            return <td key={i} className="ng-cell">{"NG"}</td>
                                                        }
                                                    } else if (this.state.ResultTypeList[key1] === "NG Detection") {
                                                        if (res === "0") {
                                                            return <td key={i} className="ok-cell">{"OK"}</td>
                                                        } else {
                                                            return <td key={i} className="ng-cell">{"NG"}</td>
                                                        }
                                                    } else {
                                                        return <td key={i}>{res}</td>
                                                    }
                                                })}
                                            </tr>
                                        )
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