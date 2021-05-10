import React, {useEffect, useState} from "react";
import {useAuth} from "../utils/auth";

export function Login() {
  const [loginUrl, setLoginUrl] = useState("");
  let auth = useAuth();

  useEffect(() => {
    async function getLoginUrl() {
      const loginUrl = await auth.getGoogleSignInUrl();
      setLoginUrl(loginUrl);
    }
    getLoginUrl();
  }, [auth])

  return <div>
    <h1>Please login with Google</h1>

    <p>Note: only authorized users may currently access this app.</p>

    {loginUrl && <a href={loginUrl}>Login with Google &raquo;</a>}
  </div>;
}
