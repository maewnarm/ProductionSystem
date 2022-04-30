import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { FormGroup, Label, Input, Button, ModalBody, ModalFooter, Modal, ModalHeader } from 'reactstrap'
import logo from './DENSO.png';
import './scss/Layout.scss';
//import './scss/Layout.css';
import { NavLink } from 'react-router-dom';
import Routing from './routes';
import { connect } from 'react-redux'
import { useSpring, animated } from 'react-spring'

const api = axios.create({
  baseURL: localStorage.getItem('baseurl')
})
var refreshDate = new Date()

class Navtab extends React.Component {
  state = {
    modalShow: false,
    userErr: false,
    pass1Err: false,
    pass2Err: false,
    pass2nosame: false,
    keyerr: false,
    loginEmpty: false,
    isSignupCycle: false,
    announce: [],
  }

  modalToggle = () => {
    this.setState({
      modalShow: !this.state.modalShow,
      userErr: false,
      pass1Err: false,
      pass2Err: false,
      pass2nosame: false
    })
  }

  userChange = (e) => {
    const len = e.currentTarget.value.length
    if (len < 4) {
      this.setState({
        userErr: true
      })
    } else {
      this.setState({
        userErr: false
      })
    }
  }

  pass1Change = (e) => {
    var pass1err = false
    var pass2no = false
    const len = e.currentTarget.value.length
    if (len < 8) {
      pass1err = true
    } else {
      pass1err = false
    }
    const pass1 = e.currentTarget.value
    const pass2 = document.getElementById('password2').value
    if (pass1 !== pass2) {
      pass2no = true
    } else {
      pass2no = false
    }
    this.setState({
      pass1Err: pass1err,
      pass2nosame: pass2no
    })
  }

  pass2Change = (e) => {
    var pass2err = false
    var pass2no = false
    const len = e.currentTarget.value.length
    if (len < 8) {
      pass2err = true
    } else {
      pass2err = false
    }
    const pass1 = document.getElementById('password1').value
    const pass2 = e.currentTarget.value
    if (pass1 !== pass2) {
      pass2no = true
    } else {
      pass2no = false
    }
    this.setState({
      pass2Err: pass2err,
      pass2nosame: pass2no,
    })
  }

  regisKeyChange = (e) => {
    var keyerr = false
    var keyval = e.currentTarget.value
    if (keyval !== "EPPE7348rEgiS") {
      keyerr = true
    }
    this.setState({
      keyerr: keyerr
    })
  }

  handleLogin = (e) => {
    //console.log(this.props)
    const user = document.getElementById('section').value
    const pass = document.getElementById('password').value
    var emptyflag = false
    if (user === "" || pass === "") {
      emptyflag = true
      //Object.assign(document.getElementById('login-input').style, { margin: "0 0 5px 0" })
    } else {
      emptyflag = false
      //Object.assign(document.getElementById('login-input').style, { margin: "0 0 5px auto" })
      e(user, pass)
    }
    this.setState({
      isSignupCycle: false,
      loginEmpty: emptyflag
    }, () => {
      //this.failtextLoad()
    })
  }

  handleSignup = (e) => {
    const usererr = this.state.userErr
    const pass1err = this.state.pass2Err
    const pass2err = this.state.pass2Err
    const pass2no = this.state.pass2nosame
    const keyerr = this.state.keyerr
    const user = document.getElementById('user').value
    const pass1 = document.getElementById('password1').value
    const pass2 = document.getElementById('password2').value
    const key = document.getElementById('regis-key').value
    var userempty = false
    var pass1empty = false
    var pass2empty = false
    var keyempty = false
    if (user === "" || user.length < 4) {
      userempty = true
    }
    if (pass1 === "" || pass1.length < 8) {
      pass1empty = true
    }
    if (pass2 === "" || pass2.length < 8) {
      pass2empty = true
    }
    if (key === "") {
      keyempty = true
    }
    this.setState({
      userErr: userempty,
      pass1Err: pass1empty,
      pass2Err: pass2empty,
      keyerr: keyempty
    })
    if (usererr || userempty || pass1err || pass2err || pass1empty || pass2empty || pass2no || keyerr || keyempty) {
      return
    } else {
      this.setState({
        isSignupCycle: true
      }, () => {
        e(user, pass1, pass2)
        this.modalToggle()
      })
    }
  }

  /*failtextLoad = () => {
    console.log("text load")
    if (!this.props.auth && this.props.fail && !this.state.loginEmpty) {
      Object.assign(document.getElementById('login-input').style, { margin: "0 0 5px 0" })
      Object.assign(document.getElementById('failed-text-wrong').style, { margin: "0 10px 5px auto", display: "block" })
    } else {
      Object.assign(document.getElementById('failed-text-wrong').style, { display: "none" })
    }
  }*/

  componentDidMount() {
    //this.failtextLoad()
    this.refreshAnnounce()
  }

  componentDidUpdate() {
    //this.failtextLoad()
  }

  checkRefreshAnnounce = () => {
    setTimeout(() => {
      this.refreshAnnounce()
    }, 60 * 1000)
  }

  refreshAnnounce = () => {
    if (refreshDate <= new Date()) {
      api.get(`/announce/list/`)
        .then(res => {
          console.log(res.data)
          var announceMsg = []
          res.data.forEach(result => {
            announceMsg.push(result.msg)
          })
          console.log(announceMsg)
          this.setState({
            announce: announceMsg
          }, () => {
            this.checkRefreshAnnounce()
          })
        })
        .catch(err => {
          //alert(err)
          console.log(err)
        })
    }
  }

  sliderText = ({ text }) => {
    const [key, setKey] = useState(1)
    const scrolling = useSpring({
      from: { transform: "translate(120%,0)" },
      to: { transform: "translate(-100%,0)" },
      config: { duration: 20000 },
      reset: true,
      onRest: () => {
        //console.log("onrest")
        setKey(key + 1)
      }
    })

    return (
      <div key={key} className="slider-text">
        <animated.div style={scrolling} className="animated-text">{text}</animated.div>
      </div>
    )
  }

  keyCheck = (e) => {
    if (e.key === "Enter") {
      this.handleLogin(this.props.log)
    }
  }

  test = () => {
    api.get(`/testProcedure/`)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  }

  render() {
    //console.log(this.props)
    return (
      <div className="header">
        <div className="nav-div">
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <div className="side-nav">
              <Navbar.Brand href="/">
                <img
                  alt="DENSO"
                  src={logo}
                  width="200"
                  height="40"
                  className="d-inline-block align-top"
                />{' '}
              </Navbar.Brand>
              <div className="in-nav">
                <Nav className="nav-menu">
                  <p className="label-menu">MENU</p>
                  {/*<NavLink to="/home" className="navlink-item">Initial Stage Home</NavLink>*/}
                  {/*<NavDropdown title="Working Standard" id="collasible-nav-dropdown">
                    <ul className="nav flex-column">
                      <NavLink to="/wslist" activeClassName="is-active" className="navlink-item-drop">WS List</NavLink>
                      <NavLink to="/wsmonitor" activeClassName="is-active" className="navlink-item-drop">WS Monitor</NavLink>
                    </ul>
                  </NavDropdown>*/}
                  {/*<NavDropdown title="Initial Stage Control" id="collasible-nav-dropdown">
                    <ul className="nav flex-column">
                      <p className="drop-title">Visualize</p>
                      <NavLink to="/operationratio" activeClassName="is-active" className="navlink-item-drop-bot">Initial Stage Visualize</NavLink>
                      <p className="drop-title">Setting</p>
                      <NavLink to="/stationsetting" activeClassName="is-active" className="navlink-item-drop">Station Setting</NavLink>
                      <NavLink to="/resultlist" activeClassName="is-active" className="navlink-item-drop">Result List Setting</NavLink>
                      <NavLink to="/faultlist" activeClassName="is-active" className="navlink-item-drop">Fault List Setting</NavLink>
                      <p className="drop-title">Manual</p>
                      <NavLink to="/moperationratio" activeClassName="is-active" className="navlink-item-drop">Operation Ratio</NavLink>
                      <NavLink to="/mlinesetting" activeClassName="is-active" className="navlink-item-drop">Line Setting</NavLink>
                      <NavLink to="/mitemsetting" activeClassName="is-active" className="navlink-item-drop">Item Setting</NavLink>
                      {<NavLink to="/mwork" activeClassName="is-active" className="navlink-item-drop">Work amount</NavLink>}
                    </ul>
                  </NavDropdown>*/}
                  <NavDropdown title="Record Control Items" id="collasible-nav-dropdown">
                    <ul className="nav flex-column">
                      <NavLink to="/recorddata" activeClassName="is-active" className="navlink-item-drop-bot">Record Data</NavLink>
                      {/*<NavLink to="/recordapprove" activeClassName="is-active" className="navlink-item-drop-bot">Approve Data</NavLink>*/}
                      <NavLink to="/editcontrolitems" activeClassName="is-active" className="navlink-item-drop-bot">Edit Control Items</NavLink>
                    </ul>
                  </NavDropdown>
                  {/*<NavDropdown title="Machine Documents" id="collasible-nav-dropdown">
                    <ul className="nav flex-column">
                      <NavLink to="/docview" activeClassName="is-active" className="navlink-item-drop-bot">Document Search</NavLink>
                      <NavLink to="/docsetting" activeClassName="is-active" className="navlink-item-drop-bot">Setting Path</NavLink>
                    </ul>
                  </NavDropdown>*/}
                </Nav>
              </div>
            </div>
          </Navbar>
          <span className="version-txt">version : 1.2.0</span>
        </div>
        <this.sliderText text={`Welcome to Production System. This system developed by ESD EPPE, if have any problems please contact ESD EPPE BPK plant section.`} />
        <div className="behind">
          <div className="login-header">
            <div className="login-header-announce">
              {this.state.announce.length > 0 &&
                <h6>Annoucement :</h6>
              }
              {this.state.announce.map((msg, ind) => {
                return <h6 key={ind}>{msg}</h6>
              })
              }
              {/*<Button style={{padding: "0 0",width: "fit-content"}} onClick={() => this.test()}>test</Button>*/}
            </div>
            {
              this.props.auth ?
                <div className="logged-in">
                  <p>Now signed in with Section code : {this.props.username}</p>
                  <Button color="danger" className="auth-btn" onClick={this.props.out}>Log out</Button>
                </div>
                :
                <div className="login-form">
                  {this.state.loginEmpty &&
                    <p className="failed-text" >Please input Section and Password</p>
                  }
                  {(this.props.loading && !this.state.isSignupCycle) &&
                    <p className="logging-text" id="failed-text-wrong" >Logging in ...</p>
                  }
                  {(!this.props.auth && this.props.fail && !this.state.loginEmpty && !this.state.isSignupCycle) &&
                    <p className="failed-text" id="failed-text-wrong" >Section code or Password is wrong</p>
                  }
                  <div className="login-input" id="login-input">
                    <FormGroup className="login-fromgroup">
                      <Label for="section">Section code</Label>
                      <Input type="text" name="section" id="section" autoComplete="off" onKeyDown={(e) => this.keyCheck(e)} />
                    </FormGroup>
                    <FormGroup className="login-fromgroup">
                      <Label for="password">Password</Label>
                      <Input type="password" name="password" id="password" autoComplete="off" onKeyDown={(e) => this.keyCheck(e)} />
                    </FormGroup>
                  </div>
                  <div className="login-btn-group">
                    <Button color="success" className="auth-btn" onClick={(e) => this.handleLogin(this.props.log)} >Log in</Button>
                    <Button color="info" className="auth-btn" onClick={this.modalToggle}>Sign up</Button>
                  </div>
                </div>
            }
          </div>
          <Routing pr={this.props} />
        </div>
        <Modal isOpen={this.state.modalShow} toggle={this.modalToggle} className="user-regis-content">
          <ModalHeader toggle={this.modalToggle}>Sign up</ModalHeader>
          <ModalBody className="user-regis-body">
            <FormGroup>
              <Label for="listdetail">Section code</Label>
              <Input type="text" name="section" id={"user"} onChange={(e) => this.userChange(e)} required autoComplete="off" />
              {this.state.userErr &&
                <p className="failed-regis-text">Section must more than 4 characters</p>
              }
              <Label for="listdetail">Password</Label>
              <Input type="password" name="password1" id={"password1"} onChange={(e) => this.pass1Change(e)} required autoComplete="off" />
              {this.state.pass1Err &&
                <p className="failed-regis-text">Password must more than 8 characters</p>
              }
              <Label for="listdetail">Re-password</Label>
              <Input type="password" name="password2" id={"password2"} onChange={(e) => this.pass2Change(e)} required autoComplete="off" />
              {this.state.pass2Err &&
                <p className="failed-regis-text">Re-password must more than 8 characters</p>
              }
              {this.state.pass2nosame &&
                <p className="failed-regis-text">Password and Re-password are not match</p>
              }
              <Label for="listdetail">Registration Key</Label>
              <Input type="password" name="regis-key" id={"regis-key"} onChange={(e) => this.regisKeyChange(e)} required autoComplete="off" />
              {this.state.keyerr &&
                <p className="failed-regis-text">Registration Key is not match (please contact EPPE section)</p>
              }
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => this.handleSignup(this.props.sign)} >Save</Button>{' '}
            <Button color="secondary" onClick={this.modalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default connect()(Navtab);