import React, { PureComponent } from 'react';
import './scss/mLineSetting.scss';
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
} from 'reactstrap'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""

class OperRatioChart extends PureComponent {
    state = {
        LineLists: [],
        Lineindex: '',
        currentName: '',
        currentCT: '',
        currentLimit: '',
        modalEditShow: false,
        modalDeleteShow: false,
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getLinelists();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getLinelists = () => {
        console.log("get line")
        api.get(`/mline/${curSection}`)
            .then(lists => {
                //console.log(lists.data)
                this.setState({ LineLists: lists.data })
            })
            .catch(error => alert(error))
    }

    EditCode = (name, ct, limit, id) => {
        this.setState({
            currentName: name,
            currentCT: ct,
            currentLimit: limit,
            Lineindex: id,
        }, () => {
            this.setState({ modalEditShow: true })
        })
    }

    DeleteCode = (id) => {
        this.setState({
            Lineindex: id,
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
        const name = document.getElementById('st-input-linename').value
        const ct = document.getElementById('st-input-linect').value
        const limit = document.getElementById('st-input-linelimit').value
        await api.post('/mline/create/', {
            section: curSection,
            line_name: name,
            line_ct: ct,
            line_limit: limit,
        })
            .then(result => {
                //console.log(result)
                //alert("Add item list finished")
                this.getLinelists()
                this.clearAddCode()
            })
            .catch(error => alert(error))
    }

    UpdateCode = async () => {
        const name = document.getElementById('linename').value
        const ct = document.getElementById('linect').value
        const limit = document.getElementById('linelimit').value
        const itemid = this.state.Lineindex

        //update line list
        await api.patch(`/mline/${itemid}/update/`, {
            line_name: name,
            line_ct: ct,
            line_limit: limit,
        })
            .then(result => {
                /*this.setState({
                    modalEditShow: false,
                })*/
            })
            .catch(error => alert(error))

        //update itemlist
        await api.put(`/moperation/update/${curSection}_${this.state.currentName}_${name}`, {
            line_name: name,
        })
            .then(result => {
                /*this.setState({
                    modalEditShow: false,
                })*/
            })
            .catch(error => alert(error))

        //update data list
        await api.put(`/mdata/update/${curSection}_${this.state.currentName}_${name}`, {
            line_name: name,
        })
            .then(result => {
                //console.log(`127.0.0.1:8000/api/mdata/update/${this.state.currentName};${name}`)
                this.setState({
                    modalEditShow: false,
                })
            })
            .catch(error => alert(error))

        this.getLinelists()
    }

    deleteCode = async () => {
        const itemid = this.state.Lineindex
        await api.delete(`/mline/${itemid}/delete/`)
            .then(result => {
                this.setState({
                    modalDeleteShow: false,
                })
                this.getLinelists()
            })
            .catch(error => alert(error))
    }

    clearAddCode = () => {
        document.getElementById('st-input-linename').value = '';
        document.getElementById('st-input-linect').value = '';
        document.getElementById('st-input-linelimit').value = '';
    }

    render() {
        return (
            <div className="table-list">
                <div className="CreateForm">
                    <form className="form-group col-sm-4 mx-auto was-validated">
                        <div className="fault-form-group1">
                            <label >Line name</label>
                            <input type="text" name="linename" className="form-control" id="st-input-linename" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. Armature Assy, Starter]'}</FormText>
                        </div>
                        <div className="fault-form-group1">
                            <label >Line C/T (sec)</label>
                            <input type="text" name="linect" className="form-control" id="st-input-linect" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. 12.5]'}</FormText>
                        </div>
                        <div className="fault-form-group1">
                            <label >Line Ratio Limit (%)</label>
                            <input type="text" name="linelimit" className="form-control" id="st-input-linelimit" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. 95]'}</FormText>
                        </div>
                        <Row>
                            <Button type="button" className="st-form-submit-btn" color="primary" onClick={(event) => this.addCode(event)}>Submit</Button>
                            <Button type="button" className="st-form-clear-btn" color="danger" onClick={() => this.clearAddCode()}>Clear</Button>
                        </Row>
                    </form>
                </div>

                <Col sm="12" md={{ size: 10, offset: 1 }}>
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th id="line-set-col0"></th>
                                <th id="line-set-col1">Line name</th>
                                <th id="line-set-col2">C/T (sec)</th>
                                <th id="line-set-col3">Ratio Limit (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.LineLists.sort((a, b) => a.id > b.id ? 1 : -1).map(list => (
                                <tr key={list.id}>
                                    <td>
                                        <Button className="edit-btn" color="warning" onClick={() => this.EditCode(list.line_name, list.line_ct, list.line_limit, list.id)}>Edit</Button>
                                        <Button className="edit-btn" color="danger" onClick={() => this.DeleteCode(list.id)}>Delete</Button>
                                    </td>
                                    <td>{list.line_name}</td>
                                    <td>{list.line_ct}</td>
                                    <td>{list.line_limit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>

                <Modal isOpen={this.state.modalEditShow} toggle={this.modalEditToggle} className="line-list-content">
                    <ModalHeader toggle={this.modalEditToggle} >Edit</ModalHeader>
                    <ModalBody className="fault-body">
                        <FormGroup>
                            <Label for="listdetail">Line name : </Label>
                            <Input type="text" name="address" id="linename" defaultValue={this.state.currentName} autoComplete="off" />
                            <Label for="listdetail">Line C/T (sec) : </Label>
                            <Input type="text" name="address" id="linect" defaultValue={this.state.currentCT} autoComplete="off" />
                            <Label for="listdetail">Line Limit (%) : </Label>
                            <Input type="text" name="address" id="linelimit" defaultValue={this.state.currentLimit} autoComplete="off" />
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

export default connect(null,mapDispatchToProps)(OperRatioChart)