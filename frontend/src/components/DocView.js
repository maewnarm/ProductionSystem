import React, { PureComponent } from 'react';
import './scss/DocView.scss';
import axios from 'axios';
import {
    Table,
    UncontrolledTooltip,
} from 'reactstrap'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'
import QrReader from 'react-qr-scanner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCamera,
    faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';
import Input from 'reactstrap/lib/Input';
import Button from 'reactstrap/lib/Button';

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""

var naturalSort = function (a, b) {
    return ('' + a.doctype).localeCompare(('' + b.doctype), 'en', { numeric: true });
}

class DocumentView extends PureComponent {
    state = {
        result: "",
        docList: [],
        filteredDocList: [],
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    enableScan = () => {
        this.setState({
            result: "",
            qrScanEnable: !this.state.qrScanEnable
        })
    }

    manualSearch = (mcno) => {
        this.setState({
            result: mcno,
            qrScanEnable: false,
            indexView: true,
        }, () => {
            this.getDocLists(mcno)
        })
    }

    qrScan = (data) => {
        console.log(data)
        if (data) {
            this.setState({
                result: data.text,
                qrScanEnable: false,
                indexView: true,
            }, () => {
                this.getDocLists(data.text)
            })
        }
    }

    qrError = (error) => {
        alert("QR scan got some error")
        console.log(error)
    }

    getDocLists = async (mcno) => {
        api.get(`/docview/${mcno}`)
            .then(doclist => {
                this.setState({
                    docList: doclist.data,
                    filteredDocList: doclist.data
                })
            })
            .catch(error => alert(error))
    }

    selectIndex = (index) => {
        var filtered = []
        this.state.docList.forEach(list => {
            if (list.doctype === index) {
                filtered = [...filtered, list]
            }
        })
        this.setState({
            docView: true,
            indexView: false,
            docViewType: index,
            filteredDocList: filtered
        })
    }

    backToIndex = () => {
        this.setState({
            docView: false,
            indexView: true,
            docViewType: null,
            filteredDocList: [],
        })
    }

    openFilePath = (path, file) => {
        console.log(path)
        console.log(file)
        const ind = path.indexOf('process scan')
        var filPath = path.substring(ind + 12, path.length)
        window.open(`${window.location.origin}/PCS${filPath}/${file}`)
    }

    unControlToolTipPack = (targetid, text) => {
        return (
            <UncontrolledTooltip placement="top" target={targetid} hideArrow={true} >
                {text}
            </UncontrolledTooltip>
        )
    }

    /*testopen = () => {
        //const url = document.getElementById('testurl').value
        var path = document.getElementById('testurl').value
        const ind = path.indexOf('process scan')
        path = path.substring(ind + 12, path.length)
        //E:\ProductionSystem\ProductionSystem\frontend\public\PCS\Starter\S230
        console.log(path)
        window.open(window.location.origin + "/PCS" + path)
    }*/

    render() {
        return (
            <div className="doc-view-table-div">
                <h1 className="title">Machine Document Search</h1>
                {!this.state.docView &&
                    <div className="doc-view-header">
                        {/*
                            <Input id="testurl" type="text" />
                        <Button onClick={() => this.testopen()}>Open</Button>
                        */}
                        <div className="doc-view-header-qr">
                            <FontAwesomeIcon className="doc-view-qr-icon" icon={faCamera} onClick={() => this.enableScan()} />
                            <p>Scan QR code</p>
                        </div>
                        <span>Or</span>
                        <div className="doc-view-header-input">
                            <p>Input Machine no.</p>
                            <Input id="inputmcno" type="text" />
                            <Button color="primary" onClick={() => this.manualSearch(document.getElementById('inputmcno').value)}>Search</Button>
                        </div>
                    </div>
                }
                {this.state.qrScanEnable &&
                    <div className="doc-view-qr-scan">
                        <QrReader
                            //ref={x => this.qrReader = x}
                            delay={300}
                            onError={this.qrError}
                            onScan={this.qrScan}
                        //legacyMode={this.state.enableLegacy}
                        />
                    </div>
                }
                {this.state.indexView &&
                    <div className="doc-view-index">
                        <span>Current Machine no :</span>
                        <span>{this.state.result}</span>
                        <li onClick={() => this.selectIndex("PCS")}>PCS</li>
                        <li onClick={() => this.selectIndex("FMEA")}>FMEA</li>
                        <li onClick={() => this.selectIndex("KAKOTORA")}>KAKOTORA</li>
                    </div>
                }
                {this.state.docView &&
                    <div className="doc-view-doc-list">
                        <div className="doc-view-doc-header">
                            <span>Current Machine no :</span>
                            <span>{this.state.result}</span>
                        </div>
                        <FontAwesomeIcon id="backtoMCno" icon={faAngleDoubleLeft} onClick={() => this.backToIndex()} />
                        {this.unControlToolTipPack("backtoMCno", "Back")}
                        <span>Back to Index</span>
                        <Table striped hover responsive>
                            <tbody>
                                {this.state.filteredDocList.sort(naturalSort).map((list, ind) => (
                                    <tr key={list.id}>
                                        <td>{ind + 1}</td>
                                        <td id="openfile" onClick={() => this.openFilePath(list.docpath, list.docfile)}>
                                            {list.docfile}
                                            {this.unControlToolTipPack("openfile", "View")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                }
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null, mapDispatchToProps)(DocumentView)