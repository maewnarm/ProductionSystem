import React, { Component } from "react";
import "./App.css";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Navtab from "./containers/Layout";

import { connect } from "react-redux";
import * as actions from "./Store/actions/authen";

class App extends Component {
  constructor() {
    super();
    // const baseURL = `http://127.0.0.1:8000/api/`;
    // const baseURL = `http://172.23.3.18:8000/api/`;
    const baseURL = `${process.env.REACT_APP_BASE_URL}api/`;

    // const baseURLbe = `http://127.0.0.1:8000/`;
    // const baseURLbe = `http://172.23.3.18:8000/`;
    const baseURLbe = `${process.env.REACT_APP_BASE_URL}`;

    // const apiupload = `http://127.0.0.1:5000/upload/`;
    // const apiupload = `http://172.23.3.18:5000/upload/`;
    const apiupload = `${process.env.REACT_APP_UPLOAD_URL}upload/`;

    localStorage.setItem("baseurl", baseURL);
    localStorage.setItem("baseurlbe", baseURLbe);
    localStorage.setItem("apiupload", apiupload);
    localStorage.setItem("expiredTime", 900 * 1000);
  }

  componentDidMount() {
    console.log("on try");
    this.props.onTryAutoSignup();
  }

  state = {
    modalShow: false,
  };

  modalToggle = () => {
    this.setState({
      modalShow: !this.state.modalShow,
    });
  };

  handleLogin = (user, pass) => {
    //console.log(user + "/" + pass)
    if (user !== "" && pass !== "") {
      /*this.setState({
        username: user
      }, () => {*/
      this.props.onAuth(user, pass);
      //})
    }
  };

  handleSignup = (user, pass1, pass2) => {
    //console.log(user + "/" + pass1 + "/" + pass2)
    if (user !== "" && pass1 !== "" && pass2 !== "" && pass1 === pass2) {
      //console.log("sign up")
      this.props.onAuthSignup(user, pass1, pass2);
    }
  };

  handleLogout = () => {
    this.props.logout();
  };

  render() {
    //let errorMessage = null
    if (this.props.error) {
      /*errorMessage = (
        <p>{this.props.error.message}</p>
      )*/
      console.log(this.props.error.message);
    }

    return (
      <>
        <Navtab
          pr={this.props}
          loading={this.props.isLoading}
          auth={this.props.isAuthenticated}
          fail={this.props.isFailed}
          username={this.props.userAuthenticated}
          st={this.state}
          log={this.handleLogin}
          sign={this.handleSignup}
          out={this.handleLogout}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  //console.log(state)
  return {
    isAuthenticated: state.token !== null,
    userAuthenticated: state.username,
    isFailed: state.error !== null,
    isLoading: state.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState()),
    onAuth: (username, password) =>
      dispatch(actions.authLogin(username, password)),
    onAuthSignup: (username, password1, password2) =>
      dispatch(actions.authSignup(username, password1, password2)),
    logout: () => dispatch(actions.logout()),
  };
};

/*const mapSignupDispatchToProps = dispatch => {
  return {
    onAuth: (username, password1, password2) => dispatch(actions.authSignup(username, password1, password2))
  }
}*/

export default connect(mapStateToProps, mapDispatchToProps)(App);
