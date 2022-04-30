import React from 'react';
import axios from 'axios';
import './scss/GetCurrent.scss';
//import imgsrc from '../WSfiles/TG028200-9740WS.jpg'
import { format } from 'date-fns'
import * as actions from '../Store/actions/authen'
import { connect } from 'react-redux'

const api = axios.create({
    baseURL: localStorage.getItem('baseurl')
})

var curSection = ""
var found = false
class CurrentWS extends React.Component {
    constructor(props) {
        super(props);
        curSection = localStorage.getItem('username')
        this.state = {
            seconds: 0
        };
    }

    componentDidUpdate() {
        const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
        const newexpiredTime = new Date(new Date().getTime() + expiredTime)
        localStorage.setItem('expirationDate', newexpiredTime)
        this.props.checkAuth()
    }

    state = {
        Currentlists: [],
        WSlists: [],
        currentmodel: "",
        imgurl: "",
    }

    tick() {
        this.setState(state => ({
            seconds: format(Date.now(), 'dd/MM/yyyy  HH:mm:ss')
        }));
    }

    getWSno() {
        api.get(`/getcurrent/${curSection}`)
            .then(result => {
                this.setState({
                    Currentlists: result.data,
                    isLoading: false,
                });
                //console.log(this.state.Currentlists);

                this.state.Currentlists.forEach(list => {
                    this.setState({ currentmodel: list.cur_work_no })
                    //console.log(this.state.currentmodel)
                });
                

                api.get(`/ws/${curSection}`)
                    .then(result => {
                        this.setState({
                            WSlists: result.data
                            //isLoading: false,
                        });
                        //console.log(this.state.WSlists);

                        found = false
                        this.state.WSlists.forEach(list => {
                            //console.log(list.work_no)
                            if (list.work_no === this.state.currentmodel) {
                                this.setState({
                                    imgurl: list.ws_path,
                                }, () => {
                                    found = true
                                })
                                //console.log("found")
                            }
                            //console.log("current:" + this.state.currentmodel)
                        })
                        if (!found) {
                            this.setState({ imgurl: "" })
                            console.log("not found")
                        }
                    })
            })
            .catch(error => {
                console.log(error)
                return null
            })
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
        this.interval = setInterval(() => this.getWSno(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div>
                <h1>Part no: {this.state.currentmodel}</h1>
                <h1>File: {this.state.imgurl}</h1>
                <h3>{this.state.seconds}</h3>
                <img src={'./WSfiles/' + this.state.imgurl} className="img-fluid mx-auto" alt='source error' />
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        checkAuth: () => dispatch(actions.authCheckState())
    }
}

export default connect(null,mapDispatchToProps)(CurrentWS);