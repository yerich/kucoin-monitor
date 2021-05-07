import React, {useEffect, useState} from "react";
import {
  useLocation,
  Redirect,
} from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function GoogleOAuth() {
  let query = useQuery();

  let code = query.get("code");

  useEffect(async () => {
    if (code) {
      const result = await fetch("/api/login/google-auth-response", {
        method: "POST",
        body: JSON.stringify({
          code: query.get("code"),
          scope: query.get("scope"),
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await result.json();
      console.log("Login result:", data);
    }
  }, [code]);

  if (!code) {
    return <Redirect to={{path: "/"}} />
  }

  return <div>
    <h1>Please wait...</h1>
  </div>;
}
