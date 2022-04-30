import * as actionTypes from './actionTypes'
import axios from 'axios'

const api = axios.create({
    baseURL: localStorage.getItem('baseurlbe')
})

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const authSuccess = (token, user) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        username: user
    }
}

export const authFail = error => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}

export const logout = () => {
    localStorage.removeItem('username')
    localStorage.removeItem('expirationDate')
    return {
        type: actionTypes.AUTH_LOGOUT,
        username: ""
    }
}

export const checkAuthTimeout = expirationTime => {
    return dispatch => {
        /*setTimeout(() => {
            const expirationDate = new Date(localStorage.getItem('expirationDate'))
            if (expirationDate <= new Date()) {
                dispatch(logout())
            }
        }, expirationTime);*/
    }
}

export const authLogin = (user, password) => {
    return dispatch => {
        dispatch(authStart())
        api.post('/rest-auth/login/', {
            username: user,
            password: password
        })
            .then(res => {
                //console.log(res)
                const token = res.data.key
                const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
                const expirationDate = new Date(new Date().getTime() + expiredTime)
                //console.log(expirationDate)
                localStorage.setItem('token', token)
                localStorage.setItem('username', user)
                localStorage.setItem('expirationDate', expirationDate)
                dispatch(authSuccess(token, user))
                //dispatch(checkAuthTimeout(expiredTime))
            })
            .catch(err => {
                dispatch(authFail(err))
            })
    }
}

export const authSignup = (user, password1, password2) => {
    return dispatch => {
        dispatch(authStart())
        api.post('/rest-auth/registration/', {
            username: user,
            password1: password1,
            password2: password2
        })
            .then(res => {
                const token = res.data.key
                const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
                const expirationDate = new Date(new Date().getTime() + Number.parseInt(expiredTime))
                localStorage.setItem('token', token)
                localStorage.setItem('username', user)
                localStorage.setItem('expirationDate', expirationDate)
                dispatch(authSuccess(token, user))
                //dispatch(checkAuthTimeout(expiredTime))
            })
            .catch(err => {
                dispatch(authFail(err))
                const resp = err.response.data
                var txt = "Error occured : \n"
                Object.keys(resp).forEach(key => {
                    txt = txt + "\n" + resp[key][0]
                })
                alert(txt)
            })
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token')
        if (token === undefined) {
            dispatch(logout())
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'))
            const user = localStorage.getItem('username')
            if (expirationDate <= new Date()) {
                //dispatch(logout())
            } else {
                const expiredTime = Number.parseInt(localStorage.getItem('expiredTime'))
                const newexpirationDate = new Date(new Date().getTime() + expiredTime)
                localStorage.setItem('expirationDate', newexpirationDate)
                dispatch(authSuccess(token, user))
                //dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000))
                //dispatch(checkAuthTimeout(expiredTime))
                //console.log("in check" + localStorage.getItem('expirationDate'))
            }
        }
    }
}