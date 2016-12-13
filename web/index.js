import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';
import appReducer from './ducks';
import AppContainer from './containers/AppContainer';
import { requireAuthentication } from './utils';
import { loginUserSuccess } from './ducks/auth';
import HomeContainer from './containers/HomeContainer';
import SignUpContainer from './containers/SignUpContainer';
import SignInContainer from './containers/SignInContainer';
import DataStoresContainer from './containers/DataStoresContainer';
import FormsContainer from './containers/FormsContainer';
import FormDetailsContainer from './containers/FormDetailsContainer';
import DataStoresDetailsContainer from './containers/DataStoresDetailsContainer';
import DataContainer from './containers/DataContainer';
import TriggersContainer from './containers/TriggersContainer';
import TriggerDetailsContainer from './containers/TriggerDetailsContainer';
import TeamsContainer from './containers/TeamsContainer';

import './style/Globals.less';

// combine all the reducers into a single reducing function
const rootReducer = combineReducers({
  sc: appReducer,
  routing: routerReducer,
});

// create the redux store that holds the state for this app
// http://redux.js.org/docs/api/createStore.html
const middleware = routerMiddleware(browserHistory);
const store = createStore(
  rootReducer,
  applyMiddleware(middleware, thunk, createLogger()), // logger must be the last in the chain
);

const token = localStorage.getItem('token');
if (token !== null) {
  store.dispatch(loginUserSuccess(token));
}

// create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

// wrap the App component with the react-redux Provider component to make the
// store available to all container components without passing it down
// explicitly as a prop
render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" name="Home" component={AppContainer}>
        <IndexRoute component={requireAuthentication(HomeContainer)} />
        <Route path="/login" name="Login" component={SignInContainer} />
        <Route path="/signup" name="Sign Up" component={SignUpContainer} />
        <Route path="/stores" name="Stores" component={requireAuthentication(DataStoresContainer)}>
          <Route
            path="/stores/:id" staticName
            component={requireAuthentication(DataStoresDetailsContainer)}
          />
        </Route>
        <Route path="/forms" name="Forms" component={requireAuthentication(FormsContainer)}>
          <Route
            path="/forms/:form_key" staticName
            component={requireAuthentication(FormDetailsContainer)}
          />
        </Route>
        <Route
          path="/triggers" name="Triggers" component={requireAuthentication(TriggersContainer)}
        >
          <Route
            path="/triggers/:id" staticName
            component={requireAuthentication(TriggerDetailsContainer)}
          />
        </Route>
        <Route path="/data" name="Data" component={requireAuthentication(DataContainer)} />
        <Route path="/teams" name="User" component={requireAuthentication(TeamsContainer)} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root'),
);
