import './App.scss';
import React from "react"
import {Login} from "./pages/Login";
import {GoogleOAuth} from "./pages/GoogleOAuth";
import {AppHeader} from "./components/AppHeader";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import {ProvideAuth} from "./utils/auth";
import {Homepage} from "./pages/Homepage";

function App() {
  return (
    <ProvideAuth>
      <Router>
        <div className="app-wrapper">
          <AppHeader/>
          <div className="content">
            <Switch>
              <Route exact path="/">
                <Homepage />
              </Route>
              <Route exact path="/login">
                <Login/>
              </Route>
              <Route exact path="/google-oauth">
                <GoogleOAuth/>
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    </ProvideAuth>
  );
}

export default App;
