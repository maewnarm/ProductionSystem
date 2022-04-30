import React, { PureComponent } from 'react';
import './scss/StationSetting.scss';
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
    FormText
} from 'reactstrap'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""

var naturalSort = function (a, b) {
    return ('' + a.machine_index).localeCompare(('' + b.machine_index), 'en', { numeric: true });
}

class OperRatioChart extends PureComponent {
    state = {
        StLists: [],
        MCindex: '',
        currentMCno: '',
        currentMCname: '',
        currentMT: 0,
        currentHT: 0,
        modalEditShow: false,
        modalDeleteShow: false,
        mcnoRepeated: false,
        mcnoModalRepeated: false,
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
        console.log("get st")
        api.get(`/stationlist/${curSection}`)
            .then(lists => {
                this.setState({ StLists: lists.data })
            })
            .catch(error => alert(error))
    }

    EditHT = (no, name, mt, ht, mcid) => {
        this.setState({
            currentMCno: no,
            currentMCname: name,
            currentMT: mt,
            currentHT: ht,
            MCid: mcid,
        }, () => {
            this.setState({ modalEditShow: true })
        })
    }

    DeleteST = (mcid) => {
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

    addStation = async (event) => {
        const MCno = document.getElementById('st-input-mcno').value
        const MCname = document.getElementById('st-input-mcname').value
        const MCmt = document.getElementById('st-input-mt').value
        const MCht = document.getElementById('st-input-ht').value
        if (MCno === "" || MCname === "" || MCmt === "" || MCht === "") {
            alert("Please input all required data")
            return null
        }
        if (this.state.mcnoRepeated) {
            alert("Machine no. is already exists")
            return null
        }
        await api.post('/stationlist/create/', {
            machine_index: MCno,
            machine_name: MCname,
            machine_mt: MCmt,
            machine_ht: MCht,
            section: curSection
        })
            .then(result => {
                //console.log(result)
                alert("Add station finished")
                this.getSTlists()
                this.clearAddST()
            })
            .catch(error => alert(error))
    }

    UpdateHT = async () => {
        const mcno = document.getElementById('mcno').value
        const mcname = document.getElementById('mcname').value
        const mctime = document.getElementById('mt').value
        const handtime = document.getElementById('ht').value
        const machineid = this.state.MCid
        //console.log(`/stationlist/${machineid}/update/`)
        if (mcno === "" || mcname === "" || mctime === "" || handtime === "") {
            alert("Please input all required data")
            return null
        }
        if (this.state.mcnoModalRepeated) {
            alert("Machine no. is already exists")
            return null
        }
        await api.patch(`/stationlist/${machineid}/update/`, {
            machine_index: mcno,
            machine_name: mcname,
            machine_mt: mctime,
            machine_ht: handtime,
        })
            .then(result => {
                this.setState({
                    modalEditShow: false,
                })
            })
            .catch(error => alert(error))
        this.getSTlists()
    }

    deleteStation = async () => {
        const machineid = this.state.MCid
        await api.delete(`/stationlist/${machineid}/delete/`)
            .then(result => {
                this.setState({
                    modalDeleteShow: false,
                })
                this.getSTlists()
            })
            .catch(error => alert(error))
    }

    clearAddST = () => {
        document.getElementById('st-input-mcno').value = '';
        document.getElementById('st-input-mcname').value = '';
        document.getElementById('st-input-mt').value = '';
        document.getElementById('st-input-ht').value = '';
    }

    checkRepeatmcNo = (val) => {
        //console.log(val)
        var isRepeated = false
        this.state.StLists.forEach((item) => {
            if (item.machine_index === val) {
                //console.log("repeated")
                isRepeated = true
            }
        })
        this.setState({
            mcnoRepeated: isRepeated
        })
    }

    checkRepeatmcNoModal = (val) => {
        //console.log(val)
        var isRepeated = false
        this.state.StLists.forEach((item) => {
            if (item.machine_index === val && val !== this.state.currentMCno) {
                //console.log("repeated")
                isRepeated = true
            }
        })
        this.setState({
            mcnoModalRepeated: isRepeated
        })
    }

    render() {
        return (
            <div className="table-list">
                <div className="CreateForm">
                    <form className="form-group col-sm-4 mx-auto was-validated">
                        <div className="st-form-group1">
                            <label >Machine no.</label>
                            <input type="text" name="mcno" className="form-control" id="st-input-mcno" onChange={(e) => this.checkRepeatmcNo(e.target.value)} required autoComplete="off"></input>
                            {this.state.mcnoRepeated && <FormText className="repeated-ht">{'This Machine no. is already exists'}</FormText>}
                            <FormText className="help-ht">{'[ex. ST1]'}</FormText>
                        </div>
                        <div className="st-form-group1">
                            <label >Machine name</label>
                            <input type="text" name="mcname" className="form-control" id="st-input-mcname" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. Grease Apply Machine]'}</FormText>
                        </div>
                        <div className="st-form-group1">
                            <label >M/T (Machine Time)</label>
                            <input type="text" name="mcmt" className="form-control" id="st-input-mt" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. 12.3]'}</FormText>
                        </div>
                        <div className="st-form-group1">
                            <label >H/T (Hand Time)</label>
                            <input type="text" name="mcht" className="form-control" id="st-input-ht" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. 12.3]'}</FormText>
                        </div>
                        <Row>
                            <Button type="button" className="st-form-submit-btn" color="primary" onClick={(event) => this.addStation(event)}>Submit</Button>
                            <Button type="button" className="st-form-clear-btn" color="danger" onClick={() => this.clearAddST()}>Clear</Button>
                        </Row>
                    </form>
                </div>

                <Col sm="12" md={{ size: 10, offset: 1 }}>
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th id="st-col0"></th>
                                <th id="st-col1">Machine no.</th>
                                <th id="st-col2">Machine name</th>
                                <th id="st-col3">Std. M/T</th>
                                <th id="st-col4">Std. H/T</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.StLists.sort(naturalSort).map(list => (
                                <tr key={list.id}>
                                    <td>
                                        <Button className="edit-btn" color="warning" onClick={() => this.EditHT(list.machine_index, list.machine_name, list.machine_mt, list.machine_ht, list.id)}>Edit</Button>
                                        <Button className="edit-btn" color="danger" onClick={() => this.DeleteST(list.id)}>Delete</Button>
                                    </td>
                                    <td>{list.machine_index}</td>
                                    <td>{list.machine_name}</td>
                                    <td>{list.machine_mt}</td>
                                    <td>{list.machine_ht}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>

                <Modal isOpen={this.state.modalEditShow} toggle={this.modalEditToggle} className="st-content">
                    <ModalHeader toggle={this.modalEditToggle} >Edit</ModalHeader>
                    <ModalBody className="st-body">
                        <FormGroup>
                            <Label for="listdetail">Machine no. : </Label>
                            <Input type="text" name="address" id="mcno" defaultValue={this.state.currentMCno} onChange={(e) => this.checkRepeatmcNoModal(e.target.value)} autoComplete="off" />
                            {this.state.mcnoModalRepeated && <FormText className="repeated-ht">{'This Machine no. is already exists'}</FormText>}
                            <Label for="listdetail">Machine name : </Label>
                            <Input type="text" name="address" id="mcname" defaultValue={this.state.currentMCname} autoComplete="off" />
                            <Label for="listdetail">M/T (Machine Time) : </Label>
                            <Input type="text" name="address" id="mt" defaultValue={this.state.currentMT} autoComplete="off" />
                            <Label for="listdetail">H/T (Hand Time) : </Label>
                            <Input type="text" name="address" id="ht" defaultValue={this.state.currentHT} autoComplete="off" />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.UpdateHT()}>Save</Button>
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
                        <Button color="primary" onClick={() => this.deleteStation()}>Yes</Button>{' '}
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

export default connect(null,mapDispatchToProps)(OperRatioChart)