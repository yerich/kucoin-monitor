import './App.scss';
import React from "react"
import Login from "./pages/Login";
import GoogleOAuth from "./pages/GoogleOAuth";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Switch>
          <Route exact path="/">
            <Link to="/login">Login</Link>
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/google-oauth">
            <GoogleOAuth />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
