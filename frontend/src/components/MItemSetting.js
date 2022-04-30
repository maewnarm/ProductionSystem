import React, { PureComponent } from 'react';
import './scss/mItemSetting.scss';
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
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
} from 'reactstrap'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
var arrLineIndex = {}
var maxRowIndex = null

class OperRatioChart extends PureComponent {
    state = {
        ItemLists: [],
        Itemindex: '',
        currentRow: '',
        currentItem: '',
        currentName: '',
        currentUnit: '',
        currentCheck: false,
        modalEditShow: false,
        modalDeleteShow: false,
        LineLists: [],
        dropdownOpen: false,
        dropdownSelected: false,
        dropdownText: "Select Line...",
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getLinelists();
        //this.getItemlists();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getLinelists = () => {
        var arrLine = []
        arrLineIndex = {}
        //console.log("get line")
        api.get(`/mline/${curSection}`)
            .then(lists => {
                lists.data.forEach((item) => {
                    arrLine.push(item.line_name)
                    arrLineIndex = { ...arrLineIndex, [item.line_name]: item.id }
                })
                //console.log(arrLine)
                //console.log(arrLineIndex)
                this.setState({ LineLists: arrLine }, () => console.log(arrLine))
            })
            .catch(error => alert(error))
    }

    getItemlists = () => {
        var arrItem = []
        var arrRowIndex = []
        //console.log("get st")
        api.get(`/moperation/${curSection}_${this.state.dropdownText}`)
            .then(lists => {
                //console.log(lists.data)
                lists.data.forEach(list => {
                    arrRowIndex = [...arrRowIndex, list.row_index]
                })
                maxRowIndex = Math.max(...arrRowIndex)
                this.setState({ ItemLists: lists.data }, () => console.log(arrItem))
            })
            .catch(error => alert(error))
    }

    EditCode = (row, item, name, code, chk, id) => {
        this.setState({
            currentRow: row,
            currentItem: item,
            currentName: name,
            currentUnit: code,
            currentCheck: chk,
            Itemindex: id,
        }, () => {
            this.setState({ modalEditShow: true })
        })
    }

    DeleteCode = (id) => {
        this.setState({
            Itemindex: id,
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
        const row = document.getElementById('st-input-row').value
        var item = document.getElementById('st-input-item').value
        var name = document.getElementById('st-input-name').value
        var unit = document.getElementById('st-input-unit').value
        const edit = document.getElementById('st-input-check').checked
        const linename = this.state.dropdownText
        if (!this.state.dropdownSelected || row === "") {
            alert("please input all required data")
            return null
        }
        if (item === "" || name === "" || unit === "") {
            //alert("Please input all required data")
            //return null
            item = null
            name = null
            unit = null
        }
        await api.post('/moperation/create/', {
            section: curSection,
            row_index: row,
            item_index: item,
            item_name: name,
            unit_name: unit,
            editable_item: edit,
            line_name: linename,
        })
            .then(result => {
                //console.log(result)
                //alert("Add item list finished")
                this.getItemlists()
                this.clearAddCode()
            })
            .catch(error => alert(error))
    }

    UpdateCode = async () => {
        const row = document.getElementById('row').value
        var item = document.getElementById('item').value
        var name = document.getElementById('name').value
        var unit = document.getElementById('unit').value
        const edit = document.getElementById('check').checked
        const itemid = this.state.Itemindex
        if (item === "") {
            item = null
        }
        if (name === "") {
            name = null
        }
        if (unit === "") {
            unit = null
        }
        await api.patch(`/moperation/${itemid}/update/`, {
            row_index: row,
            item_index: item,
            item_name: name,
            unit_name: unit,
            editable_item: edit,
        })
            .then(result => {
                this.setState({
                    modalEditShow: false,
                })
            })
            .catch(error => alert(error))
        this.getItemlists()
    }

    deleteCode = async () => {
        const itemid = this.state.Itemindex
        await api.delete(`/moperation/${itemid}/delete/`)
            .then(result => {
                this.setState({
                    modalDeleteShow: false,
                })
                this.getItemlists()
            })
            .catch(error => alert(error))
    }

    clearAddCode = () => {
        document.getElementById('st-input-row').value = '';
        document.getElementById('st-input-item').value = '';
        document.getElementById('st-input-name').value = '';
        document.getElementById('st-input-unit').value = '';
        document.getElementById('st-input-check').checked = false;
    }

    toggleDropDown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen })
    }

    dropdownSelected = (sender) => {
        this.setState({
            dropdownText: sender.currentTarget.getAttribute("dropdownvalue"),
            dropdownSelected: true,
        }, () => {
            this.getItemlists()
        })
    }

    AddRow = async () => {
        const linename = this.state.dropdownText
        if (!this.state.dropdownSelected) {
            alert("please select line name")
            return null
        }
        await api.post('/moperation/create/', {
            row_index: maxRowIndex + 1,
            line_name: linename,
            section: curSection,
        })
            .then(result => {
                //console.log(result)
                //alert("Add item list finished")
                this.getItemlists()
            })
            .catch(error => alert(error))
    }

    render() {
        return (
            <div className="table-list">
                <div className="CreateForm">
                    <form className="form-group col-sm-4 mx-auto was-validated">
                        <div className="fault-form-group1">
                            <label >Line name</label>
                            <InputGroupButtonDropdown
                                className={this.state.dropdownSelected ? 'dropdown-selected' : 'dropdown-noselect'}
                                addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                                <DropdownToggle caret>
                                    {this.state.dropdownText}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {this.state.LineLists.map((item, ind) => (
                                        <DropdownItem onClick={this.dropdownSelected} dropdownvalue={item} key={ind}>{item}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        </div>
                        <div className="fault-form-group1">
                            <label >Row</label>
                            <input type="text" name="itemrow" className="form-control" id="st-input-row" required autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. 1]'}</FormText>
                        </div>
                        <div className="fault-form-group1">
                            <label >Item index</label>
                            <input type="text" name="itemind" className="form-control" id="st-input-item" autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. 1]'}</FormText>
                        </div>
                        <div className="fault-form-group1">
                            <label >Item name</label>
                            <input type="text" name="itemname" className="form-control" id="st-input-name" autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. Operation Ratio]'}</FormText>
                        </div>
                        <div className="fault-form-group1">
                            <label >Item units</label>
                            <input type="text" name="itemunit" className="form-control" id="st-input-unit" autoComplete="off"></input>
                            <FormText className="help-ht">{'[ex. min]'}</FormText>
                        </div>
                        <div className="fault-form-group2">
                            <Input addon type="checkbox" className="edit-check-box" id="st-input-check" />
                            <p className="edit-label">Editable Item</p>
                        </div>
                        <Row>
                            <Button type="button" className="st-form-submit-btn" color="primary" onClick={(event) => this.addCode(event)}>Submit</Button>
                            <Button type="button" className="st-form-clear-btn" color="danger" onClick={() => this.clearAddCode()}>Clear</Button>
                            <Button color="success" className="st-form-clear-btn" onClick={() => this.AddRow()}>AddRow</Button>
                        </Row>
                    </form>
                </div>

                <Col sm="12" md={{ size: 10, offset: 1 }}>
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th id="item-set-col0"></th>
                                <th id="item-set-col1">Row</th>
                                <th id="item-set-col2">Item index</th>
                                <th id="item-set-col3">Name</th>
                                <th id="item-set-col4">Units</th>
                                <th id="item-set-col5">Editable?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.ItemLists.sort((a, b) => a.row_index > b.row_index ? 1 : -1).map(list => (
                                <tr key={list.id}>
                                    <td>
                                        <Button className="edit-btn" color="warning" onClick={() => this.EditCode(list.row_index, list.item_index, list.item_name, list.unit_name, list.editable_item, list.id)}>Edit</Button>
                                        <Button className="edit-btn" color="danger" onClick={() => this.DeleteCode(list.id)}>Delete</Button>
                                    </td>
                                    <td>{list.row_index}</td>
                                    <td>{list.item_index}</td>
                                    <td>{list.item_name}</td>
                                    <td>{list.unit_name}</td>
                                    <td>{list.editable_item ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>

                <Modal isOpen={this.state.modalEditShow} toggle={this.modalEditToggle} className="item-list-content">
                    <ModalHeader toggle={this.modalEditToggle} >Edit</ModalHeader>
                    <ModalBody className="fault-body">
                        <FormGroup>
                            <Label for="listdetail">Row : </Label>
                            <Input type="text" name="address" id="row" defaultValue={this.state.currentRow} disabled />
                            <Label for="listdetail">Item index: </Label>
                            <Input type="text" name="address" id="item" defaultValue={this.state.currentItem} autoComplete="off" />
                            <Label for="listdetail">Item name : </Label>
                            <Input type="text" name="address" id="name" defaultValue={this.state.currentName} autoComplete="off" />
                            <Label for="listdetail">Item units : </Label>
                            <Input type="text" name="address" id="unit" defaultValue={this.state.currentUnit} autoComplete="off" />
                            <div>
                                <Input className="check-box-modal" addon type="checkbox" name="address" id="check" defaultChecked={this.state.currentCheck} />
                                <Label for="listdetail">Editable Item : </Label>
                            </div>
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