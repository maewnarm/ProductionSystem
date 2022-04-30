import React from 'react';
import axios from 'axios';
import './scss/Homepage.scss';
//import imgsrc from '../WSfiles/TG028200-9740WS.jpg'
import moment from 'moment';
import { Table, ButtonGroup, Button, Row, Modal, ModalBody } from 'reactstrap'
import { PacmanLoader } from "react-spinners";
import { css } from "@emotion/core";
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
var today = ""
var time = ""
var prodDate = ""
var worklists = []
var isLoad = true
var Total = 0

var naturalSort = function (a, b) {
    return ('' + b.model).localeCompare(('' + a.model), 'en', { numeric: true });
}

const override = css`
    border-color: red;
`;

class Home extends React.Component {

    constructor(props) {
        super();
        curSection = localStorage.getItem('username')
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    state = {
        WorkCounter: [],
        ShiftIndex: 0,
        isLoad: false,
        SetFinish: false,
        modelLists: [],
        oldmodelLists: [],
    }

    getWorkcounter = async () => {
        today = moment().format("YYYY-MM-DD")
        time = moment().format("HH:mm:ss")
        const prevday = moment().subtract(1, 'days').format("YYYY-MM-DD")
        const nextday = moment().add(1, 'days').format("YYYY-MM-DD")
        var urlget
        var urlgetcount
        var urlgetcountday
        //console.log(moment().valueOf())
        //console.log(moment(`${today} 07:30:00`, "YYYY-MM-DD HH:mm:ss").valueOf())
        const shift = this.state.ShiftIndex
        if (shift === 0) { //all
            if (moment().valueOf() >= moment(`${today} 07:30:00`, "YYYY-MM-DD HH:mm:ss").valueOf()) { //day time
                urlget = `/workdistinct?q=allday_ST6_${today}_${nextday}_07:30:00`
                urlgetcount = `/workcount?q=allday_ST6_${today}_${nextday}_07:30:00`
                //console.log("shift=0,day time")
            } else { //night time
                urlget = `/workdistinct?q=allnight_ST6_${prevday}_${today}_07:30:00`
                urlgetcount = `/workcount?q=allnight_ST6_${prevday}_${today}_07:30:00`
                //console.log("shift=0,night time")
            }
        } else if (shift === 1) { //day only
            if (moment().valueOf() >= moment(`${today} 07:30:00`, "YYYY-MM-DD HH:mm:ss").valueOf()) { //day time
                urlget = `/workdistinct?q=day_ST6_${today}_07:30:00_19:20:00`
                urlgetcount = `/workcount?q=day_ST6_${today}_07:30:00_19:20:00`
                //console.log("shift=1,day time")
            } else { //night time
                urlget = `/workdistinct?q=day_ST6_${prevday}_07:30:00_19:20:00`
                urlgetcount = `/workcount?q=day_ST6_${prevday}07:30:00_19:20:00`
                //console.log("shift=1,night time")
            }
        } else if (shift === 2) { //night only
            if (moment().valueOf() >= moment(`${today} 07:30:00`, "YYYY-MM-DD HH:mm:ss").valueOf()) { //day time
                urlget = `/workdistinct?q=night_ST6_${today}_${nextday}_19:20:00_07:30:00`
                urlgetcount = `/workcount?q=night_ST6_${today}_${nextday}_19:20:00_07:30:00`
                urlgetcountday = `/workcount?q=day_ST6_${today}_07:30:00_19:20:00`
                //console.log("shift=2,day time")
            } else { //night time
                urlget = `/workdistinct?q=night_ST6_${prevday}_${today}_19:20:00_07:30:00`
                urlgetcount = `/workcount?q=night_ST6_${prevday}_${today}_19:20:00_07:30:00`
                urlgetcountday = `/workcount?q=day_ST6_${prevday}_07:30:00_19:20:00`
                //console.log("shift=2,night time")
            }
        } else {
            alert("shift condition is error")
            clearInterval(this.interval)
        }
        if (moment().valueOf() >= moment(`${today} 07:30:00`, "YYYY-MM-DD HH:mm:ss").valueOf()) { //day time
            prodDate = today
        } else { //night time
            prodDate = prevday
        }
        //console.log(urlget)
        //console.log(urlgetcount)
        //console.log(prevday)
        if (urlget === null) {
            alert("urlget is empty")
            clearInterval(this.interval);
        }
        await api.get(`${urlget}_${curSection}`)
            .then(lists => {
                //console.log(lists.data)
                if (lists.data.length === 0) {
                    this.setState({
                        WorkCounter: [],
                    })
                }
                this.setState({
                    modelLists: lists
                }, () => {
                    lists.data.forEach((list, ind) => {
                        //console.log(list[0])
                        api.get(`${urlgetcount}_${list[0]}_${curSection}`)
                            .then(cntlists => {
                                //console.log(cntlists.data)
                                //console.log(lists.data.length)
                                //console.log(worklists.length)
                                //console.log(worklists)
                                //console.log(list[0])
                                if (lists.data.length !== worklists.length || lists.data.length < worklists.length) {
                                    if (worklists.length === 0 || lists.data.length < worklists.length) {
                                        //console.log("set worklists")
                                        worklists = []
                                    }
                                    var found = false
                                    worklists.forEach((wlist) => {
                                        if (wlist["model"] === list[0]) {
                                            wlist["amount"] = cntlists.data["work_counter__max"]
                                            found = true
                                        }
                                    })
                                    if (!found) {
                                        worklists = [...worklists, { model: list[0], amount: cntlists.data["work_counter__max"] }]
                                    }
                                } else {
                                    //console.log(worklists)
                                    worklists.sort(naturalSort)
                                    //console.log(worklists)
                                    if (shift === 2) {
                                        api.get(`${urlgetcountday}_${list[0]}_${curSection}`)
                                            .then(cntdaylists => {
                                                worklists.forEach((worklist) => {
                                                    if (worklist["model"] === list[0]) {
                                                        worklist["amount"] = cntlists.data["work_counter__max"] - cntdaylists.data["work_counter__max"]
                                                        //console.log("set count night")
                                                    }
                                                })
                                                if (ind === lists.data.length - 1) {
                                                    //console.log(worklists)
                                                    this.setState({
                                                        WorkCounter: worklists,
                                                    }, () => {
                                                        Total = 0
                                                        worklists.forEach(list => {
                                                            Total += list["amount"]
                                                        })
                                                        this.setState({
                                                            SetFinish: true
                                                        })
                                                    })
                                                }
                                            })
                                    } else {
                                        worklists.forEach((worklist) => {
                                            if (worklist["model"] === list[0]) {
                                                worklist["amount"] = cntlists.data["work_counter__max"]
                                            }
                                        })
                                        if (ind === lists.data.length - 1) {
                                            //console.log(worklists)
                                            this.setState({
                                                WorkCounter: worklists,
                                            }, () => {
                                                Total = 0
                                                worklists.forEach(list => {
                                                    Total += list["amount"]
                                                })
                                                this.setState({
                                                    SetFinish: true
                                                })
                                            })
                                        }
                                    }
                                }
                                //console.log(ind + "/" + lists.data.length)
                                /*if (ind === lists.data.length - 1) {
                                    //console.log(worklists)
                                    this.setState({
                                        WorkCounter: worklists,
                                        isLoad: false
                                    })
                                }*/
                            })
                            .catch(error => {
                                alert(error)
                                clearInterval(this.interval)
                            })
                    })
                })
            })
            .catch(error => {
                alert(error)
                clearInterval(this.interval)
            })
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.getWorkcounter()
                .then(() => {
                    /*if (this.state.SetFinish) {
                        this.setState({
                            SetFinish: false
                        }, () => {
                            isLoad = false
                        })
                    }*/
                    isLoad = false
                })
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        isLoad = false
    }

    ButtonSelectShift = (shift) => {
        clearInterval(this.interval)
        isLoad = true
        worklists = []
        this.setState({
            ShiftIndex: shift,
        }, () => {
            this.interval = setInterval(() => {
                this.getWorkcounter()
                    .then(() => {
                        if (this.state.SetFinish) {
                            this.setState({
                                SetFinish: false
                            }, () => {
                                isLoad = false
                            })
                        }
                    })
            }, 1000)
        })
    }

    render() {
        //console.log(localStorage.getItem('username'))
        return (
            <div className="table-work-counter">
                <p className="p-home">{`Current time : ${today} ${time}`}</p>
                <p className="p-home">{`Production date : ${prodDate}`}</p>
                <Row className="row-btn">
                    <p className="text-shift">{`Shift : `}</p>
                    <ButtonGroup className="btn-type-home">
                        <Button className="btn-shift-home" onClick={() => this.ButtonSelectShift(0)} active={this.state.ShiftIndex === 0}>All</Button>
                        <Button className="btn-shift-home" onClick={() => this.ButtonSelectShift(1)} active={this.state.ShiftIndex === 1}>Day</Button>
                        <Button className="btn-shift-home" onClick={() => this.ButtonSelectShift(2)} active={this.state.ShiftIndex === 2}>Night</Button>
                    </ButtonGroup>
                </Row>
                {/*isLoad && <p className="text-load">Loading ...</p>*/}
                <div className="progress-spinner">
                    <Modal className="modal-spinner" isOpen={isLoad} centered>
                        <ModalBody>
                            <h5>Loading data ...</h5>
                            <PacmanLoader className="pacman" css={override} color={"#DC0032"} />
                        </ModalBody>
                    </Modal>
                </div>
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th id="counter-col1">Part no.</th>
                            <th id="counter-col2">Amount (pcs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.WorkCounter.map((item, ind) => {
                            return (<tr className="tr-home" key={ind}>
                                <td className="td-home-1">{item.model}</td>
                                <td className="td-home-2">{item.amount}</td>
                            </tr>)
                        })}
                    </tbody>
                </Table>
                <Table>
                    <thead>
                        <tr>
                            <th id="total-col1">Total</th>
                            <th id="total-col2">{Total}</th>
                        </tr>
                    </thead>
                </Table>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null,mapDispatchToProps)(Home);