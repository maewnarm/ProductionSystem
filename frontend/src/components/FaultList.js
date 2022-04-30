import React, { PureComponent } from 'react';
import './scss/FaultList.scss';
import axios from 'axios';
import {
    Button,
    Row,
    Col,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Label,
    Input,
    FormText,
    InputGroup,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
    Pagination,
    PaginationItem,
    PaginationLink,
} from 'reactstrap'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
var cntResults = 0
const showPage = 5
const perPage = 10

var naturalSort = function (a, b) {
    return ('' + a.machine_index).localeCompare(('' + b.machine_index), 'en', { numeric: true });
}

class OperRatioChart extends PureComponent {
    state = {
        StLists: [],
        FaultLists: [],
        MCindex: '',
        currentMCno: '',
        currentNGcode: '',
        currentNGdetail: 0,
        modalEditShow: false,
        modalDeleteShow: false,
        dropdownOpen: false,
        dropdownText: "Choose machine no.",
        dropdownSelected: false,
        pageActive: 1,
        pageAmount: 0,
        pageShow: [],
        codeRepeated: false,
        codeUpdateRepeated: false,
        filteredLists: [],
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getSTlists();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getSTlists = () => {
        var arrStation = []
        var srchfault = ""
        if (document.getElementById('fault-search') !== null) {
            srchfault = document.getElementById('fault-search').value
        }
        console.log("get st")
        api.get(`/stationlist/${curSection}`)
            .then(lists => {
                lists.data.forEach((item, ind) => {
                    arrStation.push(item.machine_index)
                })
                this.setState({ StLists: arrStation })
            })
            .catch(error => alert(error))
        api.get(`/faultlist/${curSection}`)
            .then(lists => {
                this.setState({
                    FaultLists: lists.data,
                    filteredLists: lists.data
                }, () => {
                    this.createPagination()
                    this.SearchByFault(srchfault)
                })
            })
            .catch(error => alert(error))
    }

    EditCode = (no, code, detail, mcid) => {
        this.setState({
            currentMCno: no,
            currentNGcode: code,
            currentNGdetail: detail,
            MCid: mcid,
        }, () => {
            this.setState({ modalEditShow: true })
        })
    }

    DeleteCode = (mcid) => {
        this.setState({
            MCid: mcid,
        }, () => {
            this.setState({
                modalDeleteShow: !this.state.modalDeleteShow,
            })
        })
    }

    modalEditToggle = () => {
        this.setState({
            modalEditShow: !this.state.modalEditShow,
        })
    }

    modalDeleteToggle = () => {
        this.setState({
            modalDeleteShow: !this.state.modalDeleteShow,
        })
    }

    addCode = async (event) => {
        const MCno = this.state.dropdownText
        const NGcode = document.getElementById('st-input-ngcode').value
        const NGdetail = document.getElementById('st-input-ngdetail').value
        if (!this.state.dropdownSelected || NGcode === "" || NGdetail === "") {
            alert("Please input all required data")
            return null
        }
        if (this.state.codeRepeated) {
            alert("Fault code is already exists")
            return null
        }
        await api.post('/faultlist/create/', {
            machine_index: MCno,
            ng_code: NGcode,
            detail_mem: NGdetail,
            section: curSection
        })
            .then(result => {
                //console.log(result)
                //alert("Add fault data finished")
                this.clearAddCode()
                if (this.state.dropdownText === "Choose machine no.") {
                    this.getSTlists()
                } else {
                    this.getSTFaultLists()
                }
            })
            .catch(error => alert(error))
    }

    UpdateCode = async () => {
        const NGcode = document.getElementById('ngcode').value
        const NGdetail = document.getElementById('ngdetail').value
        const machineid = this.state.MCid
        //console.log('/faultlist/' + `${machineid}` + '/update/')
        if (NGcode === "" || NGdetail === "") {
            alert("Please input all required data")
            return null
        }
        if (this.state.codeUpdateRepeated) {
            alert("Fault code is already exists")
            return null
        }
        await api.patch(`/faultlist/${machineid}/update/`, {
            ng_code: NGcode,
            detail_mem: NGdetail,
        })
            .then(result => {
                this.setState({
                    modalEditShow: false,
                })
                if (this.state.dropdownText === "Choose machine no.") {
                    this.getSTlists()
                } else {
                    this.getSTFaultLists()
                }
            })
            .catch(error => alert(error))

    }

    deleteCode = async () => {
        const machineid = this.state.MCid
        await api.delete(`/faultlist/${machineid}/delete/`)
            .then(result => {
                this.setState({
                    modalDeleteShow: false,
                })
                if (this.state.dropdownText === "Choose machine no.") {
                    this.getSTlists()
                } else {
                    this.getSTFaultLists()
                }
            })
            .catch(error => alert(error))
    }

    clearAddCode = () => {
        this.setState({
            //dropdownText: "Choose machine no.",
            //dropdownSelected: false,
        })
        document.getElementById('st-input-ngcode').value = '';
        document.getElementById('st-input-ngdetail').value = '';
    }

    toggleDropDown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen })
    }

    dropdownSelected = (sender) => {
        const dropText = sender.currentTarget.getAttribute("dropdownvalue")
        //console.log(sender.currentTarget.getAttribute("dropdownvalue"))
        this.setState({
            dropdownText: dropText,
            dropdownSelected: true,
        }, () => {
            this.getSTFaultLists()
        })
    }

    getSTFaultLists = () => {
        const mcind = this.state.dropdownText
        const faultCode = document.getElementById('st-input-ngcode').value
        const srchfault = document.getElementById('fault-search').value
        api.get(`/faultlist/st/${curSection}_${mcind}`)
            .then(lists => {
                this.setState({
                    FaultLists: lists.data,
                    filteredLists: lists.data
                }, () => {
                    this.createPagination()
                    this.checkRepeatFaultcode(faultCode)
                    this.SearchByFault(srchfault)
                })
            })
            .catch(error => alert(error))
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

    checkRepeatFaultcode = (val) => {
        var isRepeated = false
        this.state.FaultLists.forEach((item) => {
            if (item.machine_index === this.state.dropdownText && item.ng_code === val) {
                //console.log("Repeated")
                console.log(item.machine_index)
                console.log(item.ng_code)
                console.log(val)
                isRepeated = true
            }
        })
        this.setState({
            codeRepeated: isRepeated
        })
    }

    checkRepeatUpdateFaultcode = (val) => {
        var isRepeated = false
        this.state.FaultLists.forEach((item) => {
            if (item.machine_index === this.state.currentMCno && item.ng_code === val && val !== this.state.currentNGcode) {
                //console.log("Repeated")
                isRepeated = true
            }
        })
        this.setState({
            codeUpdateRepeated: isRepeated
        })
    }

    SearchByFault = (faultcode) => {
        var filtered = []
        //console.log(resind)
        this.state.FaultLists.forEach((item) => {
            if (item.ng_code.toString().includes(faultcode)) {
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

    render() {
        return (
            <div className="table-list">
                <div className="CreateForm">
                    <form className="form-group col-sm-4 mx-auto was-validated">
                        <div className="fault-form-group1">
                            <label >Machine no.</label>
                            <InputGroupButtonDropdown
                                className={this.state.dropdownSelected ? 'dropdown-selected' : 'dropdown-noselect'}
                                addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                                <DropdownToggle caret>
                                    {this.state.dropdownText}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {this.state.StLists.map((item, ind) => (
                                        <DropdownItem onClick={this.dropdownSelected} dropdownvalue={item} key={ind}>{item}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        </div>
                        <div className="fault-form-group1">
                            <label >NG Code</label>
                            <input type="text" name="ngcode" className="form-control" id="st-input-ngcode" onChange={(e) => this.checkRepeatFaultcode(e.target.value)} required autoComplete="off"></input>
                            {this.state.codeRepeated && <FormText className="repeated-ht">{'This Fault code is already exists'}</FormText>}
                            <FormText className="help-ht">{'[ex. 1]'}</FormText>
                        </div>
                        <div className="fault-form-group1">
                            <label >NG Detail</label>
                            <input type="text" name="detail" className="form-control" id="st-input-ngdetail" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. Process not complete]'}</FormText>
                        </div>
                        <Row>
                            <Button type="button" className="st-form-submit-btn" color="primary" onClick={(event) => this.addCode(event)}>Submit</Button>
                            <Button type="button" className="st-form-clear-btn" color="danger" onClick={() => this.clearAddCode()}>Clear</Button>
                        </Row>
                    </form>
                </div>

                <Col sm="12" md={{ size: 10, offset: 1 }}>
                    <div className="fault-head">
                        <div className="fault-table-search">
                            <p className="search-txt">{'Search Fault code'}</p>
                            <InputGroup>
                                <Input placeholder="Input Fault code ..." id="fault-search" onChange={(e) => this.SearchByFault(e.target.value)} autoComplete="off" />
                            </InputGroup>
                        </div>
                        <div className="fault-table-page">
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
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th id="ng-col0"></th>
                                <th id="ng-col1">Machine no.</th>
                                <th id="ng-col2">NG Code</th>
                                <th id="ng-col3">NG Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.filteredLists.sort(naturalSort).map((list, ind) => {
                                if (ind === 0) {
                                    cntResults = 0
                                }
                                cntResults++
                                if (cntResults <= perPage * this.state.pageActive && cntResults > perPage * (this.state.pageActive - 1)) {
                                    return (
                                        <tr key={list.id}>
                                            <td>
                                                <Button className="edit-btn" color="warning" onClick={() => this.EditCode(list.machine_index, list.ng_code, list.detail_mem, list.id)}>Edit</Button>
                                                <Button className="edit-btn" color="danger" onClick={() => this.DeleteCode(list.id)}>Delete</Button>
                                            </td>
                                            <td>{list.machine_index}</td>
                                            <td>{list.ng_code}</td>
                                            <td>
                                                {list.detail_mem}
                                            </td>
                                        </tr>
                                    )
                                } else {
                                    return null
                                }
                            })}
                        </tbody>
                    </Table>
                </Col>

                <Modal isOpen={this.state.modalEditShow} toggle={this.modalEditToggle} className="fault-content">
                    <ModalHeader toggle={this.modalEditToggle} >Edit</ModalHeader>
                    <ModalBody className="fault-body">
                        <FormGroup>
                            <Label for="listdetail">Machine no. : </Label>
                            <Input type="text" name="address" id="mcno" defaultValue={this.state.currentMCno} disabled />
                            <Label for="listdetail">NG Code : </Label>
                            <Input type="text" name="address" id="ngcode" defaultValue={this.state.currentNGcode} onChange={(e) => this.checkRepeatUpdateFaultcode(e.target.value)} required autoComplete="off" />
                            {this.state.codeUpdateRepeated && <FormText className="repeated-ht">{'This Fault code is already exists'}</FormText>}
                            <Label for="listdetail">NG Detail : </Label>
                            <Input type="text" name="address" id="ngdetail" defaultValue={this.state.currentNGdetail} required autoComplete="off" />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.UpdateCode()}>Save</Button>
                        <Button color="secondary" onClick={this.modalEditToggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.modalDeleteShow} toggle={this.modalDeleteToggle} className="regis-delete-content">
                    <ModalHeader toggle={this.modalDeleteToggle}>Delete confirmation</ModalHeader>
                    <ModalBody className="regis-delete-body">
                        <FormGroup>
                            <Label className="regis-delete-label">Are you sure to delete ?</Label>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.deleteCode()}>Yes</Button>{' '}
                        <Button color="secondary" onClick={this.modalDeleteToggle}>Cancel</Button>
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

export default connect(null, mapDispatchToProps)(OperRatioChart)