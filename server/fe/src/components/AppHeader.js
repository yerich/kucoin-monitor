import {useAuth} from "../utils/auth";
import {Link} from "react-router-dom";
import React from "react";

export function AppHeader() {
  const auth = useAuth();

  return <div className="app-header">
    <div className="app-header-inner">
      <div className="app-header-title">
        <Link to="/">Kucoin Monitor</Link>
      </div>
      <div className="app-header-login">
        {!auth.session && <Link to="/login">Login</Link>}
        {auth.session && <>
          {auth.session.email}
          <button onClick={auth.destroySession} className="logout">Logout</button>
        </>}
      </div>
    </div>
  </div>
}
