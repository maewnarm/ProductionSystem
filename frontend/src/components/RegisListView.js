import React from 'react';
import axios from 'axios';
import {
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Table,
    Button,
    FormGroup,
    Label,
    Input,
    Pagination,
    PaginationLink,
    PaginationItem,
    FormText,
    InputGroup,
} from 'reactstrap'
import './scss/List.scss';
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

const apiupload = localStorage.getItem('apiupload')

var curSection =""
var cntResults = 0
const showPage = 5
const perPage = 10

var naturalSort = function (a, b) {
    return ('' + a.work_no).localeCompare(('' + b.work_no), 'en', { numeric: true });
}

class RegisList extends React.Component {

    state = {
        selectedFile: null,
        lists: [],
        isModalOpen: false,
        isModalPreviewOpen: false,
        isModalDeleteOpen: false,
        //picname: '',
        listid: '',
        noInput: '',
        nameInput: '',
        pathInput: '',
        previewimg: '',
        Deleteitemid: '',
        pageActive: 1,
        pageAmount: 0,
        pageShow: [],
        worknoRepeated: false,
        worknoUpdateRepeated: false,
        filteredLists: [],
    }

    constructor() {
        super();
        curSection = localStorage.getItem('username')
        this.getList();
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    getList = async (id) => {
        await api.get(`/ws/${curSection}`)
            .then(result => {
                var arrResult = result.data
                arrResult.sort(naturalSort)
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
    }

    handleSubmitbtn = (event, requestType) => {
        //event.preventDefault();
        const workno = event.target.elements.workno.value;
        const workname = event.target.elements.workname.value;
        const picpath = document.getElementById("customFile").files[0].name;

        const data = new FormData()
        data.append('file', this.state.selectedFile)

        //console.log(workno, workname, picpath);
        if (this.state.worknoRepeated) {
            alert("Part no. is already exists")
            return null
        }
        switch (requestType) {
            case 'post':
                api.post('/ws/create/', {
                    work_no: workno,
                    work_name: workname,
                    ws_path: picpath,
                    section: curSection
                })
                    .then(res => console.log(res))
                    .catch(error => alert(error))

                //send file to data
                axios.post(apiupload, data, {
                })
                    .then(res => {
                        console.log(res)
                    })
                    .catch(error => alert(error))
                break
            default:
                return null
        }
    }

    handleChoosen = (event) => {
        if (this.checkFileType(event)) {
            const picname = document.getElementById("customFile").files[0].name;
            console.log(event.target.files[0])
            document.getElementById("filenamebox").innerText = picname;

            this.setState({
                selectedFile: event.target.files[0],
                loaded: 0
            })
        }
    }

    checkFileType = (event) => {
        let files = event.target.files
        let err = ''
        const types = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
        for (var x = 0; x < files.length; x++) {
            if (types.every(type => files[x].type !== type)) {
                err += "selected file's type is >" + files[x].type + "<, it's not a supported format";
            }
        }

        if (err !== '') {
            event.target.value = null
            alert(err)
            return false;
        }
        return true;
    }

    ClearAddDetails = () => {
        document.getElementById('exampleInputEmail1').value = '';
        document.getElementById('exampleInputPassword1').value = '';
        document.getElementById('filenamebox').innerText = 'Choose Working standard file...';
        document.getElementById('customFile').value = null;
    }

    deleteList = async (id) => {
        await api.delete(`/ws/${id}/delete/`)
            .catch(error => alert(error))
        this.getList();
        this.setState({
            isModalDeleteOpen: false,
        })
    }

    toggle = (id, wno, wname, wspath) => {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            listid: id,
            noInput: wno,
            nameInput: wname,
            pathInput: wspath,
            selectedFile: wspath,
            loaded: 0,
        });
        this.setState({ noInput: wno })
        //console.log("open")
    }

    togglePreview = (wspath) => {
        this.setState({
            previewimg: wspath,
            isModalPreviewOpen: !this.state.isModalPreviewOpen,
        });
        //this.setState({ noInput: wno })
        //console.log("open")
    }

    toggleDelete = (itemid) => {
        this.setState({
            Deleteitemid: itemid,
        }, () => {
            this.setState({
                isModalDeleteOpen: !this.state.isModalDeleteOpen,
            })
        })
    }

    updateList = async () => {
        //for upload
        const dataF = new FormData()
        dataF.append('file', this.state.selectedFile)
        var newworkno = document.getElementById("listnodetail").value;
        var newworkname = document.getElementById("listnamedetail").value;
        var newwspath = this.state.selectedFile.name;
        //console.log(newworkno)
        if (this.state.worknoUpdateRepeated) {
            alert("Part no. is already exists")
            return null
        }
        await api.patch(`/ws/${this.state.listid}/update/`, {
            work_no: newworkno,
            work_name: newworkname,
            ws_path: newwspath,
        })
            .catch(error => alert(error))

        // upload file
        apiupload.post('', dataF, {
        })
            .then(res => {
                console.log(res)
            })
            .catch(error => alert(error))

        this.toggle();
        this.getList();
    }

    handleChoosen = (event) => {
        if (this.checkFileType(event)) {
            //console.log(event.target.files[0].name)
            document.getElementById("filenamebox").innerText = event.target.files[0].name;

            this.setState({
                selectedFile: event.target.files[0],
                loaded: 0
            })
        }
    }

    checkFileType = (event) => {
        let files = event.target.files
        let err = ''
        const types = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

        for (var x = 0; x < files.length; x++) {
            if (types.every(type => files[x].type !== type)) {
                err += "selected file's type is >" + files[x].type + "<, it's not a supported format";
            }
        }

        if (err !== '') {
            event.target.value = null
            alert(err)
            return false;
        }
        return true;
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

    checkRepeatworkno = (val) => {
        //console.log(val)
        var isRepeated = false
        this.state.lists.forEach((item) => {
            if (item.work_no === val) {
                console.log("repeated")
                isRepeated = true
            }
        })
        this.setState({
            worknoRepeated: isRepeated
        })
    }

    checkRepeatworknoModal = (val) => {
        //console.log(val)
        var isRepeated = false
        this.state.lists.forEach((item) => {
            if (item.work_no === val && this.state.noInput !== val) {
                //console.log("repeated")
                isRepeated = true
            }
        })
        this.setState({
            worknoUpdateRepeated: isRepeated
        })
    }

    SearchByPartno = (partno) => {
        //const partno = document.getElementById('part-search').value
        var filtered = []
        //console.log(this.state.lists)
        this.state.lists.forEach((item) => {
            if (item.work_no.includes(partno)) {
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
            <div className="CreateForm">
                <form className="form-group col-md-6 mx-auto was-validated"
                    onSubmit={(event) => this.handleSubmitbtn(event, 'post')}>
                    <div className="form-group1">
                        <label >Part no.</label>
                        <input type="text" name="workno" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" onChange={(e) => this.checkRepeatworkno(e.target.value)} required autoComplete="off"></input>
                        {this.state.worknoRepeated && <FormText className="repeated-ht">{'This Part no is already exists'}</FormText>}
                    </div>
                    <div className="form-group1 mb-4">
                        <label >Part name</label>
                        <input type="text" name="workname" className="form-control" id="exampleInputPassword1" required autoComplete="off"></input>
                    </div>
                    <label >WS file</label>
                    <div className="custom-file mb-4">
                        <input type="file" className="custom-file-input" id="customFile" onChange={this.handleChoosen} required></input>
                        <label className="custom-file-label" id="filenamebox">Choose Working standard file...</label>
                    </div>
                    <button type="submit" className="btn btn-primary mr-1 mb-3">Submit</button>
                    <button type="button" className="btn btn-danger mb-3" onClick={() => this.ClearAddDetails()}>Clear</button>
                </form>
                <Col sm="12" md={{ size: 10, offset: 1 }}>
                    <div className="regis-head">
                        <div className="regis-table-search">
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
                                    <th id="col1"></th>
                                    <th id="col2">Part no.</th>
                                    <th id="col3">Part name</th>
                                    <th id="col4">File name</th>
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
                                            <tr key={item.id}>
                                                <td>
                                                    <Button color="info" onClick={() => this.togglePreview(item.ws_path)} size="sm" id="leftbtn">Preview</Button>
                                                    <Button color="warning" onClick={() => this.toggle(item.id, item.work_no, item.work_name, item.ws_path)} size="sm" id="leftbtn">Edit</Button>
                                                    <button type="button" className="btn btn-danger btn-sm" id="leftbtn" onClick={() => this.toggleDelete(item.id)}>Del</button>
                                                </td>
                                                <td>{item.work_no}</td>
                                                <td>{item.work_name}</td>
                                                <td>{item.ws_path}</td>
                                            </tr>
                                        )
                                    } else {
                                        return null
                                    }
                                })}
                            </tbody>
                        </Table>
                    </div>
                    <Modal isOpen={this.state.isModalOpen} toggle={this.toggle} className="regis-content">
                        <ModalHeader toggle={this.toggle}>Edit</ModalHeader>
                        <ModalBody className="regis-body">
                            <FormGroup>
                                <Label for="listdetail">Part no.</Label>
                                <Input type="text" name="address" id={"listnodetail"} defaultValue={this.state.noInput} onChange={(e) => this.checkRepeatworknoModal(e.target.value)} required autoComplete="off" />
                                {this.state.worknoUpdateRepeated && <FormText className="repeated-ht">{'This Part no. is already exists'}</FormText>}
                                <Label for="listdetail">Part name</Label>
                                <Input type="text" name="address" id={"listnamedetail"} defaultValue={this.state.nameInput} required autoComplete="off" />
                                <Label for="customfile">WS file</Label>
                                <div className="custom-file">
                                    <input type="file" className="custom-file-input" id={"customfile"} onChange={this.handleChoosen} required />
                                    <Label className="custom-file-label" id="filenameboxmodal">{this.state.pathInput}</Label>
                                </div>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.updateList()}>Save</Button>{' '}
                            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.isModalPreviewOpen} toggle={this.togglePreview} className="regis-content">
                        <ModalHeader toggle={this.togglePreview}>Preview</ModalHeader>
                        <ModalBody>
                            <img src={process.env.PUBLIC_URL + '/WSfiles/' + this.state.previewimg} className="img-fluid mx-auto" alt='source error' />
                        </ModalBody>
                        <ModalFooter>

                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.isModalDeleteOpen} toggle={this.toggleDelete} className="regis-delete-content">
                        <ModalHeader toggle={this.toggleDelete}>Delete confirmation</ModalHeader>
                        <ModalBody className="regis-delete-body">
                            <FormGroup>
                                <Label className="regis-delete-label">Are you sure to delete ?</Label>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.deleteList(this.state.Deleteitemid)}>Yes</Button>{' '}
                            <Button color="secondary" onClick={this.toggleDelete}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <br />
                </Col>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null,mapDispatchToProps)(RegisList);