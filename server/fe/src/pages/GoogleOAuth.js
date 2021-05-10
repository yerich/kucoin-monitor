import React, {useEffect, useState} from "react";
import {
  Redirect,
  Link,
} from "react-router-dom";
import {useAuth} from "../utils/auth";
import {useQuery} from "../utils/query";

export function GoogleOAuth() {
  const query = useQuery();
  const auth = useAuth();

  const code = query.get("code");
  const scope = query.get("scope");

  const [loginFailed, setLoginFailed] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    async function tryLogin () {
      const loginResult = await auth.googleSignIn(code, scope);
      if (loginResult) {
        setLoginSuccess(true);
      } else {
        setLoginFailed(true);
      }
    }
    tryLogin();
  }, [auth, code, scope]);

  if (!code || loginSuccess) {
    return <Redirect to="/" />;
  }

  return <div>
    {loginFailed && <p>Unauthorized user <Link to="/">Back to homepage</Link></p>}
    {!loginFailed && !loginSuccess && <h1>Please wait...</h1>}
  </div>;
}
