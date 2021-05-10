import {useContext, useEffect, useState} from "react";
import {Redirect, Route} from "react-router-dom";

const {createContext} = require("react");

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [session, setSession] = useState(null);

  const getGoogleSignInUrl = async () => {
    const result = await fetch("/api/login/google-url");
    const data = await result.json();
    return data.url;
  }

  const googleSignIn = async (code, scope) => {
    const result = await fetch("/api/login/google-auth-response", {
      method: "POST",
      body: JSON.stringify({code, scope}),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await result.json();
    if (data.success) {
      setSession(data);
    }
    return !!data.success;
  }

  const checkSession = async () => {
    const result = await fetch("/api/login/session");
    const data = await result.json();
    if (data.success) {
      console.log("Session:", data.sessionInfo);
      setSession(data.sessionInfo);
    }
  }

  const destroySession = async () => {
    const result = await fetch("/api/login/sign-out");
    const data = await result.json();
    if (data.success) {
      setSession(null);
    }
  }

  useEffect(() => {
    checkSession();
  }, [])

  return {
    session,
    getGoogleSignInUrl,
    googleSignIn,
    checkSession,
    destroySession,
  }
}

export function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.session ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
