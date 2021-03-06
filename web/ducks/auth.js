import jwtDecode from 'jwt-decode';
import * as request from 'superagent-bluebird-promise'
import { push } from 'react-router-redux'
import { checkHttpStatus } from '../utils';
import { API_URL } from 'config';

export const LOGIN_USER_REQUEST = 'sc/auth/LOGIN_USER_REQUEST';
export const LOGIN_USER_FAILURE = 'sc/auth/LOGIN_USER_FAILURE';
export const LOGIN_USER_SUCCESS = 'sc/auth/LOGIN_USER_SUCCESS';
export const SIGNUP_USER_REQUEST = 'sc/auth/SIGNUP_USER_REQUEST';
export const SIGNUP_USER_FAILURE = 'sc/auth/SIGNUP_USER_FAILURE';
export const SIGNUP_USER_SUCCESS = 'sc/auth/SIGNUP_USER_SUCCESS';
export const LOGOUT_USER = 'sc/auth/LOGOUT_USER';
export const FETCH_PROTECTED_DATA_REQUEST = 'sc/auth/FETCH_PROTECTED_DATA_REQUEST';
export const RECEIVE_PROTECTED_DATA = 'sc/auth/RECEIVE_PROTECTED_DATA';

const initialState = {
  token: null,
  userName: null,
  isAuthenticated: false,
  isAuthenticating: false,
  statusText: null,
  isSigningUp: false,
  signUpError: null,
  signUpSuccess: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        isAuthenticating: true,
        statusText: null
      };
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: true,
        token: action.token,
        userName: jwtDecode(action.token).user,
        statusText: null
      };
    case LOGIN_USER_FAILURE:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: `Authentication failed: ${action.statusText}`
      };
    case SIGNUP_USER_REQUEST:
      return {
        ...state,
        isSigningUp: true,
        signUpSuccess: false
      };
    case SIGNUP_USER_FAILURE:
      return {
        ...state,
        isSigningUp: false,
        signUpError: action.error,
        signUpSuccess: false
      };
    case SIGNUP_USER_SUCCESS:
      return {
        ...state,
        isSigningUp: false,
        signUpError: null,
        signUpSuccess: true
      };
    case LOGOUT_USER:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: null
      };
    default: return state;
  }
}

export function loginUserSuccess(token) {
  localStorage.setItem('token', token);
  return {
    type: LOGIN_USER_SUCCESS,
    token: token
  };
}

export function loginUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: LOGIN_USER_FAILURE,
    status: error.response.status,
    statusText: error.response.statusText
  };
}

export function signUpUserFailure(error) {
  return {
    type: SIGNUP_USER_FAILURE,
    error: error
  };
}

export function signUpUserSuccess(error) {
  return {
    type: SIGNUP_USER_SUCCESS
  };
}

export function loginUserRequest() {
  return {
    type: LOGIN_USER_REQUEST
  };
}

export function signUpUserRequest() {
  return {
    type: SIGNUP_USER_REQUEST
  };
}

export function logout() {
  localStorage.removeItem('token');
  return {
    type: LOGOUT_USER
  };
}

export function logoutAndRedirect() {
  return (dispatch, state) => {
    dispatch(logout());
    dispatch(push('/'));
  };
}

export function loginUser(email, password, redirect="/") {
  return dispatch => {
    dispatch(loginUserRequest());
    return request
      .post(API_URL + 'authenticate')
      .send({email: email, password: password})
      .then(response => {
        try {
          if (response.body.success) {
            let decoded = jwtDecode(response.body.token);
            dispatch(loginUserSuccess(response.body.token));
            dispatch(push(redirect));
          } else {
            dispatch(loginUserFailure({
              response: {
                status: 403,
                statusText: response.body.message
              }
            }));
          }
        } catch (e) {
          dispatch(loginUserFailure({
            response: {
              status: 403,
              statusText: 'Invalid token'
            }
          }));
        }
      })
      .catch(error => {
        dispatch(loginUserFailure(error));
      })
  }
}

export function signUpUser(name, email, password) {
  return dispatch => {
    dispatch(signUpUserRequest());
    return request
      .post(API_URL + 'users')
      .send({name: name, email: email, password: password})
      .then(response => {
        if (response.body.success) {
          dispatch(signUpUserSuccess());
        } else {
          dispatch(signUpUserFailure(response.body.error));
        }
      })
      .catch(error => {
        if (error.body.error.errors) {
          dispatch(signUpUserFailure(error.body.error.errors[0].message));
        } else {
          dispatch(signUpUserFailure(error.body.error));
        }
      })
  }
}

